const loginPanel = document.getElementById("loginPanel");
const homePanel = document.getElementById("homePanel");
const loginForm = document.getElementById("loginForm");
const teamInput = document.getElementById("teamInput");
const errorMessage = document.getElementById("errorMessage");
const teamHeading = document.getElementById("teamHeading");
const logoutButton = document.getElementById("logoutButton");
const quickSelectButtons = document.querySelectorAll("[data-team]");
const quizTitle = document.getElementById("quizTitle");
const quizContainer = document.getElementById("quizContainer");
const quizProgressFill = document.getElementById("quizProgressFill");
const quizProgressText = document.getElementById("quizProgressText");
const resetQuizButton = document.getElementById("resetQuizButton");
const quizResultOverlay = document.getElementById("quizResultOverlay");
const quizResultCard = document.getElementById("quizResultCard");
const quizResultLabel = document.getElementById("quizResultLabel");
const quizResultTitle = document.getElementById("quizResultTitle");
const quizResultSubtitle = document.getElementById("quizResultSubtitle");
const quizTabButton = document.getElementById("quizTabButton");
const radarTabButton = document.getElementById("radarTabButton");
const videoTabButton = document.getElementById("videoTabButton");
const accessTabButton = document.getElementById("accessTabButton");
const quizTabPanel = document.getElementById("quizTabPanel");
const radarTabPanel = document.getElementById("radarTabPanel");
const videoTabPanel = document.getElementById("videoTabPanel");
const accessTabPanel = document.getElementById("accessTabPanel");
const missionVideo = document.getElementById("missionVideo");
const videoSwitchButtons = document.querySelectorAll(".video-switch-button");
const videoTransitionOverlay = document.getElementById("videoTransitionOverlay");
const accessTitle = document.getElementById("accessTitle");
const accessForm = document.getElementById("accessForm");
const accessInputs = document.querySelectorAll(".access-code-input");
const accessResetButton = document.getElementById("accessResetButton");
const accessResultOverlay = document.getElementById("accessResultOverlay");
const accessResultCard = document.getElementById("accessResultCard");
const accessResultLabel = document.getElementById("accessResultLabel");
const accessResultTitle = document.getElementById("accessResultTitle");
const accessResultSubtitle = document.getElementById("accessResultSubtitle");
const accessGateOverlay = document.getElementById("accessGateOverlay");
const radarTitle = document.getElementById("radarTitle");
const radarOverview = document.getElementById("radarOverview");
const startRadarButton = document.getElementById("startRadarButton");
const checkRadarButton = document.getElementById("checkRadarButton");
const radarTimer = document.getElementById("radarTimer");
const radarInstruction = document.getElementById("radarInstruction");
const radarGrid = document.getElementById("radarGrid");
const radarTray = document.getElementById("radarTray");
const radarItemsColumn = document.querySelector(".radar-items-column");
const radarSizeSlider = document.getElementById("radarSizeSlider");
const radarSizeValue = document.getElementById("radarSizeValue");
const radarBoardShell = document.querySelector(".radar-board-shell");
const radarCountdownOverlay = document.getElementById("radarCountdownOverlay");
const radarCountdownValue = document.getElementById("radarCountdownValue");
const radarScanOverlay = document.getElementById("radarScanOverlay");
const radarScanText = document.getElementById("radarScanText");
const radarResultBanner = document.getElementById("radarResultBanner");
const radarResultTitle = document.getElementById("radarResultTitle");
const radarResultSubtitle = document.getElementById("radarResultSubtitle");
const radarFinalOverlay = document.getElementById("radarFinalOverlay");
const radarFinalCard = document.getElementById("radarFinalCard");
const radarFinalLabel = document.getElementById("radarFinalLabel");
const radarFinalTitle = document.getElementById("radarFinalTitle");
const radarFinalSubtitle = document.getElementById("radarFinalSubtitle");

const TEAM_CONTENT = window.TEAM_CONTENT || {};
const TEAM_QUIZZES = window.TEAM_QUIZZES || {};
const TEAM_RADARS = window.TEAM_RADARS || {};
const TEAM_ACCESS_CODES = window.TEAM_ACCESS_CODES || {};
const STORAGE_KEY = "military-quest-team";
const QUIZ_STORAGE_KEY = "military-quest-quiz-state";
const CORRECT_ANSWER_REVEAL_DELAY = 3000;
const WRONG_ANSWER_EXTRA_DELAY = 4000;
const RADAR_GRID_SIZE = 6;
const RADAR_MEMORIZE_SECONDS = 30;
const RADAR_SCAN_DELAY = 7000;
const RADAR_REVEAL_STEP_DELAY = 650;
const RADAR_REVEAL_GAP_DELAY = 180;
const RADAR_START_COUNTDOWN_SECONDS = 3;
const ACCESS_SUCCESS_DELAY = 1300;
const VIDEO_SOURCES = {
  w: "./assets/insf.mp4",
  a: "./assets/as1.mp4",
  s: "./assets/as2.mp4",
  d: "./assets/as3.mp4",
};
const VIDEO_HOTKEYS = {
  w: "w",
  a: "a",
  s: "s",
  d: "d",
  1: "w",
  2: "a",
  3: "s",
  4: "d",
};

let currentTeam = null;
let quizState = {};
let revealTimeoutId = null;
let activeTab = "quiz";
let radarTimerIntervalId = null;
let radarScanTimeoutId = null;
let radarRevealTimeoutId = null;
let radarCountdownTimeoutId = null;
let radarState = createDefaultRadarState();
let activeVideoKey = "w";
let videoTransitionTimeoutId = null;
let isVideoTransitioning = false;
let accessResultTimeoutId = null;
let accessGateTimeoutId = null;
let appAudioContext = null;
let lastRadarCountdownValue = null;

function getAppAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  try {
    if (!appAudioContext) {
      appAudioContext = new AudioContextClass();
    }

    if (appAudioContext.state === "suspended") {
      void appAudioContext.resume();
    }

    return appAudioContext;
  } catch (error) {
    return null;
  }
}

function playTone({
  frequency = 440,
  type = "sine",
  duration = 0.12,
  gain = 0.05,
  attack = 0.01,
  release = 0.1,
  when = 0,
  detune = 0,
}) {
  const context = getAppAudioContext();

  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const filter = context.createBiquadFilter();
  const startAt = context.currentTime + when;
  const stopAt = startAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  oscillator.detune.setValueAtTime(detune, startAt);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2200, startAt);

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(gain, startAt + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt + release);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(startAt);
  oscillator.stop(stopAt + release + 0.02);
}

function playNoiseBurst({
  duration = 0.14,
  gain = 0.045,
  when = 0,
  highpass = 500,
  lowpass = 4200,
}) {
  const context = getAppAudioContext();

  if (!context) {
    return;
  }

  const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < bufferSize; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const highpassFilter = context.createBiquadFilter();
  const lowpassFilter = context.createBiquadFilter();
  const gainNode = context.createGain();
  const startAt = context.currentTime + when;
  const stopAt = startAt + duration;

  source.buffer = buffer;

  highpassFilter.type = "highpass";
  highpassFilter.frequency.setValueAtTime(highpass, startAt);

  lowpassFilter.type = "lowpass";
  lowpassFilter.frequency.setValueAtTime(lowpass, startAt);

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(gain, startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt);

  source.connect(highpassFilter);
  highpassFilter.connect(lowpassFilter);
  lowpassFilter.connect(gainNode);
  gainNode.connect(context.destination);

  source.start(startAt);
  source.stop(stopAt + 0.02);
}

function playTabSound(tabName) {
  if (tabName === "quiz") {
    playTone({ frequency: 520, type: "triangle", duration: 0.08, gain: 0.04 });
    playTone({ frequency: 780, type: "triangle", duration: 0.08, gain: 0.03, when: 0.06 });
    return;
  }

  if (tabName === "radar") {
    playTone({ frequency: 860, type: "sine", duration: 0.09, gain: 0.035 });
    playTone({ frequency: 430, type: "sine", duration: 0.16, gain: 0.03, when: 0.08 });
    return;
  }

  if (tabName === "video") {
    playNoiseBurst({ duration: 0.11, gain: 0.035, highpass: 900, lowpass: 5000 });
    playTone({ frequency: 240, type: "sawtooth", duration: 0.08, gain: 0.025, when: 0.02 });
    return;
  }

  if (tabName === "access") {
    playTone({ frequency: 660, type: "square", duration: 0.05, gain: 0.03 });
    playTone({ frequency: 990, type: "square", duration: 0.05, gain: 0.024, when: 0.04 });
  }
}

function playQuizResultSound(isCorrect) {
  if (isCorrect) {
    playTone({ frequency: 660, type: "triangle", duration: 0.08, gain: 0.05 });
    playTone({ frequency: 880, type: "triangle", duration: 0.1, gain: 0.05, when: 0.07 });
    playTone({ frequency: 1320, type: "triangle", duration: 0.12, gain: 0.04, when: 0.14 });
    return;
  }

  playTone({ frequency: 250, type: "sawtooth", duration: 0.12, gain: 0.05 });
  playTone({ frequency: 180, type: "sawtooth", duration: 0.16, gain: 0.04, when: 0.08 });
}

function playRadarCountdownSound(value) {
  const safeValue = Number(value);

  if (Number.isNaN(safeValue) || lastRadarCountdownValue === safeValue) {
    return;
  }

  lastRadarCountdownValue = safeValue;
  playTone({
    frequency: safeValue === 1 ? 1200 : 930 - (safeValue - 1) * 120,
    type: "sine",
    duration: safeValue === 1 ? 0.16 : 0.1,
    gain: safeValue === 1 ? 0.065 : 0.045,
  });
}

function playRadarSweepSound() {
  playNoiseBurst({ duration: 0.24, gain: 0.028, highpass: 1200, lowpass: 6800 });
  playTone({ frequency: 320, type: "sine", duration: 0.22, gain: 0.032 });
  playTone({ frequency: 960, type: "triangle", duration: 0.12, gain: 0.025, when: 0.14 });
}

function playRadarRevealSound(isCorrect) {
  if (isCorrect) {
    playTone({ frequency: 980, type: "sine", duration: 0.08, gain: 0.04 });
    playTone({ frequency: 1240, type: "sine", duration: 0.08, gain: 0.03, when: 0.06 });
    return;
  }

  playTone({ frequency: 210, type: "square", duration: 0.12, gain: 0.045 });
}

function playAccessKeypadSound() {
  playTone({ frequency: 820, type: "square", duration: 0.035, gain: 0.025 });
}

function playAccessDeniedSound() {
  playTone({ frequency: 230, type: "sawtooth", duration: 0.12, gain: 0.05 });
  playTone({ frequency: 160, type: "sawtooth", duration: 0.2, gain: 0.04, when: 0.08 });
}

function playAccessGrantedSound() {
  playTone({ frequency: 740, type: "triangle", duration: 0.09, gain: 0.05 });
  playTone({ frequency: 1110, type: "triangle", duration: 0.11, gain: 0.04, when: 0.07 });
}

function updateRadarBoardSize(value) {
  if (!radarBoardShell) {
    return;
  }

  radarBoardShell.style.setProperty("--radar-board-size", `${value}vh`);

  if (radarSizeValue) {
    radarSizeValue.textContent = `${value}%`;
  }
}

function updateVideoSwitcherUI(videoKey) {
  videoSwitchButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.videoKey === videoKey);
  });
}

function playMissionVideoWithSound() {
  if (!missionVideo) {
    return;
  }

  missionVideo.muted = false;
  const playAttempt = missionVideo.play();

  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {
      missionVideo.muted = true;
      void missionVideo.play().catch(() => {});
    });
  }
}

function showVideoTransitionOverlay() {
  if (!videoTransitionOverlay) {
    return;
  }

  videoTransitionOverlay.classList.remove("hidden");
  videoTransitionOverlay.classList.remove("is-animating");
  void videoTransitionOverlay.offsetWidth;
  videoTransitionOverlay.classList.add("is-animating");
}

function hideVideoTransitionOverlay() {
  if (!videoTransitionOverlay) {
    return;
  }

  videoTransitionOverlay.classList.add("hidden");
  videoTransitionOverlay.classList.remove("is-animating");
}

function setMissionVideo(videoKey, restart = true, withTransition = false) {
  if (!missionVideo || !VIDEO_SOURCES[videoKey]) {
    return;
  }

  if (withTransition) {
    if (isVideoTransitioning) {
      return;
    }

    isVideoTransitioning = true;
    activeVideoKey = videoKey;
    updateVideoSwitcherUI(videoKey);
    playNoiseBurst({ duration: 0.16, gain: 0.04, highpass: 900, lowpass: 5200 });
    playTone({ frequency: 180, type: "sawtooth", duration: 0.09, gain: 0.02, when: 0.01 });
    showVideoTransitionOverlay();

    if (videoTransitionTimeoutId) {
      window.clearTimeout(videoTransitionTimeoutId);
    }

    videoTransitionTimeoutId = window.setTimeout(() => {
      setMissionVideo(videoKey, restart, false);
    }, 260);

    return;
  }

  activeVideoKey = videoKey;
  const nextSource = VIDEO_SOURCES[videoKey];
  const shouldReplaceSource = missionVideo.dataset.videoKey !== videoKey;

  if (shouldReplaceSource) {
    missionVideo.pause();
    missionVideo.src = nextSource;
    missionVideo.dataset.videoKey = videoKey;
    missionVideo.load();
  }

  updateVideoSwitcherUI(videoKey);

  const finishVideoSwitch = () => {
    if (restart) {
      try {
        missionVideo.currentTime = 0;
      } catch (error) {
        // no-op
      }
    }

    if (activeTab === "video") {
      playMissionVideoWithSound();
    }

    if (isVideoTransitioning) {
      if (videoTransitionTimeoutId) {
        window.clearTimeout(videoTransitionTimeoutId);
      }

      videoTransitionTimeoutId = window.setTimeout(() => {
        hideVideoTransitionOverlay();
        isVideoTransitioning = false;
        videoTransitionTimeoutId = null;
      }, 380);
    }
  };

  if (shouldReplaceSource) {
    missionVideo.addEventListener("loadeddata", finishVideoSwitch, { once: true });
  } else {
    finishVideoSwitch();
  }
}

function normalizeTeamName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function getTeamContent(teamName) {
  return TEAM_CONTENT[teamName] || null;
}

function getTeamQuiz(teamName) {
  return TEAM_QUIZZES[teamName] || null;
}

function getTeamRadar(teamName) {
  return TEAM_RADARS[teamName] || null;
}

function getTeamAccessCode(teamName) {
  return TEAM_ACCESS_CODES[teamName] || null;
}

function clearAccessTimers() {
  if (accessResultTimeoutId) {
    window.clearTimeout(accessResultTimeoutId);
    accessResultTimeoutId = null;
  }

  if (accessGateTimeoutId) {
    window.clearTimeout(accessGateTimeoutId);
    accessGateTimeoutId = null;
  }
}

function hideAccessResultOverlay() {
  if (!accessResultOverlay) {
    return;
  }

  accessResultOverlay.classList.add("hidden");
  accessResultCard?.classList.remove("is-success", "is-error");
}

function hideAccessGateOverlay() {
  if (!accessGateOverlay) {
    return;
  }

  accessGateOverlay.classList.add("hidden");
  accessGateOverlay.classList.remove("is-open");
  homePanel?.classList.remove("is-gate-transition");
}

function playVictoryFanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((frequency, index) => {
    playTone({
      frequency,
      type: index < 2 ? "triangle" : "sawtooth",
      duration: 0.28,
      gain: 0.08,
      when: index * 0.13,
    });
  });

  playNoiseBurst({ duration: 0.22, gain: 0.02, when: 0.06, highpass: 1800, lowpass: 7600 });
}

function resetAccessInputs() {
  accessInputs.forEach((input) => {
    input.value = "";
  });

  accessInputs[0]?.focus();
}

function showAccessResult(isSuccess) {
  if (!accessResultOverlay || !accessResultCard) {
    return;
  }

  clearAccessTimers();
  hideAccessGateOverlay();
  accessResultOverlay.classList.remove("hidden");
  accessResultCard.classList.remove("is-success", "is-error");
  accessResultCard.classList.add(isSuccess ? "is-success" : "is-error");
  accessResultLabel.textContent = isSuccess ? "Доступ підтверджено" : "Помилка доступу";
  accessResultTitle.textContent = isSuccess ? "Доступ дозволений" : "Код невірний";
  accessResultSubtitle.textContent = isSuccess
    ? "Система відкриває фінальний прохід."
    : "Код невірний. Доступ заборонений.";

  if (isSuccess) {
    playAccessGrantedSound();
  } else {
    playAccessDeniedSound();
  }

  if (isSuccess) {
    accessResultTimeoutId = window.setTimeout(() => {
      hideAccessResultOverlay();
      if (!accessGateOverlay) {
        return;
      }

      homePanel?.classList.remove("is-gate-transition");
      void homePanel?.offsetWidth;
      homePanel?.classList.add("is-gate-transition");
      playVictoryFanfare();
      accessGateOverlay.classList.remove("hidden");
      void accessGateOverlay.offsetWidth;
      accessGateOverlay.classList.add("is-open");
    }, ACCESS_SUCCESS_DELAY);
  } else {
    accessResultTimeoutId = window.setTimeout(() => {
      hideAccessResultOverlay();
    }, 2200);
  }
}

function renderAccess(teamName) {
  const teamAccess = getTeamAccessCode(teamName);

  if (!teamAccess) {
    accessTitle.textContent = "Контроль доступу";
    return;
  }

  accessTitle.textContent = teamAccess.title;
  hideAccessResultOverlay();
  hideAccessGateOverlay();
  clearAccessTimers();
  resetAccessInputs();
}

function createDefaultRadarState() {
  return {
    phase: "idle",
    secondsLeft: RADAR_MEMORIZE_SECONDS,
    placements: {},
    verification: {},
    verificationEntries: [],
    revealedCells: {},
    currentRevealItemId: null,
    currentRevealPlacementKey: null,
    currentRevealIsCorrect: null,
    draggedItemId: null,
  };
}

function clearRadarTimers() {
  if (radarTimerIntervalId) {
    window.clearInterval(radarTimerIntervalId);
    radarTimerIntervalId = null;
  }

  if (radarScanTimeoutId) {
    window.clearTimeout(radarScanTimeoutId);
    radarScanTimeoutId = null;
  }

  if (radarRevealTimeoutId) {
    window.clearTimeout(radarRevealTimeoutId);
    radarRevealTimeoutId = null;
  }

  if (radarCountdownTimeoutId) {
    window.clearTimeout(radarCountdownTimeoutId);
    radarCountdownTimeoutId = null;
  }
}

function resetRadarState() {
  clearRadarTimers();
  radarState = createDefaultRadarState();
}

function formatRadarTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  return `00:${String(safeSeconds).padStart(2, "0")}`;
}

function updateRadarTimerAppearance() {
  const dangerStart = 10;
  const clamped = Math.max(0, Math.min(dangerStart, radarState.secondsLeft));
  const progress = 1 - clamped / dangerStart;

  if (radarState.phase !== "memorize" || radarState.secondsLeft > dangerStart) {
    radarTimer.style.color = "";
    radarTimer.style.textShadow = "";
    return;
  }

  const red = Math.round(214 + 41 * progress);
  const green = Math.round(224 - 140 * progress);
  const blue = Math.round(180 - 120 * progress);
  const glow = 0.16 + progress * 0.22;

  radarTimer.style.color = `rgb(${red}, ${green}, ${blue})`;
  radarTimer.style.textShadow = `0 0 18px rgba(255, 90, 90, ${glow})`;
}

function setActiveTab(tabName) {
  const previousTab = activeTab;
  activeTab = tabName;
  const isQuizTab = tabName === "quiz";
  const isRadarTab = tabName === "radar";
  const isVideoTab = tabName === "video";
  const isAccessTab = tabName === "access";

  quizTabButton.classList.toggle("active", isQuizTab);
  quizTabButton.setAttribute("aria-selected", String(isQuizTab));
  quizTabPanel.classList.toggle("hidden", !isQuizTab);

  radarTabButton.classList.toggle("active", isRadarTab);
  radarTabButton.setAttribute("aria-selected", String(isRadarTab));
  radarTabPanel.classList.toggle("hidden", !isRadarTab);

  videoTabButton.classList.toggle("active", isVideoTab);
  videoTabButton.setAttribute("aria-selected", String(isVideoTab));
  videoTabPanel.classList.toggle("hidden", !isVideoTab);

  accessTabButton.classList.toggle("active", isAccessTab);
  accessTabButton.setAttribute("aria-selected", String(isAccessTab));
  accessTabPanel.classList.toggle("hidden", !isAccessTab);

  if (previousTab !== tabName && currentTeam) {
    playTabSound(tabName);
  }

  if (missionVideo) {
    if (isVideoTab) {
      setMissionVideo(activeVideoKey, true);
    } else {
      missionVideo.pause();
    }
  }
}

function loadQuizState() {
  try {
    return JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveQuizState() {
  localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizState));
}

function createDefaultTeamQuizState(teamName) {
  const teamQuiz = getTeamQuiz(teamName);

  if (!teamQuiz) {
    return [];
  }

  return teamQuiz.questions.map(() => ({
    selectedAnswerIndex: null,
    isAnswered: false,
    isCorrect: false,
  }));
}

function ensureTeamQuizState(teamName) {
  const teamQuiz = getTeamQuiz(teamName);
  const expectedLength = teamQuiz ? teamQuiz.questions.length : 0;
  const currentState = quizState[teamName];

  if (
    !currentState ||
    !Array.isArray(currentState) ||
    currentState.length !== expectedLength
  ) {
    quizState[teamName] = createDefaultTeamQuizState(teamName);
    saveQuizState();
  }
}

function getAnsweredCount(teamName) {
  ensureTeamQuizState(teamName);
  return quizState[teamName].filter((entry) => entry.isAnswered).length;
}

function getCorrectAnswersCount(teamName) {
  ensureTeamQuizState(teamName);
  return quizState[teamName].filter((entry) => entry.isCorrect).length;
}

function getCurrentQuestionIndex(teamName) {
  ensureTeamQuizState(teamName);
  return quizState[teamName].findIndex((entry) => !entry.isAnswered);
}

function updateQuizProgress(teamName) {
  const teamQuiz = getTeamQuiz(teamName);

  if (!teamQuiz) {
    quizProgressFill.style.width = "0%";
    quizProgressText.textContent = "";
    return;
  }

  const answeredCount = getAnsweredCount(teamName);
  const totalQuestions = teamQuiz.questions.length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  quizProgressFill.style.width = `${progressPercent}%`;
  quizProgressText.textContent = `Пройдено ${answeredCount} / ${totalQuestions}`;
}

function hideQuizResultOverlay() {
  quizResultOverlay.classList.add("hidden");
  quizResultCard.className = "quiz-result-card";
}

function getCorrectAnswerText(questionItem) {
  const correctAnswer = questionItem.answers.find((answer) => answer.isCorrect);
  return correctAnswer ? correctAnswer.text : "";
}

function showQuizResultOverlay(isCorrect, questionItem) {
  const correctAnswerText = getCorrectAnswerText(questionItem);

  quizResultOverlay.classList.remove("hidden");
  quizResultCard.className = `quiz-result-card ${isCorrect ? "is-correct" : "is-wrong"}`;
  quizResultLabel.textContent = isCorrect ? "Статус місії" : "Увага";
  quizResultTitle.textContent = isCorrect ? "Правильна відповідь" : "Неправильна відповідь";
  quizResultSubtitle.textContent = isCorrect
    ? "Чудово. Переходимо до наступного запитання."
    : `Правильна відповідь: ${correctAnswerText}`;
  playQuizResultSound(isCorrect);
}

function renderQuiz(teamName) {
  const teamQuiz = getTeamQuiz(teamName);
  quizContainer.innerHTML = "";

  if (!teamQuiz) {
    quizTitle.textContent = "Квіз не призначено";
    updateQuizProgress(teamName);
    return;
  }

  ensureTeamQuizState(teamName);
  quizTitle.textContent = teamQuiz.title;
  const currentQuestionIndex = getCurrentQuestionIndex(teamName);

  if (currentQuestionIndex === -1) {
    const correctAnswersCount = getCorrectAnswersCount(teamName);
    const completeCard = document.createElement("article");
    completeCard.className = "question-card quiz-complete-card";
    completeCard.innerHTML = `
      <p class="question-meta">Місію завершено</p>
      <h4 class="question-title">Усі ${teamQuiz.questions.length} запитань пройдено</h4>
      <p class="content-text">Вірних відповідей: ${correctAnswersCount} з ${teamQuiz.questions.length}.</p>
      <p class="content-text">Квіз для ${teamName} завершено. Ти можеш почати його заново будь-коли.</p>
    `;
    quizContainer.appendChild(completeCard);
    updateQuizProgress(teamName);
    return;
  }

  const questionItem = teamQuiz.questions[currentQuestionIndex];
  const questionState = quizState[teamName][currentQuestionIndex];
  const questionCard = document.createElement("article");
  questionCard.className = "question-card active-question-card";

  const questionMeta = document.createElement("p");
  questionMeta.className = "question-meta";
  questionMeta.textContent = `Запитання ${currentQuestionIndex + 1} / ${teamQuiz.questions.length}`;

  const questionTitle = document.createElement("h4");
  questionTitle.className = "question-title";
  questionTitle.textContent = questionItem.question;

  const answersList = document.createElement("div");
  answersList.className = "answers-list";

  questionItem.answers.forEach((answer, answerIndex) => {
    const answerButton = document.createElement("button");
    answerButton.type = "button";
    answerButton.className = "answer-button";
    answerButton.textContent = answer.text;

    if (questionState.isAnswered) {
      answerButton.disabled = true;
      answerButton.classList.add("is-revealed");

      if (answer.isCorrect) {
        answerButton.classList.add("is-correct");
      }

      if (
        questionState.selectedAnswerIndex === answerIndex &&
        !answer.isCorrect
      ) {
        answerButton.classList.add("is-wrong");
      }

      if (questionState.selectedAnswerIndex === answerIndex) {
        answerButton.classList.add("is-selected");
      }
    }

    answerButton.addEventListener("click", () => {
      if (questionState.isAnswered || revealTimeoutId) {
        return;
      }

      const isCorrect = answer.isCorrect;
      questionState.selectedAnswerIndex = answerIndex;
      questionState.isAnswered = true;
      questionState.isCorrect = isCorrect;
      saveQuizState();
      renderQuiz(teamName);
      showQuizResultOverlay(isCorrect, questionItem);

      const revealDelay = isCorrect
        ? CORRECT_ANSWER_REVEAL_DELAY
        : CORRECT_ANSWER_REVEAL_DELAY + WRONG_ANSWER_EXTRA_DELAY;

      revealTimeoutId = window.setTimeout(() => {
        revealTimeoutId = null;
        hideQuizResultOverlay();
        renderQuiz(teamName);
      }, revealDelay);
    });

    answersList.appendChild(answerButton);
  });

  questionCard.append(questionMeta, questionTitle, answersList);
  quizContainer.appendChild(questionCard);

  updateQuizProgress(teamName);
}

function createRadarItemElement(item, options = {}) {
  const element = document.createElement("div");
  element.className = "radar-item";
  element.dataset.itemId = item.id;
  element.draggable = Boolean(options.draggable);

  const icon = document.createElement("img");
  icon.className = "radar-item-icon-image";
  icon.src = item.icon;
  icon.alt = item.label;
  element.append(icon);

  if (options.draggable) {
    element.addEventListener("dragstart", () => {
      radarState.draggedItemId = item.id;
      element.classList.add("is-dragging");
    });

    element.addEventListener("dragend", () => {
      radarState.draggedItemId = null;
      element.classList.remove("is-dragging");
    });
  }

  if (options.isHighlighting) {
    element.classList.add("is-highlighting");
  }

  return element;
}

function buildRadarGrid() {
  radarGrid.innerHTML = "";
  const columnLabels = ["A", "B", "C", "D", "E", "F"];

  for (let row = 1; row <= RADAR_GRID_SIZE; row += 1) {
    for (let col = 1; col <= RADAR_GRID_SIZE; col += 1) {
      const cell = document.createElement("div");
      cell.className = "radar-cell";
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);

      if (row === 1) {
        const columnLabel = document.createElement("span");
        columnLabel.className = "radar-column-label";
        columnLabel.textContent = columnLabels[col - 1];
        cell.appendChild(columnLabel);
      }

      if (col === 1) {
        const rowLabel = document.createElement("span");
        rowLabel.className = "radar-row-label";
        rowLabel.textContent = String(row);
        cell.appendChild(rowLabel);
      }

      cell.addEventListener("dragover", (event) => {
        if (radarState.phase !== "placing") {
          return;
        }

        event.preventDefault();
        cell.classList.add("is-drop-target");
      });

      cell.addEventListener("dragleave", () => {
        cell.classList.remove("is-drop-target");
      });

      cell.addEventListener("drop", (event) => {
        if (radarState.phase !== "placing") {
          return;
        }

        event.preventDefault();
        cell.classList.remove("is-drop-target");

        if (!radarState.draggedItemId) {
          return;
        }

        const placementKey = `${row}-${col}`;

        Object.keys(radarState.placements).forEach((itemId) => {
          if (radarState.placements[itemId] === placementKey) {
            delete radarState.placements[itemId];
          }
        });

        radarState.placements[radarState.draggedItemId] = placementKey;
        renderRadar(currentTeam);
      });

      radarGrid.appendChild(cell);
    }
  }
}

function renderRadarItemsOnGrid(items) {
  items.forEach((item) => {
    const selector = `.radar-cell[data-row="${item.row}"][data-col="${item.col}"]`;
    const cell = radarGrid.querySelector(selector);

    if (!cell) {
      return;
    }

    const itemElement = createRadarItemElement(item);
    itemElement.classList.add("is-static");
    cell.appendChild(itemElement);
  });
}

function renderRadarPlacements(teamRadar) {
  const itemsById = Object.fromEntries(teamRadar.items.map((item) => [item.id, item]));

  Object.entries(radarState.placements).forEach(([itemId, placementKey]) => {
    const item = itemsById[itemId];
    if (!item) {
      return;
    }

    const [row, col] = placementKey.split("-");
    const cell = radarGrid.querySelector(`.radar-cell[data-row="${row}"][data-col="${col}"]`);

    if (!cell) {
      return;
    }

    const itemElement = createRadarItemElement(item, {
      draggable: radarState.phase === "placing",
      isHighlighting: radarState.currentRevealItemId === item.id,
    });
    itemElement.classList.add("is-placed");
    cell.appendChild(itemElement);
  });
}

function renderRadarTray(teamRadar) {
  radarTray.innerHTML = "";

  const unplacedItems = teamRadar.items.filter((item) => !radarState.placements[item.id]);

  unplacedItems.forEach((item) => {
    radarTray.appendChild(createRadarItemElement(item, { draggable: true }));
  });
}

function applyRadarVerification() {
  Object.entries(radarState.revealedCells).forEach(([placementKey, isCorrect]) => {
    const [row, col] = placementKey.split("-");
    const cell = radarGrid.querySelector(`.radar-cell[data-row="${row}"][data-col="${col}"]`);

    if (!cell) {
      return;
    }

    cell.classList.add(isCorrect ? "is-correct" : "is-wrong");
  });

  if (radarState.currentRevealPlacementKey) {
    const [row, col] = radarState.currentRevealPlacementKey.split("-");
    const currentCell = radarGrid.querySelector(`.radar-cell[data-row="${row}"][data-col="${col}"]`);

    if (currentCell) {
      currentCell.classList.add(
        radarState.currentRevealIsCorrect ? "is-reveal-correct" : "is-reveal-wrong"
      );
    }
  }
}

function updateRadarStatus() {
  radarTimer.textContent = formatRadarTime(radarState.secondsLeft);
  updateRadarTimerAppearance();

  if (!radarInstruction) {
    return;
  }

  if (radarState.phase === "idle") {
    radarInstruction.textContent = "Натисни «Старт», щоб побачити розташування предметів.";
  }

  if (radarState.phase === "memorize") {
    radarInstruction.textContent = "Запам’ятай розташування 6 предметів до завершення таймера.";
  }

  if (radarState.phase === "placing") {
    radarInstruction.textContent = "Перетягни всі предмети знизу на їхні правильні координати.";
  }

  if (radarState.phase === "checking") {
    radarInstruction.textContent = "Радар звіряє розташування предметів...";
  }

  if (radarState.phase === "scan-to-place") {
    radarInstruction.textContent = "Радар очищає поле перед новим етапом.";
  }

  if (radarState.phase === "results") {
    radarInstruction.textContent = "Радар завершив перевірку. Зелене — правильно, червоне — ні.";
  }

  if (radarState.phase === "revealing") {
    radarInstruction.textContent = "Радар покроково звіряє кожен предмет.";
  }
}

function showRadarBanner(title, subtitle) {
  radarResultTitle.textContent = title;
  radarResultSubtitle.textContent = subtitle;
  radarResultBanner.classList.remove("hidden");
}

function hideRadarBanner() {
  radarResultBanner.classList.add("hidden");
}

function showRadarFinalOverlay(correctCount, totalCount) {
  radarFinalLabel.textContent = "Фінальний звіт радара";
  radarFinalTitle.textContent = `Знайдено ${correctCount} з ${totalCount}`;
  radarFinalSubtitle.textContent =
    "Кількість знайдених предметів зафіксована. Перевір результат місії та переходь далі.";
  radarFinalCard.className = "radar-final-card";
  radarFinalOverlay.classList.remove("hidden");
  playTone({ frequency: 540, type: "triangle", duration: 0.12, gain: 0.04 });
  playTone({ frequency: 820, type: "triangle", duration: 0.14, gain: 0.035, when: 0.08 });
}

function hideRadarFinalOverlay() {
  radarFinalOverlay.classList.add("hidden");
}

function showRadarScan(text) {
  radarScanText.textContent = text;
  radarScanOverlay.classList.remove("hidden");
}

function hideRadarScan() {
  radarScanOverlay.classList.add("hidden");
}

function showRadarCountdown(value) {
  radarCountdownValue.textContent = String(value);
  radarCountdownOverlay.classList.remove("hidden");
  playRadarCountdownSound(value);
}

function hideRadarCountdown() {
  radarCountdownOverlay.classList.add("hidden");
  lastRadarCountdownValue = null;
}

function renderRadar(teamName) {
  const teamRadar = getTeamRadar(teamName);
  buildRadarGrid();

  if (!teamRadar) {
    radarTitle.textContent = "Радар не призначено";
    radarOverview.textContent = "Для цієї команди опис радара відсутній.";
    radarInstruction.textContent = "Для цієї команди дані радара відсутні.";
    radarTray.classList.add("hidden");
    radarItemsColumn?.classList.add("hidden");
    checkRadarButton.classList.add("hidden");
    return;
  }

  radarTitle.textContent = teamRadar.title;
  radarOverview.textContent =
    "Запам’ятай позиції всіх предметів, дочекайся сканування і поверни кожен елемент на його місце.";
  updateRadarStatus();

  if (radarState.phase === "idle") {
    hideRadarCountdown();
    hideRadarScan();
    hideRadarBanner();
    hideRadarFinalOverlay();
    radarTray.classList.add("hidden");
    radarItemsColumn?.classList.add("hidden");
    checkRadarButton.classList.add("hidden");
  }

  if (radarState.phase === "memorize") {
    hideRadarCountdown();
    hideRadarBanner();
    hideRadarScan();
    hideRadarFinalOverlay();
    radarTray.classList.add("hidden");
    radarItemsColumn?.classList.add("hidden");
    checkRadarButton.classList.add("hidden");
    renderRadarItemsOnGrid(teamRadar.items);
  }

  if (radarState.phase === "placing") {
    hideRadarCountdown();
    hideRadarFinalOverlay();
    radarItemsColumn?.classList.remove("hidden");
    radarTray.classList.remove("hidden");
    hideRadarScan();
    showRadarBanner(
      "Розташуйте елементи на свої місця",
      "Перетягни всі 6 елементів на правильні координати."
    );
    renderRadarPlacements(teamRadar);
    renderRadarTray(teamRadar);
    checkRadarButton.classList.remove("hidden");
    checkRadarButton.disabled = Object.keys(radarState.placements).length !== teamRadar.items.length;
  }

  if (radarState.phase === "scan-to-place") {
    hideRadarCountdown();
    radarTray.classList.add("hidden");
    radarItemsColumn?.classList.add("hidden");
    hideRadarBanner();
    hideRadarFinalOverlay();
    showRadarScan("Сканування місцевості...");
    checkRadarButton.classList.add("hidden");
  }

  if (radarState.phase === "checking") {
    hideRadarCountdown();
    hideRadarFinalOverlay();
    radarItemsColumn?.classList.remove("hidden");
    radarTray.classList.remove("hidden");
    renderRadarPlacements(teamRadar);
    renderRadarTray(teamRadar);
    showRadarScan("Радар шукає співпадіння...");
    hideRadarBanner();
    checkRadarButton.classList.add("hidden");
  }

  if (radarState.phase === "revealing") {
    hideRadarCountdown();
    hideRadarFinalOverlay();
    radarItemsColumn?.classList.remove("hidden");
    radarTray.classList.remove("hidden");
    hideRadarScan();
    renderRadarPlacements(teamRadar);
    renderRadarTray(teamRadar);
    applyRadarVerification();
    showRadarBanner(
      "Перевірка триває",
      "Радар послідовно звіряє кожен предмет."
    );
    checkRadarButton.classList.add("hidden");
  }

  if (radarState.phase === "results") {
    hideRadarCountdown();
    radarItemsColumn?.classList.remove("hidden");
    radarTray.classList.remove("hidden");
    hideRadarScan();
    renderRadarPlacements(teamRadar);
    renderRadarTray(teamRadar);
    applyRadarVerification();

    const correctCount = Object.values(radarState.verification).filter(Boolean).length;
    hideRadarBanner();
    showRadarFinalOverlay(correctCount, teamRadar.items.length);
    checkRadarButton.classList.remove("hidden");
    checkRadarButton.disabled = false;
  }
}

function startRadarSequence(teamName) {
  const teamRadar = getTeamRadar(teamName);

  if (!teamRadar) {
    return;
  }

  resetRadarState();
  radarState.phase = "idle";
  radarState.secondsLeft = RADAR_MEMORIZE_SECONDS;
  renderRadar(teamName);
  playTone({ frequency: 620, type: "triangle", duration: 0.1, gain: 0.04 });
  playTone({ frequency: 930, type: "triangle", duration: 0.12, gain: 0.035, when: 0.08 });
  showRadarCountdown(RADAR_START_COUNTDOWN_SECONDS);

  function beginMemorizePhase() {
    hideRadarCountdown();
    radarState.phase = "memorize";
    radarState.secondsLeft = RADAR_MEMORIZE_SECONDS;
    renderRadar(teamName);

    radarTimerIntervalId = window.setInterval(() => {
      radarState.secondsLeft -= 1;
      updateRadarStatus();

      if (radarState.secondsLeft <= 0) {
        window.clearInterval(radarTimerIntervalId);
        radarTimerIntervalId = null;
        radarState.phase = "scan-to-place";
        renderRadar(teamName);
        playRadarSweepSound();

        radarScanTimeoutId = window.setTimeout(() => {
          radarState.phase = "placing";
          renderRadar(teamName);
        }, RADAR_SCAN_DELAY);
      }
    }, 1000);
  }

  function runCountdown(value) {
    showRadarCountdown(value);

    if (value <= 1) {
      radarCountdownTimeoutId = window.setTimeout(() => {
        beginMemorizePhase();
      }, 1000);
      return;
    }

    radarCountdownTimeoutId = window.setTimeout(() => {
      runCountdown(value - 1);
    }, 1000);
  }

  runCountdown(RADAR_START_COUNTDOWN_SECONDS);
}

function runRadarRevealSequence(teamName, revealIndex = 0) {
  const teamRadar = getTeamRadar(teamName);

  if (!teamRadar) {
    return;
  }

  const entry = radarState.verificationEntries[revealIndex];

  if (!entry) {
    radarState.currentRevealItemId = null;
    radarState.currentRevealPlacementKey = null;
    radarState.currentRevealIsCorrect = null;
    radarState.phase = "results";
    renderRadar(teamName);
    return;
  }

  radarState.phase = "revealing";
  radarState.currentRevealItemId = entry.itemId;
  radarState.currentRevealPlacementKey = entry.actualKey;
  radarState.currentRevealIsCorrect = entry.isCorrect;
  renderRadar(teamName);
  playRadarRevealSound(entry.isCorrect);

  radarRevealTimeoutId = window.setTimeout(() => {
    radarState.revealedCells[entry.actualKey] = entry.isCorrect;
    radarState.currentRevealItemId = null;
    radarState.currentRevealPlacementKey = null;
    radarState.currentRevealIsCorrect = null;
    renderRadar(teamName);

    radarRevealTimeoutId = window.setTimeout(() => {
      runRadarRevealSequence(teamName, revealIndex + 1);
    }, RADAR_REVEAL_GAP_DELAY);
  }, RADAR_REVEAL_STEP_DELAY);
}

function verifyRadarPlacements(teamName) {
  const teamRadar = getTeamRadar(teamName);

  if (!teamRadar) {
    return;
  }

  radarState.phase = "checking";
  radarState.verification = {};
  radarState.revealedCells = {};
  radarState.currentRevealItemId = null;
  radarState.currentRevealPlacementKey = null;
  radarState.currentRevealIsCorrect = null;
  renderRadar(teamName);
  playRadarSweepSound();

  radarScanTimeoutId = window.setTimeout(() => {
    radarState.verificationEntries = teamRadar.items.map((item) => {
      const expectedKey = `${item.row}-${item.col}`;
      const actualKey = radarState.placements[item.id];
      return {
        itemId: item.id,
        actualKey,
        expectedKey,
        isCorrect: expectedKey === actualKey,
      };
    });

    radarState.verification = Object.fromEntries(
      radarState.verificationEntries.map((entry) => [entry.actualKey, entry.isCorrect])
    );
    runRadarRevealSequence(teamName);
  }, RADAR_SCAN_DELAY);
}

function showLogin() {
  if (revealTimeoutId) {
    window.clearTimeout(revealTimeoutId);
    revealTimeoutId = null;
  }
  clearRadarTimers();
  clearAccessTimers();
  hideAccessResultOverlay();
  hideAccessGateOverlay();
  resetRadarState();
  hideQuizResultOverlay();
  loginPanel.classList.remove("hidden");
  homePanel.classList.add("hidden");
  teamInput.focus();
}

function showHome(teamName) {
  const teamContent = getTeamContent(teamName);
  const teamQuiz = getTeamQuiz(teamName);
  const teamRadar = getTeamRadar(teamName);
  const teamAccess = getTeamAccessCode(teamName);

  if (!teamContent || !teamQuiz || !teamRadar || !teamAccess) {
    showLogin();
    return;
  }

  currentTeam = teamName;
  teamHeading.textContent = teamContent.heading;
  renderQuiz(teamName);
  resetRadarState();
  renderRadar(teamName);
  renderAccess(teamName);
  setActiveTab(activeTab);

  loginPanel.classList.add("hidden");
  homePanel.classList.remove("hidden");
}

function login(teamName) {
  const normalizedTeam = normalizeTeamName(teamName);
  const teamContent = getTeamContent(normalizedTeam);

  if (!teamContent) {
    errorMessage.textContent = "Введи тільки Team 1 або Team 2.";
    return;
  }

  errorMessage.textContent = "";
  localStorage.setItem(STORAGE_KEY, normalizedTeam);
  showHome(normalizedTeam);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  login(teamInput.value);
});

quickSelectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const teamName = button.dataset.team;
    teamInput.value = teamName;
    login(teamName);
  });
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  teamInput.value = "";
  errorMessage.textContent = "";
  currentTeam = null;
  showLogin();
});

quizTabButton.addEventListener("click", () => {
  setActiveTab("quiz");
});

radarTabButton.addEventListener("click", () => {
  setActiveTab("radar");
});

videoTabButton.addEventListener("click", () => {
  setActiveTab("video");
});

accessTabButton.addEventListener("click", () => {
  setActiveTab("access");
});

videoSwitchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const videoKey = button.dataset.videoKey;
    setMissionVideo(videoKey, true, true);
  });
});

resetQuizButton.addEventListener("click", () => {
  if (!currentTeam) {
    return;
  }

  if (revealTimeoutId) {
    window.clearTimeout(revealTimeoutId);
    revealTimeoutId = null;
  }

  quizState[currentTeam] = createDefaultTeamQuizState(currentTeam);
  saveQuizState();
  hideQuizResultOverlay();
  renderQuiz(currentTeam);
});

startRadarButton.addEventListener("click", () => {
  if (!currentTeam) {
    return;
  }

  startRadarSequence(currentTeam);
});

checkRadarButton.addEventListener("click", () => {
  if (!currentTeam || radarState.phase !== "placing") {
    return;
  }

  verifyRadarPlacements(currentTeam);
});

if (radarFinalOverlay) {
  radarFinalOverlay.addEventListener("click", (event) => {
    if (event.button !== 0) {
      return;
    }

    hideRadarFinalOverlay();
  });
}

if (radarSizeSlider) {
  updateRadarBoardSize(radarSizeSlider.value);

  radarSizeSlider.addEventListener("input", (event) => {
    updateRadarBoardSize(event.target.value);
  });
}

if (accessForm) {
  accessForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!currentTeam) {
      return;
    }

    const teamAccess = getTeamAccessCode(currentTeam);

    if (!teamAccess) {
      return;
    }

    const enteredCode = Array.from(accessInputs).map((input) =>
      input.value.trim().toUpperCase()
    );
    const expectedCode = teamAccess.code.map((part) => String(part).trim().toUpperCase());
    const isValid =
      enteredCode.length === expectedCode.length &&
      enteredCode.every((part, index) => part && part === expectedCode[index]);

    showAccessResult(isValid);
  });
}

if (accessResetButton) {
  accessResetButton.addEventListener("click", () => {
    clearAccessTimers();
    hideAccessResultOverlay();
    hideAccessGateOverlay();
    resetAccessInputs();
  });
}

if (accessResultOverlay) {
  accessResultOverlay.addEventListener("click", (event) => {
    if (event.button !== 0) {
      return;
    }

    clearAccessTimers();
    hideAccessResultOverlay();
  });
}

if (accessGateOverlay) {
  accessGateOverlay.addEventListener("click", (event) => {
    if (event.button !== 0) {
      return;
    }

    hideAccessGateOverlay();
  });
}

accessInputs.forEach((input, index) => {
  input.addEventListener("input", (event) => {
    const normalizedValue = event.target.value.replace(/\s+/g, "").toUpperCase().slice(0, 1);
    event.target.value = normalizedValue;

    if (normalizedValue) {
      playAccessKeypadSound();
    }

    if (normalizedValue && index < accessInputs.length - 1) {
      accessInputs[index + 1].focus();
      accessInputs[index + 1].select();
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !event.currentTarget.value && index > 0) {
      accessInputs[index - 1].focus();
      accessInputs[index - 1].select();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      accessInputs[index - 1].focus();
      accessInputs[index - 1].select();
    }

    if (event.key === "ArrowRight" && index < accessInputs.length - 1) {
      accessInputs[index + 1].focus();
      accessInputs[index + 1].select();
    }
  });

  input.addEventListener("focus", () => {
    input.select();
  });
});

document.addEventListener("keydown", (event) => {
  if (activeTab !== "video") {
    return;
  }

  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  const key = event.key.toLowerCase();
  const videoKey = VIDEO_HOTKEYS[key];

  if (!videoKey || !VIDEO_SOURCES[videoKey]) {
    return;
  }

  event.preventDefault();
  setMissionVideo(videoKey, true, true);
});

quizState = loadQuizState();

const savedTeam = localStorage.getItem(STORAGE_KEY);

if (savedTeam && getTeamContent(savedTeam)) {
  showHome(savedTeam);
} else {
  showLogin();
}
