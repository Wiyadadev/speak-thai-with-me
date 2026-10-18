(() => {
  "use strict";

  const LESSONS_URL = "data/lessons.json";
  const STORAGE_KEY = "speak-thai-with-me.completed-lessons";
  const list = document.querySelector("#lesson-list");
  const progressCount = document.querySelector("#progress-count");
  const progressTrack = document.querySelector(".progress-track");
  const progressFill = document.querySelector("#progress-fill");
  const resetButton = document.querySelector("#reset-progress");
  const storageNotice = document.querySelector("#storage-notice");
  const audioNotice = document.querySelector("#audio-notice");

  if (!(list instanceof HTMLElement)) return;

  let completedLessons = new Set();
  let storageAvailable = true;

  function showStorageMessage(message) {
    if (!(storageNotice instanceof HTMLElement)) return;
    storageNotice.textContent = message;
    storageNotice.hidden = false;
  }

  function showAudioMessage(message) {
    if (!(audioNotice instanceof HTMLElement)) return;
    audioNotice.textContent = message;
    audioNotice.hidden = false;
  }

  function readProgress() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === null) return;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
        throw new Error("Saved lesson progress has an unexpected format.");
      }
      completedLessons = new Set(parsed);
    } catch (error) {
      storageAvailable = false;
      console.error("Unable to read saved lesson progress.", error);
      showStorageMessage("Progress could not be read or saved in this browser. You can still use the lessons.");
    }
  }

  function saveProgress() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedLessons]));
      storageAvailable = true;
      if (storageNotice instanceof HTMLElement) storageNotice.hidden = true;
    } catch (error) {
      storageAvailable = false;
      console.error("Unable to save lesson progress.", error);
      showStorageMessage("Your quiz worked, but progress could not be saved in this browser.");
    }
  }

  function updateProgress(total) {
    const completed = [...completedLessons].filter((id) => document.querySelector(`[data-lesson-id="${CSS.escape(id)}"]`)).length;
    if (progressCount) progressCount.textContent = `${completed} of ${total} lessons completed`;
    if (progressTrack instanceof HTMLElement) {
      progressTrack.setAttribute("aria-valuemax", String(total));
      progressTrack.setAttribute("aria-valuenow", String(completed));
    }
    if (progressFill instanceof HTMLElement) progressFill.style.width = total ? `${(completed / total) * 100}%` : "0%";
    document.querySelectorAll("[data-lesson-id]").forEach((card) => {
      if (!(card instanceof HTMLElement)) return;
      const isComplete = completedLessons.has(card.dataset.lessonId || "");
      card.classList.toggle("is-complete", isComplete);
      const badge = card.querySelector(".completion-badge");
      if (badge instanceof HTMLElement) badge.hidden = !isComplete;
    });
  }

  function makeSpeakButton(thai, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "speak-button";
    button.textContent = "Hear Thai";
    button.setAttribute("aria-label", `Hear Thai pronunciation: ${label}`);
    button.addEventListener("click", async () => {
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        showAudioMessage("Thai text-to-speech is not supported in this browser.");
        return;
      }
      button.disabled = true;
      let thaiVoice;
      try {
        thaiVoice = await findThaiVoice();
      } catch (error) {
        console.error("Unable to inspect installed speech voices.", error);
        showAudioMessage("This browser could not check for installed Thai speech voices.");
        button.disabled = false;
        return;
      }
      button.disabled = false;
      if (!thaiVoice) {
        showAudioMessage("No Thai speech voice is available in this browser. Try enabling or installing a Thai voice in your device settings.");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(thai);
      utterance.voice = thaiVoice;
      utterance.lang = "th-TH";
      utterance.onerror = (event) => {
        console.error("Thai speech synthesis failed.", event);
        showAudioMessage("This browser could not play Thai speech. Try another browser or device with a Thai voice installed.");
      };
      try {
        window.speechSynthesis.speak(utterance);
        if (audioNotice instanceof HTMLElement) audioNotice.hidden = true;
      } catch (error) {
        console.error("Unable to start Thai speech synthesis.", error);
        showAudioMessage("This browser could not start Thai speech.");
      }
    });
    return button;
  }

  function findThaiVoice() {
    const availableVoice = () => window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("th"));
    const voice = availableVoice();
    if (voice) return Promise.resolve(voice);

    return new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
        resolve(result);
      };
      const onVoicesChanged = () => {
        const loadedVoice = availableVoice();
        if (loadedVoice) finish(loadedVoice);
      };
      const timeout = window.setTimeout(() => finish(availableVoice()), 1500);
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    });
  }

  function renderLesson(lesson, index) {
    const article = document.createElement("article");
    article.className = "lesson-card";
    article.id = `lesson-${lesson.id}`;
    article.dataset.lessonId = lesson.id;

    const header = document.createElement("div");
    header.className = "lesson-card-header";
    const titleGroup = document.createElement("div");
    const number = document.createElement("p");
    number.className = "eyebrow";
    number.textContent = `LESSON ${String(index + 1).padStart(2, "0")}`;
    const title = document.createElement("h2");
    title.textContent = lesson.title;
    const description = document.createElement("p");
    description.className = "lesson-description";
    description.textContent = lesson.description;
    titleGroup.append(number, title, description);
    const completion = document.createElement("span");
    completion.className = "completion-badge";
    completion.textContent = "✓ Completed";
    completion.hidden = true;
    header.append(titleGroup, completion);
    article.append(header);

    const vocabularyHeading = document.createElement("h3");
    const objectivesHeading = document.createElement("h3");
    objectivesHeading.textContent = "Learning objectives";
    article.append(objectivesHeading);
    const objectives = document.createElement("ul");
    objectives.className = "lesson-objectives";
    lesson.objectives.forEach((objective) => {
      const item = document.createElement("li");
      item.textContent = objective;
      objectives.append(item);
    });
    article.append(objectives);

    if (lesson.teachingNote) {
      const note = document.createElement("p");
      note.className = "lesson-language-note";
      note.textContent = lesson.teachingNote;
      article.append(note);
    }

    vocabularyHeading.textContent = "Useful words and phrases";
    article.append(vocabularyHeading);
    const vocabulary = document.createElement("div");
    vocabulary.className = "vocabulary-grid";
    lesson.vocabulary.forEach((item) => {
      const entry = document.createElement("div");
      entry.className = "vocab-entry";
      const thai = document.createElement("span");
      thai.className = "thai-word";
      thai.lang = "th";
      thai.textContent = item.thai;
      const romanization = document.createElement("span");
      romanization.className = "romanization";
      romanization.textContent = item.romanization;
      const meaning = document.createElement("span");
      meaning.className = "meaning";
      meaning.textContent = item.meaning;
      entry.append(thai, romanization, meaning, makeSpeakButton(item.thai, item.meaning));
      vocabulary.append(entry);
    });
    article.append(vocabulary);

    const examplesHeading = document.createElement("h3");
    examplesHeading.textContent = "Put it into practice";
    article.append(examplesHeading);
    const examples = document.createElement("div");
    examples.className = "examples-list";
    lesson.examples.forEach((item) => {
      const example = document.createElement("div");
      example.className = "example";
      const thaiLine = document.createElement("div");
      thaiLine.className = "example-thai-line";
      const thai = document.createElement("span");
      thai.lang = "th";
      thai.textContent = item.thai;
      thaiLine.append(thai, makeSpeakButton(item.thai, item.translation));
      const romanization = document.createElement("span");
      romanization.className = "romanization";
      romanization.textContent = item.romanization;
      const translation = document.createElement("span");
      translation.className = "meaning";
      translation.textContent = item.translation;
      example.append(thaiLine, romanization, translation);
      examples.append(example);
    });
    article.append(examples);

    const quiz = document.createElement("fieldset");
    quiz.className = "quiz";
    const quizLegend = document.createElement("legend");
    quizLegend.textContent = "Quick check";
    quiz.append(quizLegend);
    const quizStatus = document.createElement("p");
    quizStatus.className = "quiz-feedback";
    quizStatus.setAttribute("aria-live", "polite");
    const quizQuestions = [];

    lesson.quiz.forEach((question, questionIndex) => {
      const questionBlock = document.createElement("div");
      questionBlock.className = "quiz-question";
      questionBlock.setAttribute("role", "group");
      const prompt = document.createElement("p");
      prompt.id = `${lesson.id}-question-label-${questionIndex}`;
      prompt.textContent = `${questionIndex + 1}. ${question.question}`;
      questionBlock.setAttribute("aria-labelledby", prompt.id);
      questionBlock.append(prompt);
      const groupName = `${lesson.id}-question-${questionIndex}`;
      question.choices.forEach((choice, choiceIndex) => {
        const choiceLabel = document.createElement("label");
        choiceLabel.className = "quiz-choice";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = groupName;
        input.value = String(choiceIndex);
        input.required = true;
        choiceLabel.append(input, document.createTextNode(choice));
        questionBlock.append(choiceLabel);
      });
      quiz.append(questionBlock);
      quizQuestions.push({ name: groupName, answer: question.answer, explanation: question.explanation });
    });

    const submit = document.createElement("button");
    submit.type = "button";
    submit.className = "button button-small";
    submit.textContent = "Check answers";
    submit.addEventListener("click", () => {
      const answers = quizQuestions.map((question) => {
        const selected = quiz.querySelector(`input[name="${CSS.escape(question.name)}"]:checked`);
        return selected instanceof HTMLInputElement ? Number(selected.value) : null;
      });
      if (answers.some((answer) => answer === null)) {
        quizStatus.textContent = "Choose an answer for each question before checking.";
        quizStatus.className = "quiz-feedback feedback-error";
        return;
      }
      const score = answers.reduce((total, answer, questionIndex) => total + Number(answer === quizQuestions[questionIndex].answer), 0);
      const percent = Math.round((score / quizQuestions.length) * 100);
      quizStatus.textContent = `${score} of ${quizQuestions.length} correct (${percent}%). ${quizQuestions.map((question) => question.explanation).join(" ")}`;
      quizStatus.className = `quiz-feedback ${score === quizQuestions.length ? "feedback-success" : "feedback-retry"}`;
      if (score / quizQuestions.length >= 0.5 && !completedLessons.has(lesson.id)) {
        completedLessons.add(lesson.id);
        if (storageAvailable) saveProgress();
        updateProgress(document.querySelectorAll("[data-lesson-id]").length);
        completion.hidden = false;
      }
    });
    quiz.append(submit, quizStatus);
    article.append(quiz);
    if (completedLessons.has(lesson.id)) completion.hidden = false;
    return article;
  }

  async function loadLessons() {
    readProgress();
    try {
      const response = await fetch(LESSONS_URL);
      if (!response.ok) throw new Error(`Lesson data request failed with HTTP ${response.status}.`);
      const lessons = await response.json();
      if (!Array.isArray(lessons) || lessons.length !== 10) throw new Error("Lesson data must contain exactly 10 lessons.");
      list.replaceChildren(...lessons.map(renderLesson));
      updateProgress(lessons.length);
    } catch (error) {
      console.error("Unable to load Thai lessons.", error);
      list.replaceChildren();
      const message = document.createElement("p");
      message.className = "loading-message error-message";
      message.setAttribute("role", "alert");
      message.textContent = "Lessons could not be loaded. Please run this site using a local web server and check that data/lessons.json is available.";
      list.append(message);
    }
  }

  if (resetButton instanceof HTMLButtonElement) {
    resetButton.addEventListener("click", () => {
      if (!window.confirm("Reset all completed lessons on this device?")) return;
      completedLessons.clear();
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        storageAvailable = true;
        if (storageNotice instanceof HTMLElement) storageNotice.hidden = true;
      } catch (error) {
        storageAvailable = false;
        console.error("Unable to clear saved lesson progress.", error);
        showStorageMessage("Progress could not be cleared from this browser.");
      }
      updateProgress(document.querySelectorAll("[data-lesson-id]").length);
    });
  }

  loadLessons();
})();
