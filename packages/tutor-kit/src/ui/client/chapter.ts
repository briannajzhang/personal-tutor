export function chapterClientJs(): string {
  return `
async function renderChapter(textbookId, chapterId) {
  const token = beginRouteLoad("Loading chapter...");
  const chapter = await fetchJson(\`/api/textbooks/\${encodeURIComponent(textbookId)}/chapters/\${encodeURIComponent(chapterId)}\`);
  if (token !== routeToken) return;
  const glossaryStudyState = await loadGlossaryStudyState(textbookId);
  if (token !== routeToken) return;
  const highlightState = await loadChapterHighlights(textbookId, chapterId);
  if (token !== routeToken) return;
  activeChapter = chapter;
  activeChapterHighlights = highlightState.highlights;
  const renderContext = { textbookId, chapter, glossaryStudyState };
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: chapter.textbookTitle, action: "textbook", textbookId },
        { label: chapter.title }
      ])}
      <div class="page-head">
        <h1>\${escapeHtml(chapter.title)}</h1>
        <div class="meta">\${chapter.sectionCount} sections / \${chapter.subsectionCount} subsections</div>
      </div>
      <div class="chapter-layout">
        <aside class="chapter-index" aria-label="Chapter sections">
          <details data-chapter-tools open>
            <summary class="chapter-tools-summary">
              <span>Chapter tools</span>
              <span class="chapter-tools-summary-meta">Contents and highlights</span>
            </summary>
            <div class="chapter-tools-body">
              <div class="index-label">Contents</div>
              <div class="index-list">
                \${chapter.sections.map((section) => \`
                  <a class="index-link" href="#\${escapeAttr(anchorId(section.id))}">\${escapeHtml(section.title)}</a>
                  \${section.subsections.map((subsection) => \`
                    <a class="index-link subsection" href="#\${escapeAttr(anchorId(subsection.id))}">\${escapeHtml(subsection.title)}</a>
                  \`).join("")}
              \`).join("")}
              </div>
              <div class="chapter-highlights" data-highlight-list hidden></div>
            </div>
          </details>
        </aside>
        <div class="chapter-content">
          \${chapter.sections.map((section) => renderSection(section, renderContext)).join("")}
          \${renderChapterNavigation(chapter)}
        </div>
      </div>
    </section>
  \`;
  syncChapterToolsDisclosure();
  bindCrumbs();
  bindChapterIndex();
  bindChapterNavigation(textbookId);
  bindGlossaryOverviewLinks();
  bindGlossaryStarControls(textbookId);
  bindHighlighter(chapter);
  applyChapterHighlights(chapter);
  renderChapterHighlightsList(chapter);
  bindQuizzes(chapter);
  bindCodingProblems(chapter);
  scheduleTransformationLayouts();
  void renderDiagrams();
  if (document.fonts?.ready) void document.fonts.ready.then(scheduleTransformationLayouts);
  finishRouteLoad(token);
  scrollToHashTarget(window.location.hash, "auto");
}

function syncChapterToolsDisclosure() {
  const disclosure = document.querySelector("[data-chapter-tools]");
  if (!disclosure) return;
  const compact = window.matchMedia?.("(max-width: 860px)").matches ?? window.innerWidth <= 860;
  if (disclosure.dataset.compact === String(compact)) return;
  disclosure.dataset.compact = String(compact);
  disclosure.open = !compact;
}

function renderChapterNavigation(chapter) {
  if (!chapter.previousChapter && !chapter.nextChapter) return "";
  return \`
    <nav class="chapter-navigation" aria-label="Chapter navigation">
      \${chapter.previousChapter ? \`
        <button class="chapter-navigation-button previous" data-chapter-navigation="\${escapeAttr(chapter.previousChapter.id)}">
          <span class="chapter-navigation-label">Previous chapter</span>
          <span class="chapter-navigation-title">\${escapeHtml(chapter.previousChapter.title)}</span>
        </button>
      \` : ""}
      \${chapter.nextChapter ? \`
        <button class="chapter-navigation-button next" data-chapter-navigation="\${escapeAttr(chapter.nextChapter.id)}">
          <span class="chapter-navigation-label">Next chapter</span>
          <span class="chapter-navigation-title">\${escapeHtml(chapter.nextChapter.title)}</span>
        </button>
      \` : ""}
    </nav>
  \`;
}

function bindChapterNavigation(textbookId) {
  document.querySelectorAll("[data-chapter-navigation]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateChapter(textbookId, button.dataset.chapterNavigation, true);
    });
  });
}

function bindChapterIndex() {
  document.querySelectorAll(".index-link[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href") ?? "";
      if (!hash || hash === "#") return;
      const id = parseHashId(hash);
      if (!id || !document.getElementById(id)) return;

      event.preventDefault();
      const nextUrl = window.location.pathname + window.location.search + hash;
      if (window.location.hash === hash) {
        history.replaceState(history.state, "", nextUrl);
      } else {
        history.pushState({}, "", nextUrl);
      }
      scrollToHashTarget(hash, "smooth");
    });
  });
}

function scrollToHashTarget(hash = window.location.hash, behavior = "auto") {
  const id = parseHashId(hash);
  if (!id) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ block: "start", behavior });
  return true;
}

function parseHashId(hash) {
  const value = String(hash ?? "");
  if (!value.startsWith("#") || value.length <= 1) return "";
  try {
    return decodeURIComponent(value.slice(1));
  } catch {
    return value.slice(1);
  }
}

function renderSection(section, context) {
  const sectionContext = { ...context, section, subsection: null };
  return \`
    <section class="chapter-section" id="\${escapeAttr(anchorId(section.id))}">
      <h2 class="section-title"\${highlightUnsupportedAttrs()}>\${escapeHtml(section.title)}</h2>
      \${section.description ? \`<div class="markdown"\${highlightUnsupportedAttrs()}><p>\${escapeHtml(section.description)}</p></div>\` : ""}
      <div class="blocks">\${section.blocks.map((block) => renderBlock(block, sectionContext)).join("")}</div>
      \${section.subsections.map((subsection) => \`
        <section class="subsection-block" id="\${escapeAttr(anchorId(subsection.id))}">
          <h3 class="subsection-title"\${highlightUnsupportedAttrs()}>\${escapeHtml(subsection.title)}</h3>
          \${subsection.description ? \`<div class="markdown"\${highlightUnsupportedAttrs()}><p>\${escapeHtml(subsection.description)}</p></div>\` : ""}
          <div class="blocks">\${subsection.blocks.map((block) => renderBlock(block, { ...context, section, subsection })).join("")}</div>
        </section>
      \`).join("")}
    </section>
  \`;
}

async function renderRoute() {
  const route = parseRoute(window.location.pathname);
  try {
    if (route.kind === "chapter") {
      await renderChapter(route.textbookId, route.chapterId);
      return;
    }
    if (route.kind === "textbookGlossaryStudy") {
      await renderTextbookGlossaryStudy(route.textbookId);
      return;
    }
    if (route.kind === "textbookGlossary") {
      await renderTextbookGlossary(route.textbookId);
      return;
    }
    if (route.kind === "textbook") {
      await renderTextbook(route.textbookId);
      return;
    }
    if (route.kind === "notFound") {
      routeToken += 1;
      finishRouteLoad(routeToken);
      renderNotFoundPage({
        title: "Page not found",
        message: \`No route matches \${route.path}. Return to your textbook library to keep studying.\`
      });
      return;
    }
    await renderHome();
  } catch (error) {
    finishRouteLoad();
    if (isNotFoundError(error)) {
      renderNotFoundPage(notFoundDetails(route));
      return;
    }
    renderRouteError(error);
  }
}

function parseRoute(pathname) {
  let parts;
  try {
    parts = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return { kind: "notFound", path: pathname };
  }
  if (parts.length === 0 || (parts.length === 1 && parts[0] === "textbooks")) {
    return { kind: "home" };
  }
  if (parts.length === 4 && parts[0] === "textbooks" && parts[1] && parts[2] === "chapters" && parts[3]) {
    return { kind: "chapter", textbookId: parts[1], chapterId: parts[3] };
  }
  if (parts.length === 4 && parts[0] === "textbooks" && parts[1] && parts[2] === "glossary" && parts[3] === "study") {
    return { kind: "textbookGlossaryStudy", textbookId: parts[1] };
  }
  if (parts.length === 3 && parts[0] === "textbooks" && parts[1] && parts[2] === "glossary") {
    return { kind: "textbookGlossary", textbookId: parts[1] };
  }
  if (parts.length === 2 && parts[0] === "textbooks" && parts[1]) {
    return { kind: "textbook", textbookId: parts[1] };
  }
  return { kind: "notFound", path: pathname };
}

function navigateHome() {
  history.pushState({}, "", "/");
  void renderRoute();
}

function navigateTextbook(textbookId) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}\`);
  void renderRoute();
}

function navigateTextbookGlossary(textbookId) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/glossary\`);
  void renderRoute();
}

function navigateTextbookGlossaryStudy(textbookId, studySet = "all") {
  const safeStudySet = studySet === "starred" ? "starred" : "all";
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/glossary/study?set=\${safeStudySet}\`);
  void renderRoute();
}

function bindGlossaryOverviewLinks() {
  document.querySelectorAll("[data-glossary-overview]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const textbookId = link.dataset.glossaryOverview;
      if (!textbookId) return;
      event.preventDefault();
      navigateTextbookGlossary(textbookId);
    });
  });
}

function navigateChapter(textbookId, chapterId, scrollToTop = false) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/chapters/\${encodeURIComponent(chapterId)}\`);
  if (scrollToTop) window.scrollTo({ top: 0, behavior: "auto" });
  void renderRoute();
}

function renderBlock(block, context) {
  if (block.kind === "p" || block.kind === "explanation" || block.kind === "blurb") {
    const title = block.props.title ? \`<h4 class="local-heading">\${escapeHtml(block.props.title)}</h4>\` : "";
    return \`<article class="block">\${title}<div class="markdown"\${highlightAnchorAttrs(block, context)}>\${renderMarkdown(block.props.body)}</div></article>\`;
  }
  if (block.kind === "heading") {
    return \`<h\${block.props.level} class="local-heading level-\${block.props.level}"\${highlightUnsupportedAttrs()}>\${escapeHtml(block.props.text)}</h\${block.props.level}>\`;
  }
  if (block.kind === "list") {
    const tag = block.props.style === "number" ? "ol" : "ul";
    return \`<div class="block markdown"\${highlightAnchorAttrs(block, context)}><\${tag}>\${block.props.items.map((item) => \`<li>\${renderInlineMarkdown(item)}</li>\`).join("")}</\${tag}></div>\`;
  }
  if (block.kind === "codeBlock") {
    const language = block.props.language ? \` data-language="\${escapeAttr(block.props.language)}"\` : "";
    return \`<pre class="code-block"\${language}\${highlightUnsupportedAttrs()}><code>\${escapeHtml(block.props.code)}</code></pre>\`;
  }
  if (block.kind === "mathBlock") {
    return \`<div class="math-block"\${highlightUnsupportedAttrs()}>\${renderMath(block.props.body, true)}</div>\`;
  }
  if (block.kind === "diagram") {
    return renderDiagram(block);
  }
  if (block.kind === "chart") {
    return renderChart(block);
  }
  if (block.kind === "image") {
    return renderImage(block, context);
  }
  if (block.kind === "callout") {
    const title = block.props.title ? block.props.title : block.props.tone.replace("-", " ");
    return \`<aside class="callout \${escapeAttr(block.props.tone)}"><div class="callout-title"\${highlightUnsupportedAttrs()}>\${escapeHtml(title)}</div><div class="markdown"\${highlightAnchorAttrs(block, context)}>\${renderMarkdown(block.props.body)}</div></aside>\`;
  }
  if (block.kind === "glossary") {
    return renderGlossary(block, context);
  }
  if (block.kind === "transformation") {
    return renderTransformation(block);
  }
  if (block.kind === "codingProblem") {
    return renderCodingProblem(block);
  }
  if (block.kind === "quiz") {
    return renderQuiz(block);
  }
  return \`<article class="block"\${highlightUnsupportedAttrs()}><div class="markdown"><p>Unsupported block: \${escapeHtml(block.kind)}</p></div></article>\`;
}

function highlightAnchorAttrs(block, context) {
  const sectionId = context?.section?.id ?? "";
  const subsectionId = context?.subsection?.id ?? "";
  return [
    ' data-highlight-anchor="true"',
    \` data-highlight-block="\${escapeAttr(block.id)}"\`,
    \` data-highlight-section="\${escapeAttr(sectionId)}"\`,
    subsectionId ? \` data-highlight-subsection="\${escapeAttr(subsectionId)}"\` : ""
  ].join("");
}

function highlightUnsupportedAttrs() {
  return ' data-highlight-unsupported="true"';
}

function renderDiagram(block) {
  const title = block.props.title
    ? \`<h4 class="diagram-title">\${escapeHtml(block.props.title)}</h4>\`
    : "";
  return \`
    <article class="block diagram" data-diagram="\${escapeAttr(block.id)}"\${highlightUnsupportedAttrs()}>
      \${title}
      <div class="diagram-body" data-diagram-body>
        <pre class="diagram-source code-block" data-diagram-source>\${escapeHtml(block.props.body)}</pre>
      </div>
    </article>
  \`;
}

async function renderDiagrams() {
  const diagrams = [...document.querySelectorAll("[data-diagram]")];
  if (diagrams.length === 0) return;
  let mermaid;
  try {
    mermaid = await loadMermaid();
  } catch (error) {
    diagrams.forEach((element) => renderDiagramError(element, error));
    return;
  }
  for (const element of diagrams) {
    if (element.dataset.diagramRendered === "true") continue;
    const source = element.querySelector("[data-diagram-source]")?.textContent ?? "";
    const target = element.querySelector("[data-diagram-body]");
    if (!target || !source.trim()) continue;
    try {
      const id = "diagram_" + stableHash(element.dataset.diagram + ":" + source);
      await mermaid.parse(source, { suppressErrors: false });
      const result = await mermaid.render(id, source, target);
      target.innerHTML = result.svg;
      result.bindFunctions?.(target);
      element.dataset.diagramRendered = "true";
    } catch (error) {
      renderDiagramError(element, error);
    }
  }
}

function renderDiagramError(element, error) {
  const target = element.querySelector("[data-diagram-body]");
  const source = element.querySelector("[data-diagram-source]")?.textContent ?? "";
  if (!target) return;
  target.innerHTML = \`
    <div class="diagram-error">Diagram could not be rendered.</div>
    <pre class="diagram-source code-block">\${escapeHtml(source || String(error?.message ?? error ?? ""))}</pre>
  \`;
  element.dataset.diagramRendered = "error";
}

function renderChart(block) {
  return \`
    <article class="block chart"\${highlightUnsupportedAttrs()}>
      <h4 class="chart-title">\${escapeHtml(block.props.title)}</h4>
      <div class="chart-body">\${renderChartSvg(block.props)}</div>
    </article>
  \`;
}

function renderImage(block, context) {
  const src = imageAssetUrl(block.props.src, context);
  const caption = block.props.caption ? escapeHtml(block.props.caption) : "";
  const credit = block.props.credit ? \`<span class="image-block-credit">\${escapeHtml(block.props.credit)}</span>\` : "";
  const separator = caption && credit ? " " : "";
  const figcaption = caption || credit
    ? \`<figcaption class="image-block-caption">\${caption}\${separator}\${credit}</figcaption>\`
    : "";
  return \`
    <figure class="block image-block"\${highlightUnsupportedAttrs()}>
      <img class="image-block-media" src="\${escapeAttr(src)}" alt="\${escapeAttr(block.props.alt)}" loading="lazy" decoding="async">
      \${figcaption}
    </figure>
  \`;
}

function imageAssetUrl(src, context) {
  if (!isTextbookAssetSrc(src)) return "";
  const textbookId = context?.textbookId ?? "";
  if (!textbookId) return "";
  return \`/__tutor-assets/textbooks/\${encodeURIComponent(textbookId)}/\${encodeAssetPath(src)}\`;
}

function isTextbookAssetSrc(src) {
  if (typeof src !== "string" || !src.startsWith("assets/")) return false;
  if (src.includes("\\\\") || src.includes("\\0")) return false;
  return !src.split("/").some((part) => part === "" || part === "." || part === "..");
}

function encodeAssetPath(src) {
  return src.split("/").map((part) => encodeURIComponent(part)).join("/");
}

function renderChartSvg(props) {
  const points = Array.isArray(props.points)
    ? props.points
      .map((point) => ({
        label: String(point?.label ?? ""),
        value: Number(point?.value)
      }))
      .filter((point) => point.label.trim() && Number.isFinite(point.value))
    : [];
  if (points.length === 0) {
    return \`<div class="diagram-error">Chart has no valid points.</div>\`;
  }

  const width = 720;
  const height = 340;
  const margin = { top: 24, right: 26, bottom: 70, left: 62 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const scale = chartScale(props, points);
  const minValue = scale.minValue;
  const maxValue = scale.maxValue;
  const yForValue = (value) => margin.top + ((maxValue - value) / (maxValue - minValue)) * plotHeight;
  const zeroY = yForValue(0);
  const ticks = scale.ticks;
  const chartContent = props.type === "line"
    ? renderLineChart(points, margin, plotWidth, plotHeight, yForValue)
    : renderBarChart(points, margin, plotWidth, zeroY, yForValue);
  const xLabel = props.xLabel ? \`<text class="chart-axis-label" x="\${width / 2}" y="\${height - 10}" text-anchor="middle">\${escapeHtml(props.xLabel)}</text>\` : "";
  const yLabel = props.yLabel ? \`<text class="chart-axis-label" x="16" y="\${height / 2}" text-anchor="middle" transform="rotate(-90 16 \${height / 2})">\${escapeHtml(props.yLabel)}</text>\` : "";

  return \`
    <svg class="chart-svg" viewBox="0 0 \${width} \${height}" role="img" aria-label="\${escapeAttr(props.title)}">
      <title>\${escapeHtml(props.title)}</title>
      \${ticks.map((tick) => {
        const y = yForValue(tick);
        return \`
          <line class="chart-grid" x1="\${margin.left}" y1="\${formatNumber(y)}" x2="\${width - margin.right}" y2="\${formatNumber(y)}"></line>
          <text class="chart-value" x="\${margin.left - 10}" y="\${formatNumber(y + 4)}" text-anchor="end">\${escapeHtml(formatTick(tick))}</text>
        \`;
      }).join("")}
      <line class="chart-axis" x1="\${margin.left}" y1="\${formatNumber(margin.top)}" x2="\${margin.left}" y2="\${formatNumber(height - margin.bottom)}"></line>
      <line class="chart-axis" x1="\${margin.left}" y1="\${formatNumber(zeroY)}" x2="\${width - margin.right}" y2="\${formatNumber(zeroY)}"></line>
      \${chartContent}
      \${xLabel}
      \${yLabel}
    </svg>
  \`;
}

function renderBarChart(points, margin, plotWidth, zeroY, yForValue) {
  const step = plotWidth / points.length;
  const barWidth = Math.max(10, Math.min(64, step * 0.58));
  return points.map((point, index) => {
    const centerX = margin.left + step * index + step / 2;
    const y = yForValue(point.value);
    const top = Math.min(y, zeroY);
    const height = Math.abs(zeroY - y);
    return \`
      <rect class="chart-bar" x="\${formatNumber(centerX - barWidth / 2)}" y="\${formatNumber(top)}" width="\${formatNumber(barWidth)}" height="\${formatNumber(height)}"></rect>
      <text class="chart-label" x="\${formatNumber(centerX)}" y="\${formatNumber(zeroY + 18)}" text-anchor="middle">\${escapeHtml(truncateChartLabel(point.label))}</text>
    \`;
  }).join("");
}

function renderLineChart(points, margin, plotWidth, plotHeight, yForValue) {
  const xForIndex = (index) => points.length === 1
    ? margin.left + plotWidth / 2
    : margin.left + (index / (points.length - 1)) * plotWidth;
  const path = points.map((point, index) => {
    const command = index === 0 ? "M" : "L";
    return command + formatNumber(xForIndex(index)) + " " + formatNumber(yForValue(point.value));
  }).join(" ");
  return \`
    <path class="chart-line" d="\${escapeAttr(path)}"></path>
    \${points.map((point, index) => {
      const x = xForIndex(index);
      return \`
        <circle class="chart-point" cx="\${formatNumber(x)}" cy="\${formatNumber(yForValue(point.value))}" r="4"></circle>
        <text class="chart-label" x="\${formatNumber(x)}" y="\${formatNumber(margin.top + plotHeight + 22)}" text-anchor="middle">\${escapeHtml(truncateChartLabel(point.label))}</text>
      \`;
    }).join("")}
  \`;
}

function chartScale(props, points) {
  const values = points.map((point) => point.value);
  const rawMin = Math.min(0, ...values);
  const rawMax = Math.max(0, ...values);
  if (isPercentChart(props, values)) {
    return { minValue: 0, maxValue: 100, ticks: [0, 25, 50, 75, 100] };
  }
  const ticks = chartTicks(rawMin, rawMax);
  return {
    minValue: ticks[0],
    maxValue: ticks[ticks.length - 1],
    ticks
  };
}

function isPercentChart(props, values) {
  const yLabel = String(props?.yLabel ?? "").toLowerCase();
  if (!yLabel.includes("%") && !yLabel.includes("percent")) return false;
  return values.every((value) => value >= 0 && value <= 100);
}

function chartTicks(minValue, maxValue) {
  if (minValue === maxValue) {
    minValue -= 1;
    maxValue += 1;
  }
  const step = niceChartStep(maxValue - minValue);
  const start = Math.floor(minValue / step) * step;
  const end = Math.ceil(maxValue / step) * step;
  const ticks = [];
  for (let tick = start; tick <= end + step / 2; tick += step) {
    ticks.push(normalizeChartTick(tick));
  }
  return ticks.length >= 2 ? ticks : [start, start + step].map(normalizeChartTick);
}

function niceChartStep(range) {
  const targetSteps = 5;
  const roughStep = Math.abs(range) / targetSteps;
  if (!Number.isFinite(roughStep) || roughStep === 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const fraction = roughStep / magnitude;
  let niceFraction = 10;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 2.5) niceFraction = 2.5;
  else if (fraction <= 5) niceFraction = 5;
  return niceFraction * magnitude;
}

function normalizeChartTick(value) {
  if (Object.is(value, -0)) return 0;
  return Math.round(value * 1e12) / 1e12;
}

function formatTick(value) {
  if (Math.abs(value) >= 100) return String(Math.round(value));
  if (Math.abs(value) >= 10) return String(Math.round(value * 10) / 10);
  return String(Math.round(value * 100) / 100);
}

function truncateChartLabel(value) {
  const label = String(value ?? "");
  return label.length > 14 ? label.slice(0, 13) + "..." : label;
}

function formatNumber(value) {
  return String(Math.round(value * 100) / 100);
}
`;
}
