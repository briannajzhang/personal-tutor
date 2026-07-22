export function componentsClientJs(): string {
  return `
const components = new Map();

function renderComponent(block, context) {
  const instanceId = block.id;
  components.set(instanceId, { block, context, record: null });
  const title = block.props.title ? \`<h4 class="tutor-component-title">\${escapeHtml(block.props.title)}</h4>\` : "";
  return \`
    <article class="block tutor-component" data-tutor-component data-component-instance="\${escapeAttr(instanceId)}" data-highlight-unsupported="true">
      \${title}
      <div class="tutor-component-surface">
        <div class="tutor-component-root" data-tutor-component-root></div>
        <div class="tutor-component-status" data-tutor-component-status role="status" aria-live="polite">Loading interactive component</div>
      </div>
    </article>
  \`;
}

function mountRenderedComponents() {
  document.querySelectorAll("[data-tutor-component]").forEach((host) => {
    if (!host.dataset.componentMounted) void mountComponentHost(host);
  });
}

async function mountComponentHost(host, suppliedDefinition) {
  const instanceId = host.dataset.componentInstance;
  const component = components.get(instanceId);
  if (!instanceId || !component) {
    renderComponentError(host, new Error("Tutor Kit could not find this component instance."));
    return;
  }
  const root = host.querySelector("[data-tutor-component-root]");
  if (!(root instanceof HTMLElement)) {
    renderComponentError(host, new Error("Tutor Kit could not create a component mount element."));
    return;
  }

  const controller = new AbortController();
  const record = {
    instanceId,
    moduleUrl: component.block.props.moduleUrl,
    host,
    root,
    controller,
    cleanup: null,
    cleanupPromise: null,
    disposed: false
  };
  component.record = record;
  host.dataset.componentMounted = "true";
  host.dataset.componentState = "loading";

  try {
    const definition = suppliedDefinition ?? (await import(component.block.props.moduleUrl)).default;
    if (typeof definition !== "function") {
      throw new Error("The default export must be created with defineComponent(...)." );
    }
    const cleanup = await definition(componentContext(component, record));
    if (cleanup !== undefined && typeof cleanup !== "function") {
      throw new Error("A component mount function may only return a cleanup function or nothing.");
    }
    record.cleanup = cleanup ?? null;
    if (record.disposed || record.controller.signal.aborted || component.record !== record) {
      await runComponentCleanup(record);
      return;
    }
    host.querySelector("[data-tutor-component-status]")?.remove();
    host.dataset.componentState = "ready";
  } catch (error) {
    if (record.disposed || record.controller.signal.aborted || component.record !== record) return;
    renderComponentError(host, error);
  }
}

function componentContext(component, record) {
  const context = component.context;
  const location = {
    textbookId: context.textbookId,
    chapterId: context.chapter.id,
    sectionId: context.section.id,
    subsectionId: context.subsection?.id,
    blockId: component.block.id
  };
  return {
    root: record.root,
    host: record.host,
    props: component.block.props.props,
    signal: record.controller.signal,
    location,
    services: {
      assets: {
        url(path) {
          if (!isTextbookAssetSrc(path)) throw new Error("Component assets must use a path under assets/.");
          return \`/__tutor-assets/textbooks/\${encodeURIComponent(location.textbookId)}/\${encodeAssetPath(path)}\`;
        }
      },
      events: {
        async emit(type, payload = null) {
          if (typeof type !== "string" || !type.trim()) throw new Error("Component event types must be nonempty strings.");
          await fetchJson("/api/events", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ type, payload, ...location })
          });
        }
      },
      theme: componentTheme()
    }
  };
}

function componentTheme() {
  const styles = getComputedStyle(document.documentElement);
  const baseNames = ["--paper", "--panel", "--panel-soft", "--ink", "--ink-soft", "--muted", "--line", "--accent", "--accent-2"];
  const colorNames = ["red", "orange", "yellow", "green", "blue", "indigo", "violet", "success", "danger", "warning", "info", "category-1", "category-2", "category-3"];
  const colorVariants = ["", "-soft", "-border", "-strong"];
  const names = [
    ...baseNames,
    ...colorNames.flatMap((color) => colorVariants.map((variant) => \`--tutor-color-\${color}\${variant}\`))
  ];
  return {
    mode: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    tokens: Object.freeze(Object.fromEntries(names.map((name) => [name, styles.getPropertyValue(name).trim()])))
  };
}

async function unmountAllComponents() {
  const records = [...components.values()].map((component) => component.record).filter(Boolean);
  components.clear();
  await Promise.all(records.map((record) => disposeComponent(record)));
}

async function disposeComponent(record) {
  if (record.disposed) return record.cleanupPromise;
  record.disposed = true;
  record.controller.abort();
  record.host.removeAttribute("data-component-mounted");
  const component = components.get(record.instanceId);
  if (component?.record === record) component.record = null;
  return runComponentCleanup(record);
}

async function runComponentCleanup(record) {
  if (record.cleanupPromise) return record.cleanupPromise;
  if (!record.cleanup) return;
  const cleanup = record.cleanup;
  record.cleanup = null;
  record.cleanupPromise = Promise.resolve()
    .then(() => cleanup())
    .catch((error) => console.error("Tutor component cleanup failed", error));
  return record.cleanupPromise;
}

function renderComponentError(host, error) {
  host.dataset.componentState = "error";
  host.querySelector("[data-tutor-component-status]")?.remove();
  const root = host.querySelector("[data-tutor-component-root]");
  root.replaceChildren();
  const panel = document.createElement("div");
  panel.className = "tutor-component-error";
  panel.setAttribute("role", "alert");
  panel.innerHTML = "<strong>Interactive component could not load</strong><pre></pre>";
  panel.querySelector("pre").textContent = error?.stack || error?.message || String(error);
  root.append(panel);
}

async function updateTutorComponent(moduleUrl, definition) {
  const records = [...components.values()].map((component) => component.record).filter((record) => record?.moduleUrl === moduleUrl);
  for (const record of records) {
    const host = record.host;
    await disposeComponent(record);
    host.querySelector("[data-tutor-component-root]")?.replaceChildren();
    host.querySelector(".tutor-component-surface")?.insertAdjacentHTML(
      "beforeend",
      '<div class="tutor-component-status" data-tutor-component-status role="status" aria-live="polite">Updating interactive component</div>'
    );
    await mountComponentHost(host, definition);
  }
}

globalThis.__tutorComponentRuntime = {
  update(moduleUrl, definition) {
    void updateTutorComponent(moduleUrl, definition);
  }
};
`;
}
