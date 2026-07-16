export function quizzesClientJs(): string {
  return `
function renderQuiz(block) {
  return \`
    <article class="block quiz" data-quiz="\${escapeAttr(block.id)}"\${highlightUnsupportedAttrs()}>
      <div class="quiz-head">
        <h4 class="quiz-title">\${escapeHtml(block.props.title)}</h4>
        <div class="quiz-meta">\${escapeHtml(formatQuizMode(block.props.mode))} / \${block.props.questions.length} questions</div>
      </div>
      <form class="quiz-form">
        \${block.props.questions.map((question, index) => renderQuizQuestion(block, question, index)).join("")}
        <div class="quiz-footer">
          <div class="quiz-actions">
            <button class="quiz-check" type="button" data-quiz-check>Check answers</button>
            <button class="quiz-reset" type="button" data-quiz-reset>Try again</button>
          </div>
          <div class="quiz-score" data-quiz-score hidden></div>
        </div>
      </form>
    </article>
  \`;
}

function renderQuizQuestion(block, question, index) {
  if (isMatchingQuestion(question)) return renderMatchingQuestion(block, question, index);
  const title = renderQuizQuestionTitle(block, question, index);
  return \`
    <fieldset class="quiz-question" data-quiz-question="\${escapeAttr(question.id)}" data-quiz-kind="choice" data-quiz-answer="\${escapeAttr(question.answer)}">
      <div class="quiz-question-title">\${title}</div>
      <div class="quiz-choices">
        \${question.choices.map((choice) => \`
          <label class="quiz-choice" data-quiz-choice="\${escapeAttr(choice.id)}">
            <input type="radio" name="\${escapeAttr(block.id)}-\${escapeAttr(question.id)}" value="\${escapeAttr(choice.id)}" />
            <span>\${renderInlineMarkdown(choice.body)}</span>
          </label>
        \`).join("")}
      </div>
      <div class="quiz-choice-feedback markdown" data-quiz-choice-feedback hidden></div>
      <div class="quiz-explanation markdown" data-quiz-explanation hidden>\${renderMarkdown(question.explanation)}</div>
    </fieldset>
  \`;
}

function renderMatchingQuestion(block, question, index) {
  const options = matchingOptions(block, question);
  const title = renderQuizQuestionTitle(block, question, index);
  return \`
    <fieldset class="quiz-question" data-quiz-question="\${escapeAttr(question.id)}" data-quiz-kind="matching">
      <div class="quiz-question-title">\${title}</div>
      <div class="quiz-matching">
        <div class="quiz-matching-head">
          <span>\${escapeHtml(question.leftLabel ?? "Prompt")}</span>
          <span>\${escapeHtml(question.rightLabel ?? "Match")}</span>
          <span aria-hidden="true"></span>
        </div>
        \${question.pairs.map((pair) => \`
          <div class="quiz-match-row" data-quiz-match-pair="\${escapeAttr(pair.id)}" data-quiz-match-answer="\${escapeAttr(pair.id)}">
            <div class="quiz-match-left">\${renderInlineMarkdown(pair.left)}</div>
            <select class="quiz-match-select" data-quiz-match-select aria-label="Choose match for \${escapeAttr(pair.left)}">
              <option value="">Choose...</option>
              \${options.map((option) => \`<option value="\${escapeAttr(option.id)}">\${escapeHtml(option.right)}</option>\`).join("")}
            </select>
            <span class="quiz-match-result" data-quiz-match-result></span>
          </div>
        \`).join("")}
      </div>
      <div class="quiz-explanation markdown" data-quiz-explanation hidden>\${renderMarkdown(question.explanation)}</div>
    </fieldset>
  \`;
}

function renderQuizQuestionTitle(block, question, index) {
  const prompt = renderInlineMarkdown(question.prompt);
  if (block.props.questions.length === 1) return prompt;
  return \`\${index + 1}. \${prompt}\`;
}

function matchingOptions(block, question) {
  return question.pairs
    .map((option) => ({ id: option.id, right: option.right }))
    .sort((left, right) => stableHash(\`\${block.id}:\${question.id}:\${left.id}\`) - stableHash(\`\${block.id}:\${question.id}:\${right.id}\`));
}

function isMatchingQuestion(question) {
  return question?.kind === "matching";
}

function formatQuizMode(mode) {
  return String(mode ?? "check").replace("-", " ");
}

function bindQuizzes(chapter) {
  quizStates.clear();
  collectChapterBlocks(chapter)
    .filter((block) => block.kind === "quiz")
    .forEach((block) => {
      const element = document.querySelector(\`[data-quiz="\${cssEscape(block.id)}"]\`);
      if (element) void hydrateQuiz(element, block, chapter);
    });
}

async function hydrateQuiz(element, block, chapter) {
  const state = { element, block, chapter, selectedAnswers: {}, submitted: false };
  quizStates.set(block.id, state);
  try {
    const persisted = await fetchJson(\`/api/quiz/state?\${quizQuery(chapter, block)}\`);
    state.selectedAnswers = persisted.selectedAnswers ?? {};
    state.submitted = persisted.submitted === true;
    restoreQuizState(state, persisted);
  } catch {
    // Quiz persistence is a convenience; the quiz remains usable without it.
  }
  element.querySelectorAll("input[type=radio]").forEach((input) => {
    input.addEventListener("change", () => {
      const questionId = input.closest("[data-quiz-question]")?.dataset.quizQuestion;
      if (!questionId) return;
      state.selectedAnswers[questionId] = input.value;
      void saveQuizSelections(state);
    });
  });
  bindMatchingBoards(element, state);
  const checkButton = element.querySelector("[data-quiz-check]");
  const resetButton = element.querySelector("[data-quiz-reset]");
  if (checkButton) {
    checkButton.addEventListener("click", () => checkQuizAnswers(state));
  }
  if (resetButton) {
    resetButton.addEventListener("click", () => resetQuiz(state));
  }
}

function bindMatchingBoards(element, state) {
  element.querySelectorAll('[data-quiz-kind="matching"]').forEach((questionElement) => {
    questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
      select.addEventListener("change", () => {
        if (state.submitted) return;
        const questionId = questionElement.dataset.quizQuestion;
        if (!questionId) return;
        normalizeMatchingSelections(questionElement);
        const selected = matchingSelection(questionElement);
        updateMatchingSelectOptions(questionElement);
        if (Object.keys(selected).length > 0) {
          state.selectedAnswers[questionId] = selected;
        } else {
          delete state.selectedAnswers[questionId];
        }
        void saveQuizSelections(state);
      });
    });
  });
}

async function checkQuizAnswers(state) {
  const { element, block, chapter } = state;
  let correct = 0;
  const responses = [];
  for (const question of block.props.questions) {
    const questionElement = element.querySelector(\`[data-quiz-question="\${cssEscape(question.id)}"]\`);
    if (!questionElement) continue;
    const isCorrect = isMatchingQuestion(question)
      ? checkMatchingQuestion(questionElement, question, state, responses)
      : checkChoiceQuestion(questionElement, question, state, responses);
    if (isCorrect) correct += 1;
  }

  const score = element.querySelector("[data-quiz-score]");
  if (score) {
    score.textContent = \`\${correct} / \${block.props.questions.length} correct\`;
    score.hidden = false;
  }
  state.submitted = true;
  await fetchJson("/api/quiz/attempt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: chapter.textbookId,
      chapterId: chapter.id,
      quizId: block.id,
      selectedAnswers: state.selectedAnswers,
      responses,
      score: correct,
      total: block.props.questions.length
    })
  });
}

function checkChoiceQuestion(questionElement, question, state, responses) {
  const selected = questionElement.querySelector("input:checked")?.value;
  const isCorrect = selected === question.answer;
  if (selected) {
    state.selectedAnswers[question.id] = selected;
    responses.push({ questionId: question.id, selectedAnswer: selected, correct: isCorrect });
  }
  applyChoiceFeedback(questionElement, question, selected);
  return isCorrect;
}

function applyChoiceFeedback(questionElement, question, selected) {
  questionElement.querySelectorAll("[data-quiz-choice]").forEach((choiceElement) => {
    const choiceId = choiceElement.dataset.quizChoice;
    choiceElement.classList.toggle("correct", choiceId === question.answer);
    choiceElement.classList.toggle("incorrect", Boolean(selected) && choiceId === selected && selected !== question.answer);
  });
  questionElement.querySelectorAll("input").forEach((input) => {
    input.disabled = true;
  });
  const choiceFeedback = questionElement.querySelector("[data-quiz-choice-feedback]");
  const selectedChoice = question.choices.find((choice) => choice.id === selected);
  const selectedFeedback = selected && selected !== question.answer ? selectedChoice?.explanation : undefined;
  if (choiceFeedback) {
    if (selectedFeedback) {
      choiceFeedback.innerHTML = \`<div class="quiz-choice-feedback-label">Why that choice misses</div>\${renderMarkdown(selectedFeedback)}\`;
      choiceFeedback.hidden = false;
    } else {
      choiceFeedback.innerHTML = "";
      choiceFeedback.hidden = true;
    }
  }
  const explanation = questionElement.querySelector("[data-quiz-explanation]");
  if (explanation) explanation.hidden = false;
}

function checkMatchingQuestion(questionElement, question, state, responses) {
  normalizeMatchingSelections(questionElement);
  updateMatchingSelectOptions(questionElement);
  const selected = matchingSelection(questionElement);
  const hasSelection = Object.keys(selected).length > 0;
  const isCorrect = matchingQuestionCorrect(question, selected);
  if (hasSelection) {
    state.selectedAnswers[question.id] = selected;
    responses.push({ questionId: question.id, selectedAnswer: selected, correct: isCorrect });
  } else {
    delete state.selectedAnswers[question.id];
  }
  applyMatchingFeedback(questionElement, question, selected);
  return isCorrect;
}

function matchingSelection(questionElement) {
  const selected = {};
  questionElement.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    const pairId = row.dataset.quizMatchPair;
    const value = row.querySelector("[data-quiz-match-select]")?.value;
    if (pairId && value) selected[pairId] = value;
  });
  return selected;
}

function normalizeMatchingSelections(questionElement) {
  const used = new Set();
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    const value = select.value;
    if (!value) return;
    if (used.has(value)) {
      select.value = "";
      return;
    }
    used.add(value);
  });
}

function updateMatchingSelectOptions(questionElement) {
  const selectedBySelect = new Map();
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    if (select.value) selectedBySelect.set(select, select.value);
  });
  const selectedValues = new Set(selectedBySelect.values());
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    const currentValue = selectedBySelect.get(select) ?? "";
    select.querySelectorAll("option").forEach((option) => {
      option.disabled = Boolean(option.value) && option.value !== currentValue && selectedValues.has(option.value);
    });
  });
}

function renderMatchingAssignments(questionElement, selectedAnswer) {
  const selected = isRecordObject(selectedAnswer) ? selectedAnswer : {};
  questionElement.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    const pairId = row.dataset.quizMatchPair;
    const select = row.querySelector("[data-quiz-match-select]");
    if (!pairId || !select) return;
    select.value = selected[pairId] ?? "";
    if (select.value !== (selected[pairId] ?? "")) {
      select.value = "";
    }
  });
  normalizeMatchingSelections(questionElement);
  updateMatchingSelectOptions(questionElement);
  return matchingSelection(questionElement);
}

function matchingQuestionCorrect(question, selected) {
  if (!isRecordObject(selected)) return false;
  return question.pairs.every((pair) => selected[pair.id] === pair.id);
}

function applyMatchingFeedback(questionElement, question, selectedAnswer) {
  const selected = renderMatchingAssignments(questionElement, selectedAnswer);
  questionElement.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    const pairId = row.dataset.quizMatchPair;
    const answer = row.dataset.quizMatchAnswer;
    const selectedRight = pairId ? selected[pairId] : undefined;
    const isCorrect = Boolean(selectedRight) && selectedRight === answer;
    row.classList.toggle("correct", isCorrect);
    row.classList.toggle("incorrect", !isCorrect);
    row.classList.remove("selected");
    const result = row.querySelector("[data-quiz-match-result]");
    if (result) {
      result.textContent = isCorrect ? "✓" : "!";
      result.setAttribute("aria-label", isCorrect ? "Correct" : "Incorrect");
    }
  });
  delete questionElement.dataset.quizActivePair;
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    select.disabled = true;
  });
  const explanation = questionElement.querySelector("[data-quiz-explanation]");
  if (explanation) explanation.hidden = false;
}

function resetQuiz(state) {
  const { element } = state;
  state.selectedAnswers = {};
  state.submitted = false;
  element.querySelectorAll("input").forEach((input) => {
    input.checked = false;
    input.disabled = false;
  });
  element.querySelectorAll("[data-quiz-kind='matching']").forEach((questionElement) => {
    delete questionElement.dataset.quizActivePair;
    questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
      select.disabled = false;
    });
    renderMatchingAssignments(questionElement, {});
  });
  element.querySelectorAll("[data-quiz-choice]").forEach((choiceElement) => {
    choiceElement.classList.remove("correct", "incorrect");
  });
  element.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    row.classList.remove("correct", "incorrect", "selected");
  });
  element.querySelectorAll("[data-quiz-match-result]").forEach((result) => {
    result.textContent = "";
    result.removeAttribute("aria-label");
  });
  element.querySelectorAll("[data-quiz-explanation]").forEach((explanation) => {
    explanation.hidden = true;
  });
  element.querySelectorAll("[data-quiz-choice-feedback]").forEach((feedback) => {
    feedback.innerHTML = "";
    feedback.hidden = true;
  });
  const score = element.querySelector("[data-quiz-score]");
  if (score) {
    score.textContent = "";
    score.hidden = true;
  }
  void saveQuizSelections(state);
}

function restoreQuizState(state, persisted) {
  for (const [questionId, answer] of Object.entries(state.selectedAnswers)) {
    if (typeof answer === "string") {
      const input = state.element.querySelector(\`[data-quiz-question="\${cssEscape(questionId)}"] input[value="\${cssEscape(answer)}"]\`);
      if (input) input.checked = true;
    } else if (isRecordObject(answer)) {
      const questionElement = state.element.querySelector(\`[data-quiz-question="\${cssEscape(questionId)}"][data-quiz-kind="matching"]\`);
      if (questionElement) {
        const normalized = renderMatchingAssignments(questionElement, answer);
        if (Object.keys(normalized).length > 0) {
          state.selectedAnswers[questionId] = normalized;
        } else {
          delete state.selectedAnswers[questionId];
        }
      }
    }
  }
  if (persisted.submitted) {
    void checkQuizAnswersLocally(state, persisted.score, persisted.total);
  }
}

function checkQuizAnswersLocally(state, persistedScore, persistedTotal) {
  const { element, block } = state;
  for (const question of block.props.questions) {
    const questionElement = element.querySelector(\`[data-quiz-question="\${cssEscape(question.id)}"]\`);
    if (!questionElement) continue;
    if (isMatchingQuestion(question)) {
      applyMatchingFeedback(questionElement, question, state.selectedAnswers[question.id]);
    } else {
      applyChoiceFeedback(questionElement, question, state.selectedAnswers[question.id]);
    }
  }
  const score = element.querySelector("[data-quiz-score]");
  if (score) {
    score.textContent = \`\${persistedScore ?? 0} / \${persistedTotal ?? block.props.questions.length} correct\`;
    score.hidden = false;
  }
}

async function saveQuizSelections(state) {
  await fetchJson("/api/quiz/state", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: state.chapter.textbookId,
      chapterId: state.chapter.id,
      quizId: state.block.id,
      selectedAnswers: state.selectedAnswers
    })
  });
}

function quizQuery(chapter, block) {
  return new URLSearchParams({
    textbookId: chapter.textbookId,
    chapterId: chapter.id,
    quizId: block.id
  }).toString();
}
`;
}
