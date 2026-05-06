const STORAGE_KEY = "ted-tio-songfestival-speelkopie-2026";
const ADMIN_KEY = "songfestival-admin-pin";
const MY_CHOICE_KEY = "songfestival-my-choice-name";
const API_MODE = location.protocol === "http:" || location.protocol === "https:";

const defaultCountries = [
  { name: "Albanie", entry: "Alis - Nan" },
  { name: "Armenie", entry: "SIMON - Paloma Rumba" },
  { name: "Australie", entry: "Delta Goodrem - Eclipse" },
  { name: "Oostenrijk", entry: "COSMO - Tanzschein" },
  { name: "Azerbeidzjan", entry: "JIVA - Just Go" },
  { name: "Belgie", entry: "ESSYLA - Dancing on the Ice" },
  { name: "Bulgarije", entry: "DARA - Bangaranga" },
  { name: "Kroatie", entry: "LELEK - Andromeda" },
  { name: "Cyprus", entry: "Antigoni - JALLA" },
  { name: "Tsjechie", entry: "Daniel Zizka - CROSSROADS" },
  { name: "Denemarken", entry: "Soren Torpegaard Lund - For Vi Gar Hjem" },
  { name: "Estland", entry: "Vanilla Ninja - Too Epic To Be True" },
  { name: "Finland", entry: "Linda Lampenius x Pete Parkkonen - Liekinheitin" },
  { name: "Frankrijk", entry: "Monroe - Regarde!" },
  { name: "Georgie", entry: "Bzikebi - On Replay" },
  { name: "Duitsland", entry: "Sarah Engels - Fire" },
  { name: "Griekenland", entry: "Akylas - Ferto" },
  { name: "Israel", entry: "Noam Bettan - Michelle" },
  { name: "Italie", entry: "Sal Da Vinci - Per Sempre Si" },
  { name: "Letland", entry: "Atvara - Ena" },
  { name: "Litouwen", entry: "Lion Ceccah - Solo Quiero Mas" },
  { name: "Luxemburg", entry: "Eva Marija - Mother Nature" },
  { name: "Malta", entry: "AIDAN - Bella" },
  { name: "Moldavie", entry: "Satoshi - Viva, Moldova!" },
  { name: "Montenegro", entry: "Tamara Zivkovic - Nova Zora" },
  { name: "Noorwegen", entry: "JONAS LOVV - YA YA YA" },
  { name: "Polen", entry: "ALICJA - Pray" },
  { name: "Portugal", entry: "Bandidos do Cante - Rosa" },
  { name: "Roemenie", entry: "Alexandra Capitanescu - Choke Me" },
  { name: "San Marino", entry: "SENHIT - Superstar" },
  { name: "Servie", entry: "LAVINA - Kraj Mene" },
  { name: "Zweden", entry: "FELICIA - My System" },
  { name: "Zwitserland", entry: "Veronica Fusaro - Alice" },
  { name: "Oekraine", entry: "LELEKA - Ridnym" },
  { name: "Verenigd Koninkrijk", entry: "LOOK MUM NO COMPUTER - Eins, Zwei, Drei" }
];

const semiFinals = {
  semi1: [
    { name: "Moldavie", entry: "Satoshi - Viva, Moldova!" },
    { name: "Zweden", entry: "FELICIA - My System" },
    { name: "Kroatie", entry: "LELEK - Andromeda" },
    { name: "Griekenland", entry: "Akylas - Ferto" },
    { name: "Portugal", entry: "Bandidos do Cante - Rosa" },
    { name: "Georgie", entry: "Bzikebi - On Replay" },
    { name: "Finland", entry: "Linda Lampenius x Pete Parkkonen - Liekinheitin" },
    { name: "Montenegro", entry: "Tamara Zivkovic - Nova Zora" },
    { name: "Estland", entry: "Vanilla Ninja - Too Epic To Be True" },
    { name: "Israel", entry: "Noam Bettan - Michelle" },
    { name: "Belgie", entry: "ESSYLA - Dancing on the Ice" },
    { name: "Litouwen", entry: "Lion Ceccah - Solo Quiero Mas" },
    { name: "San Marino", entry: "SENHIT - Superstar" },
    { name: "Polen", entry: "ALICJA - Pray" },
    { name: "Servie", entry: "LAVINA - Kraj Mene" }
  ],
  semi2: [
    { name: "Bulgarije", entry: "DARA - Bangaranga" },
    { name: "Azerbeidzjan", entry: "JIVA - Just Go" },
    { name: "Roemenie", entry: "Alexandra Capitanescu - Choke Me" },
    { name: "Luxemburg", entry: "Eva Marija - Mother Nature" },
    { name: "Tsjechie", entry: "Daniel Zizka - CROSSROADS" },
    { name: "Armenie", entry: "SIMON - Paloma Rumba" },
    { name: "Zwitserland", entry: "Veronica Fusaro - Alice" },
    { name: "Cyprus", entry: "Antigoni - JALLA" },
    { name: "Letland", entry: "Atvara - Ena" },
    { name: "Denemarken", entry: "Soren Torpegaard Lund - For Vi Gar Hjem" },
    { name: "Australie", entry: "Delta Goodrem - Eclipse" },
    { name: "Oekraine", entry: "LELEKA - Ridnym" },
    { name: "Albanie", entry: "Alis - Nan" },
    { name: "Malta", entry: "AIDAN - Bella" },
    { name: "Noorwegen", entry: "JONAS LOVV - YA YA YA" }
  ]
};

const automaticFinalists = ["Oostenrijk", "Frankrijk", "Duitsland", "Italie", "Verenigd Koninkrijk"];

let state = {
  countries: defaultCountries,
  participants: [],
  actualResult: Array(defaultCountries.length).fill(""),
  semiQualifiers: { semi1: [], semi2: [] },
  votingClosed: { semi1: false, semi2: false, final: false }
};
let editingId = null;
let adminPin = sessionStorage.getItem(ADMIN_KEY) || "";
let activePredictionPhase = "semi1";
let activeResultPhase = "semi1";

const el = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".tab-panel"),
  predictionForm: document.querySelector("#predictionForm"),
  predictionFormTitle: document.querySelector("#predictionFormTitle"),
  cancelEditBtn: document.querySelector("#cancelEditBtn"),
  predictionSelects: document.querySelector("#predictionSelects"),
  predictionPhaseButtons: document.querySelectorAll("[data-prediction-phase]"),
  predictionPhasePanels: document.querySelectorAll("[data-prediction-panel]"),
  semi1Predictions: document.querySelector("#semi1Predictions"),
  semi2Predictions: document.querySelector("#semi2Predictions"),
  playerName: document.querySelector("#playerName"),
  predictionMessage: document.querySelector("#predictionMessage"),
  participantList: document.querySelector("#participantList"),
  playerCount: document.querySelector("#playerCount"),
  completeCount: document.querySelector("#completeCount"),
  winnerCount: document.querySelector("#winnerCount"),
  capacityLabel: document.querySelector("#capacityLabel"),
  resultForm: document.querySelector("#resultForm"),
  resultPhaseButtons: document.querySelectorAll("[data-result-phase]"),
  resultPhasePanels: document.querySelectorAll("[data-result-panel]"),
  votingControls: document.querySelector("#votingControls"),
  semi1ResultRows: document.querySelector("#semi1ResultRows"),
  semi2ResultRows: document.querySelector("#semi2ResultRows"),
  resultRows: document.querySelector("#resultRows"),
  resultMessage: document.querySelector("#resultMessage"),
  clearResultsBtn: document.querySelector("#clearResultsBtn"),
  scoreboardList: document.querySelector("#scoreboardList"),
  scoreSummary: document.querySelector("#scoreSummary"),
  printBtn: document.querySelector("#printBtn"),
  topPicksBtn: document.querySelector("#topPicksBtn"),
  countryForm: document.querySelector("#countryForm"),
  countryName: document.querySelector("#countryName"),
  countryEntry: document.querySelector("#countryEntry"),
  countryVideoUrl: document.querySelector("#countryVideoUrl"),
  countryList: document.querySelector("#countryList"),
  countryCount: document.querySelector("#countryCount"),
  restoreCountriesBtn: document.querySelector("#restoreCountriesBtn"),
  syncStatus: document.querySelector("#syncStatus"),
  adminBtn: document.querySelector("#adminBtn"),
  myChoiceBtn: document.querySelector("#myChoiceBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  choiceModal: document.querySelector("#choiceModal"),
  choiceContent: document.querySelector("#choiceContent"),
  closeChoiceBtn: document.querySelector("#closeChoiceBtn"),
  topPicksModal: document.querySelector("#topPicksModal"),
  topPicksContent: document.querySelector("#topPicksContent"),
  closeTopPicksBtn: document.querySelector("#closeTopPicksBtn")
};

function isAdmin() {
  return Boolean(adminPin);
}

function setStatus(text, type = "") {
  el.syncStatus.textContent = text;
  el.syncStatus.className = `sync-status ${type}`.trim();
}

function normalizeSemiQualifiers(value = {}) {
  return {
    semi1: Array.isArray(value.semi1) ? value.semi1 : [],
    semi2: Array.isArray(value.semi2) ? value.semi2 : []
  };
}

function normalizeVotingClosed(value = {}) {
  return {
    semi1: Boolean(value.semi1),
    semi2: Boolean(value.semi2),
    final: Boolean(value.final)
  };
}

function normalizePlayer(player) {
  return {
    ...player,
    attendingParty: Boolean(player.attendingParty),
    prediction: {
      top5: Array.isArray(player.prediction?.top5) ? player.prediction.top5 : [],
      last: player.prediction?.last || "",
      semi1: Array.isArray(player.prediction?.semi1) ? player.prediction.semi1 : [],
      semi2: Array.isArray(player.prediction?.semi2) ? player.prediction.semi2 : []
    }
  };
}

function normalizeState(nextState) {
  return {
    countries: Array.isArray(nextState.countries) ? nextState.countries : defaultCountries,
    participants: Array.isArray(nextState.participants) ? nextState.participants.map(normalizePlayer) : [],
    actualResult: Array.isArray(nextState.actualResult) ? nextState.actualResult : Array(defaultCountries.length).fill(""),
    semiQualifiers: normalizeSemiQualifiers(nextState.semiQualifiers),
    votingClosed: normalizeVotingClosed(nextState.votingClosed)
  };
}

function loadLocalState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.countries) && Array.isArray(saved.participants)) {
      return normalizeState({
        countries: saved.countries,
        participants: saved.participants.map(normalizePlayer),
        actualResult: Array.isArray(saved.actualResult) ? saved.actualResult : Array(saved.countries.length).fill(""),
        semiQualifiers: normalizeSemiQualifiers(saved.semiQualifiers),
        votingClosed: normalizeVotingClosed(saved.votingClosed)
      });
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return {
    countries: defaultCountries,
    participants: [],
    actualResult: Array(defaultCountries.length).fill(""),
    semiQualifiers: { semi1: [], semi2: [] },
    votingClosed: { semi1: false, semi2: false, final: false }
  };
}

function saveLocalState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (adminPin) headers["x-admin-pin"] = adminPin;
  const response = await fetch(path, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Actie mislukt");
  return body;
}

async function refreshState() {
  if (!API_MODE) {
    state = loadLocalState();
    setStatus("Lokaal", "");
    renderAll();
    return;
  }

  try {
    state = normalizeState(await api("/api/state"));
    setStatus(isAdmin() ? "Online beheer" : "Online", "online");
    renderAll();
  } catch {
    setStatus("Geen verbinding", "offline");
    renderAll();
  }
}

async function persistLocalOrRefresh(action) {
  if (API_MODE) {
    await action();
    await refreshState();
  } else {
    await action();
    saveLocalState();
    renderAll();
  }
}

function countryLabel(name) {
  const country = state.countries.find((item) => item.name === name);
  return country?.entry ? `${country.name} (${country.entry})` : name;
}

function videoSearchUrl(country) {
  const query = `${country.name} ${country.entry || ""} official video Eurovision`.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function countryVideoUrl(country) {
  return country.videoUrl || videoSearchUrl(country);
}

function videoLinkForCountry(country) {
  return `<a class="video-link" href="${escapeHtml(countryVideoUrl(country))}" target="_blank" rel="noopener">Videoclip</a>`;
}

function videoLinkForCountryName(name) {
  const country = state.countries.find((item) => item.name === name);
  return country ? videoLinkForCountry(country) : "";
}

function semiCountryLabel(item) {
  return item.entry ? `${item.name} (${item.entry})` : item.name;
}

function selectOptions(selected = "") {
  const options = ['<option value="" class="placeholder-option">Kies een land</option>'];
  getFinalCountries().forEach((country) => {
    const value = escapeHtml(country.name);
    const entry = country.entry ? ` (${country.entry})` : "";
    const label = `${escapeHtml(country.name)}${escapeHtml(entry)}`;
    options.push(`<option class="country-option" value="${value}" ${country.name === selected ? "selected" : ""}>${label}</option>`);
  });
  return options.join("");
}

function getFinalCountryNames() {
  return [...new Set([
    ...automaticFinalists,
    ...(state.semiQualifiers?.semi1 || []),
    ...(state.semiQualifiers?.semi2 || [])
  ])];
}

function getFinalCountries() {
  const finalistNames = getFinalCountryNames();
  return state.countries.filter((country) => finalistNames.includes(country.name));
}

function hasCompleteFinalistList() {
  return state.semiQualifiers?.semi1?.length === 10 && state.semiQualifiers?.semi2?.length === 10;
}

function renderPredictionSelects(values = {}) {
  const labels = [
    ["top1", "1e plaats"],
    ["top2", "2e plaats"],
    ["top3", "3e plaats"],
    ["top4", "4e plaats"],
    ["top5", "5e plaats"],
    ["last", "Laatste plaats"]
  ];

  const finalistHint = hasCompleteFinalistList()
    ? ""
    : `<p class="hint">De finalelijst is nog niet compleet. Vul eerst de echte doorgangers van beide halve finales in; nu zie je alleen de automatisch geplaatste finalisten.</p>`;

  el.predictionSelects.innerHTML = `${finalistHint}${labels.map(([key, label]) => `
    <label>
      ${label}
      <select name="${key}">${selectOptions(values[key] || "")}</select>
    </label>
  `).join("")}`;

  el.predictionSelects.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", validatePredictionSelects);
  });
  validatePredictionSelects();
}

function renderSemiPredictionGroup(target, semiKey, selected = []) {
  target.innerHTML = semiFinals[semiKey].map((country) => `
    <label class="check-row">
      <input type="checkbox" name="${semiKey}" value="${escapeHtml(country.name)}" ${selected.includes(country.name) ? "checked" : ""}>
      <span>
        <strong>${escapeHtml(country.name)}</strong>
        <small>${escapeHtml(country.entry)}</small>
        ${videoLinkForCountryName(country.name)}
      </span>
    </label>
  `).join("");

  target.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", (event) => enforceSemiLimit(event, target, document.querySelector(`#${semiKey}PredictionCount`), el.predictionMessage));
  });
}

function renderSemiPredictions(values = {}) {
  renderSemiPredictionGroup(el.semi1Predictions, "semi1", values.semi1 || []);
  renderSemiPredictionGroup(el.semi2Predictions, "semi2", values.semi2 || []);
  validateSemiPredictionChecks();
}

function renderResultRows() {
  const rows = [];
  const finalCountries = getFinalCountries();
  const totalRows = Math.max(finalCountries.length, 6);
  for (let index = 0; index < totalRows; index += 1) {
    const label = index === totalRows - 1 ? "Laatste plaats" : `${index + 1}e plaats`;
    const storedValue = index === totalRows - 1
      ? state.actualResult[state.actualResult.length - 1]
      : state.actualResult[index];

    rows.push(`
      <label>
        ${label}
        <select name="result-${index}">
          ${selectOptions(storedValue || "")}
        </select>
      </label>
    `);
  }
  const finalistHint = hasCompleteFinalistList()
    ? ""
    : `<p class="hint">De finalelijst is nog niet compleet. Vul eerst de echte doorgangers van beide halve finales in; nu zie je alleen de automatisch geplaatste finalisten.</p>`;
  el.resultRows.innerHTML = `${finalistHint}${rows.join("")}`;
  el.resultRows.querySelectorAll("select").forEach((select) => {
    select.disabled = API_MODE && !isAdmin();
    select.addEventListener("change", validateResultSelects);
  });
  validateResultSelects();
}

function renderSemiResultRows() {
  [
    ["semi1", el.semi1ResultRows],
    ["semi2", el.semi2ResultRows]
  ].forEach(([semiKey, target]) => {
    target.innerHTML = `
      <div class="semi-heading">
        <h4>${semiKey === "semi1" ? "Eerste halve finale" : "Tweede halve finale"}</h4>
        <span id="${semiKey}ResultCount" class="capacity">0 / 10</span>
      </div>
      <div class="check-grid" data-semi-result="${semiKey}">
        ${semiFinals[semiKey].map((country) => `
          <label class="check-row">
            <input type="checkbox" name="${semiKey}-result" value="${escapeHtml(country.name)}" ${state.semiQualifiers?.[semiKey]?.includes(country.name) ? "checked" : ""}>
            <span>
              <strong>${escapeHtml(country.name)}</strong>
              <small>${escapeHtml(country.entry)}</small>
              ${videoLinkForCountryName(country.name)}
            </span>
          </label>
        `).join("")}
      </div>
    `;
  });

  [el.semi1ResultRows, el.semi2ResultRows].forEach((target) => {
    target.querySelectorAll("input").forEach((input) => {
      input.disabled = API_MODE && !isAdmin();
      const semiKey = input.name.replace("-result", "");
      input.addEventListener("change", (event) => enforceSemiLimit(event, target.querySelector(`[data-semi-result="${semiKey}"]`), document.querySelector(`#${semiKey}ResultCount`), el.resultMessage));
    });
  });
  validateSemiResultChecks();
}

function validatePredictionSelects() {
  const selects = [...el.predictionSelects.querySelectorAll("select")];
  const values = selects.map((select) => select.value).filter(Boolean);
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  selects.forEach((select) => select.classList.toggle("invalid", Boolean(select.value && duplicates.includes(select.value))));
  return duplicates.length === 0;
}

function checkedValues(container) {
  return [...container.querySelectorAll("input:checked")].map((input) => input.value);
}

function validateSemiGroup(container, countNode) {
  const checked = checkedValues(container);
  const isValid = checked.length === 10;
  container.classList.toggle("invalid", !isValid);
  if (countNode) {
    countNode.textContent = `${checked.length} / 10`;
    countNode.classList.toggle("invalid-count", !isValid);
  }
  return isValid;
}

function enforceSemiLimit(event, container, countNode, messageTarget) {
  if (event.target.checked && checkedValues(container).length > 10) {
    event.target.checked = false;
    showMessage(messageTarget, "Er zijn al 10 landen aangevinkt.", "error");
  }
  validateSemiGroup(container, countNode);
}

function validateSemiPredictionChecks() {
  const semi1Valid = validateSemiGroup(el.semi1Predictions, document.querySelector("#semi1PredictionCount"));
  const semi2Valid = validateSemiGroup(el.semi2Predictions, document.querySelector("#semi2PredictionCount"));
  return semi1Valid && semi2Valid;
}

function validateResultSelects() {
  const selects = [...el.resultRows.querySelectorAll("select")];
  const values = selects.map((select) => select.value).filter(Boolean);
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  selects.forEach((select) => select.classList.toggle("invalid", Boolean(select.value && duplicates.includes(select.value))));
  return duplicates.length === 0;
}

function validateSemiResultChecks() {
  const semi1Valid = validateSemiGroup(el.semi1ResultRows.querySelector('[data-semi-result="semi1"]'), document.querySelector("#semi1ResultCount"));
  const semi2Valid = validateSemiGroup(el.semi2ResultRows.querySelector('[data-semi-result="semi2"]'), document.querySelector("#semi2ResultCount"));
  return semi1Valid && semi2Valid;
}

function setPredictionPhase(phase) {
  activePredictionPhase = phase;
  el.predictionPhaseButtons.forEach((button) => button.classList.toggle("active", button.dataset.predictionPhase === phase));
  el.predictionPhasePanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.predictionPanel === phase));
  renderPermissions();
}

function setResultPhase(phase) {
  activeResultPhase = phase;
  el.resultPhaseButtons.forEach((button) => button.classList.toggle("active", button.dataset.resultPhase === phase));
  el.resultPhasePanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.resultPanel === phase));
  renderPermissions();
}

function renderVotingControls() {
  const labels = {
    semi1: "Eerste halve finale",
    semi2: "Tweede halve finale",
    final: "Finale"
  };

  el.votingControls.innerHTML = Object.entries(labels).map(([phase, label]) => {
    const closed = state.votingClosed?.[phase];
    return `
      <button class="${closed ? "danger-btn" : "ghost-btn"} lock-btn" type="button" data-toggle-voting="${phase}">
        ${escapeHtml(label)}: ${closed ? "gesloten" : "open"}
      </button>
    `;
  }).join("");

  el.votingControls.querySelectorAll("button").forEach((button) => {
    button.disabled = API_MODE && !isAdmin();
  });
}

function renderParticipants() {
  el.capacityLabel.textContent = `${state.participants.length} deelnemers`;
  if (!state.participants.length) {
    el.participantList.innerHTML = `<div class="empty-state">Nog geen voorspellingen opgeslagen.</div>`;
    return;
  }

  el.participantList.innerHTML = state.participants.map((player) => `
    <article class="participant-card">
      <header>
        <h4>${escapeHtml(player.name)}</h4>
        <div class="participant-actions ${API_MODE && !isAdmin() ? "hidden" : ""}">
          <button class="icon-btn" type="button" data-edit="${player.id}" title="Bewerk">B</button>
          <button class="icon-btn" type="button" data-delete="${player.id}" title="Verwijder">X</button>
        </div>
      </header>
      <div class="round-status-list">
        ${participantRoundStatus("HF1", player.prediction.semi1.length === 10)}
        ${participantRoundStatus("HF2", player.prediction.semi2.length === 10)}
        ${participantRoundStatus("Finale", player.prediction.top5.length === 5 && player.prediction.top5.every(Boolean) && Boolean(player.prediction.last))}
      </div>
    </article>
  `).join("");
}

function participantRoundStatus(label, done) {
  return `<span class="round-status ${done ? "done" : ""}">${escapeHtml(label)}: ${done ? "ingevuld" : "open"}</span>`;
}

function calculateScores() {
  const actualTop5 = state.actualResult.slice(0, 5);
  const actualLast = state.actualResult[state.actualResult.length - 1] || "";
  const canScoreFinal = actualTop5.every(Boolean) && Boolean(actualLast);
  const canScoreSemi1 = state.semiQualifiers?.semi1?.length === 10;
  const canScoreSemi2 = state.semiQualifiers?.semi2?.length === 10;
  const canScore = canScoreFinal || canScoreSemi1 || canScoreSemi2;

  return state.participants.map((player) => {
    let finalPoints = 0;
    let top5Any = 0;
    const details = [];

    if (canScoreFinal) {
      player.prediction.top5.forEach((country, index) => {
        if (country === actualTop5[index]) {
          finalPoints += 1;
          details.push(`${index + 1}: raak`);
        } else if (actualTop5.includes(country)) {
          top5Any += 1;
          details.push(`${index + 1}: top 5`);
        }
      });
    }

    const lastCorrect = canScoreFinal && player.prediction.last === actualLast;
    if (lastCorrect) finalPoints += 1;

    const semi1Points = canScoreSemi1 ? player.prediction.semi1.filter((country) => state.semiQualifiers.semi1.includes(country)).length : 0;
    const semi2Points = canScoreSemi2 ? player.prediction.semi2.filter((country) => state.semiQualifiers.semi2.includes(country)).length : 0;
    const semiPoints = semi1Points + semi2Points;

    return {
      id: player.id,
      name: player.name,
      exact: canScore ? finalPoints + semiPoints : 0,
      finalPoints: canScoreFinal ? finalPoints : 0,
      semiPoints,
      semi1Points,
      semi2Points,
      top5Any: canScoreFinal ? top5Any : 0,
      lastCorrect,
      details
    };
  }).sort((a, b) => b.exact - a.exact || b.semiPoints - a.semiPoints || b.top5Any - a.top5Any || a.name.localeCompare(b.name, "nl"));
}

function renderScoreboard() {
  const scores = calculateScores();
  const canScoreFinal = state.actualResult.slice(0, 5).every(Boolean) && Boolean(state.actualResult[state.actualResult.length - 1]);
  const canScoreSemis = state.semiQualifiers?.semi1?.length === 10 || state.semiQualifiers?.semi2?.length === 10;
  const canScore = canScoreFinal || canScoreSemis;
  const topScore = scores[0]?.exact || 0;
  const leaders = canScore ? scores.filter((score) => score.exact === topScore) : [];

  el.topPicksBtn.disabled = !canScoreFinal;
  el.topPicksBtn.textContent = canScoreFinal ? "Nummer 1 keuzes" : "Vrij na de uitslag";
  el.topPicksBtn.title = canScoreFinal
    ? "Bekijk welke landen als nummer 1 zijn gekozen"
    : "Deze knop wordt vrijgegeven nadat de einduitslag is ingevuld";
  el.winnerCount.textContent = leaders.length;
  el.scoreSummary.innerHTML = `
    <div class="summary-card"><strong>${canScore ? leaders.map((leader) => escapeHtml(leader.name)).join(", ") : "Nog onbekend"}</strong><span>${leaders.length > 1 ? "gedeelde koppositie" : "winnaar"}</span></div>
    <div class="summary-card"><strong>${canScore ? topScore : "-"}</strong><span>punten totaal</span></div>
    <div class="summary-card"><strong>${state.participants.length}</strong><span>deelnemers in de poule</span></div>
  `;

  if (!state.participants.length) {
    el.scoreboardList.innerHTML = `<div class="empty-state">Voeg eerst deelnemers toe.</div>`;
    return;
  }

  if (!canScore) {
    el.scoreboardList.innerHTML = `<div class="empty-state">Vul de halve-finale qualifiers of einduitslag in om de ranglijst te berekenen.</div>`;
    return;
  }

  el.scoreboardList.innerHTML = scores.map((score, index) => `
    <article class="score-row">
      <div class="rank-badge">${index + 1}</div>
      <div>
        <h4>${escapeHtml(score.name)}</h4>
        <p>${score.details.length ? escapeHtml(score.details.join(" · ")) : "Geen top-5 treffer"}${score.lastCorrect ? " · laatste raak" : ""}</p>
        <div class="score-meta">
          <span>${score.top5Any} in top 5 op andere plek</span>
          <span>${score.lastCorrect ? "laatste goed" : "laatste mis"}</span>
        </div>
      </div>
      <div class="score-points">${score.exact} / 6</div>
    </article>
  `).join("");
}

function renderScoreboard() {
  const scores = calculateScores();
  const canScoreFinal = state.actualResult.slice(0, 5).every(Boolean) && Boolean(state.actualResult[state.actualResult.length - 1]);
  const canScoreSemis = state.semiQualifiers?.semi1?.length === 10 || state.semiQualifiers?.semi2?.length === 10;
  const canScore = canScoreFinal || canScoreSemis;
  const topScore = scores[0]?.exact || 0;
  const leaders = canScore ? scores.filter((score) => score.exact === topScore) : [];

  el.topPicksBtn.disabled = !canScoreFinal;
  el.topPicksBtn.textContent = canScoreFinal ? "Nummer 1 keuzes" : "Vrij na de uitslag";
  el.topPicksBtn.title = canScoreFinal
    ? "Bekijk welke landen als nummer 1 zijn gekozen"
    : "Deze knop wordt vrijgegeven nadat de einduitslag is ingevuld";
  el.winnerCount.textContent = leaders.length;
  el.scoreSummary.innerHTML = `
    <div class="summary-card"><strong>${canScore ? leaders.map((leader) => escapeHtml(leader.name)).join(", ") : "Nog onbekend"}</strong><span>${leaders.length > 1 ? "gedeelde koppositie" : "winnaar"}</span></div>
    <div class="summary-card"><strong>${canScore ? topScore : "-"}</strong><span>punten totaal</span></div>
    <div class="summary-card"><strong>${state.participants.length}</strong><span>deelnemers in de poule</span></div>
  `;

  if (!state.participants.length) {
    el.scoreboardList.innerHTML = `<div class="empty-state">Voeg eerst deelnemers toe.</div>`;
    return;
  }

  if (!canScore) {
    el.scoreboardList.innerHTML = `<div class="empty-state">Vul de halve-finale qualifiers of einduitslag in om de ranglijst te berekenen.</div>`;
    return;
  }

  el.scoreboardList.innerHTML = scores.map((score, index) => `
    <article class="score-row">
      <div class="rank-badge">${index + 1}</div>
      <div>
        <h4>${escapeHtml(score.name)}</h4>
        <p>${score.details.length ? escapeHtml(score.details.join(" - ")) : "Geen top-5 treffer"}${score.lastCorrect ? " - laatste raak" : ""}</p>
        <div class="score-meta">
          <span>halve finales: ${score.semiPoints} / 20</span>
          <span>finale: ${score.finalPoints} / 6</span>
        </div>
      </div>
      <div class="score-points">${score.exact} / 26</div>
    </article>
  `).join("");
}

function renderCountries() {
  el.countryCount.textContent = `${state.countries.length} landen`;
  el.countryList.innerHTML = state.countries.map((country) => `
    <article class="country-row">
      <div>
        <strong>${escapeHtml(country.name)}</strong>
        <span>${escapeHtml(country.entry || "Geen artiest/liedje ingevuld")}</span>
        ${videoLinkForCountry(country)}
      </div>
      <button class="icon-btn ${API_MODE && !isAdmin() ? "hidden" : ""}" type="button" data-remove-country="${escapeHtml(country.name)}" title="Verwijder">X</button>
    </article>
  `).join("");
}

function renderStats() {
  el.playerCount.textContent = state.participants.length;
  el.completeCount.textContent = state.participants.filter((player) => player.prediction.top5.every(Boolean) && player.prediction.last && player.prediction.semi1.length === 10 && player.prediction.semi2.length === 10).length;
}

function renderPermissions() {
  const locked = API_MODE && !isAdmin();
  const phaseClosed = Boolean(state.votingClosed?.[activePredictionPhase]);
  const finalReady = hasCompleteFinalistList();
  document.querySelector('[data-tab="results"]').disabled = false;
  document.querySelector('[data-tab="countries"]').disabled = false;
  el.predictionPhaseButtons.forEach((button) => {
    button.disabled = button.dataset.predictionPhase === "final" && !finalReady;
  });
  el.resultPhaseButtons.forEach((button) => {
    button.disabled = button.dataset.resultPhase === "final" && !finalReady;
  });
  const countriesTab = document.querySelector('[data-tab="countries"]');
  countriesTab.classList.toggle("hidden", API_MODE && !isAdmin());
  if (API_MODE && !isAdmin() && document.querySelector("#countries").classList.contains("active")) {
    switchTab("predictions");
  }
  el.clearResultsBtn.disabled = locked;
  el.resultForm.querySelectorAll(".result-save-btn").forEach((button) => {
    button.disabled = locked;
  });
  el.predictionForm.querySelectorAll("input, select").forEach((node) => {
    if (node.id !== "playerName") node.disabled = phaseClosed;
  });
  el.predictionForm.querySelectorAll(".phase-save-btn").forEach((button) => {
    button.disabled = state.votingClosed?.[button.dataset.savePhase] || (button.dataset.savePhase === "final" && !finalReady);
    button.textContent = state.votingClosed?.[button.dataset.savePhase]
      ? "Stemmen gesloten"
      : button.dataset.savePhase === "final" && !finalReady
        ? "Finale beschikbaar na halve finales"
      : button.dataset.savePhase === "semi1"
        ? "Eerste halve finale opslaan"
        : button.dataset.savePhase === "semi2"
          ? "Tweede halve finale opslaan"
          : "Finale opslaan";
  });
  el.countryForm.querySelectorAll("input, button").forEach((node) => {
    if (node.id !== "restoreCountriesBtn") node.disabled = locked;
  });
  el.restoreCountriesBtn.disabled = locked;
  el.resetBtn.disabled = locked;
  el.adminBtn.textContent = isAdmin() ? "Beheer aan" : "Beheer";
  renderVotingControls();
}

function renderAll() {
  renderPredictionSelects();
  renderSemiPredictions();
  renderResultRows();
  renderSemiResultRows();
  renderParticipants();
  renderScoreboard();
  renderCountries();
  renderStats();
  renderPermissions();
  setPredictionPhase(activePredictionPhase);
  setResultPhase(activeResultPhase);
}

function participantFromForm() {
  const formData = new FormData(el.predictionForm);
  return {
    name: el.playerName.value.trim(),
    prediction: {
      top5: ["top1", "top2", "top3", "top4", "top5"].map((key) => formData.get(key)),
      last: formData.get("last"),
      semi1: checkedValues(el.semi1Predictions),
      semi2: checkedValues(el.semi2Predictions)
    }
  };
}

function emptyPrediction() {
  return { top5: [], last: "", semi1: [], semi2: [] };
}

function participantFromPhase(phase) {
  const name = el.playerName.value.trim();
  if (phase === "semi1" || phase === "semi2") {
    const container = phase === "semi1" ? el.semi1Predictions : el.semi2Predictions;
    return { name, phase, prediction: { [phase]: checkedValues(container) } };
  }

  const formData = new FormData(el.predictionForm);
  return {
    name,
    phase,
    prediction: {
      top5: ["top1", "top2", "top3", "top4", "top5"].map((key) => formData.get(key)),
      last: formData.get("last")
    }
  };
}

function mergeLocalPhaseVote(next) {
  const index = state.participants.findIndex((player) => player.name.toLowerCase() === next.name.toLowerCase());
  const base = index === -1
    ? { id: crypto.randomUUID(), name: next.name, prediction: emptyPrediction() }
    : normalizePlayer(state.participants[index]);

  if (next.phase === "semi1" || next.phase === "semi2") {
    base.prediction[next.phase] = next.prediction[next.phase];
  } else {
    base.prediction.top5 = next.prediction.top5;
    base.prediction.last = next.prediction.last;
  }

  if (index === -1) {
    state.participants.push(base);
  } else {
    state.participants[index] = base;
  }
}

function showMessage(target, message, type = "success") {
  target.textContent = message;
  target.className = `form-message ${type}`;
  window.setTimeout(() => {
    target.textContent = "";
    target.className = "form-message";
  }, 3200);
}

function flashButton(button, className = "is-tapped", duration = 520) {
  if (!button) return;
  button.classList.remove("is-tapped", "is-saved");
  void button.offsetWidth;
  button.classList.add(className);
  window.setTimeout(() => button.classList.remove(className), duration);
}

function phaseLabel(phase) {
  if (phase === "semi1") return "de eerste halve finale";
  if (phase === "semi2") return "de tweede halve finale";
  return "de finale";
}

function showVoteThanks(name, phase = "final") {
  localStorage.setItem(MY_CHOICE_KEY, name);
  el.predictionMessage.innerHTML = `
    <span class="thanks-title">Opgeslagen</span>
    <span>${escapeHtml(name)}, je keuze voor ${escapeHtml(phaseLabel(phase))} is opgeslagen.</span>
  `;
  el.predictionMessage.className = "form-message success thanks-message";
}

function findMyChoice(name = localStorage.getItem(MY_CHOICE_KEY)) {
  const searchName = String(name || "").trim().toLowerCase();
  if (!searchName) return null;
  return state.participants.find((player) => player.name.toLowerCase() === searchName) || null;
}

function renderChoiceModal(searchName = localStorage.getItem(MY_CHOICE_KEY) || "") {
  const player = findMyChoice(searchName);
  const searchForm = `
    <form id="choiceLookupForm" class="choice-lookup">
      <label>
        Vul je naam in
        <input id="choiceLookupName" type="text" maxlength="60" autocomplete="off" value="${escapeHtml(searchName || "")}" placeholder="Voor- en achternaam">
      </label>
      <button class="primary-btn" type="submit">Mijn stemmen tonen</button>
    </form>
  `;

  if (!player) {
    el.choiceContent.innerHTML = `
      ${searchForm}
      <div class="empty-state">We kunnen nog geen opgeslagen stemmen vinden voor deze naam.</div>
    `;
    return;
  }

  localStorage.setItem(MY_CHOICE_KEY, player.name);
  el.choiceContent.innerHTML = `
    ${searchForm}
    <p class="choice-name">${escapeHtml(player.name)}</p>
    <button class="primary-btn share-choice-btn" type="button" data-share-choice="${escapeHtml(player.name)}">Deel als afbeelding</button>
    <ol class="choice-list">
      <li class="choice-section"><strong>Eerste halve finale: ${player.prediction.semi1.length}/10</strong></li>
      ${player.prediction.semi1.map((country) => `
        <li><span>1</span><strong>${escapeHtml(countryLabel(country))}</strong>${videoLinkForCountryName(country)}</li>
      `).join("")}
      <li class="choice-section"><strong>Tweede halve finale: ${player.prediction.semi2.length}/10</strong></li>
      ${player.prediction.semi2.map((country) => `
        <li><span>2</span><strong>${escapeHtml(countryLabel(country))}</strong>${videoLinkForCountryName(country)}</li>
      `).join("")}
      <li class="choice-section"><strong>Finale</strong></li>
      ${player.prediction.top5.map((country, index) => `
        <li><span>${index + 1}</span><strong>${escapeHtml(countryLabel(country))}</strong>${videoLinkForCountryName(country)}</li>
      `).join("")}
      <li class="choice-last"><span>L</span><strong>${escapeHtml(countryLabel(player.prediction.last))}</strong>${videoLinkForCountryName(player.prediction.last)}</li>
    </ol>
  `;
}

function openChoiceModal() {
  renderChoiceModal();
  el.choiceModal.classList.remove("hidden");
}

function closeChoiceModal() {
  el.choiceModal.classList.add("hidden");
}

function choiceRowsForImage(player) {
  return [
    { type: "section", text: `Eerste halve finale (${player.prediction.semi1.length}/10)` },
    ...player.prediction.semi1.map((country) => ({ badge: "1", text: countryLabel(country) })),
    { type: "section", text: `Tweede halve finale (${player.prediction.semi2.length}/10)` },
    ...player.prediction.semi2.map((country) => ({ badge: "2", text: countryLabel(country) })),
    { type: "section", text: "Finale" },
    ...player.prediction.top5.map((country, index) => ({ badge: String(index + 1), text: countryLabel(country) })),
    ...(player.prediction.last ? [{ badge: "L", text: countryLabel(player.prediction.last) }] : [])
  ];
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCoverImage(ctx, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth) {
      line = testLine;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

async function shareChoiceImage(playerName) {
  const player = findMyChoice(playerName);
  if (!player) return;

  const rows = choiceRowsForImage(player);
  const width = 1080;
  const padding = 64;
  const rowGap = 16;
  const coverHeight = 410;
  const rowHeights = rows.map((row) => row.type === "section" ? 64 : 78);
  const height = Math.max(1440, coverHeight + 285 + rowHeights.reduce((sum, value) => sum + value + rowGap, 0));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#050a30");
  gradient.addColorStop(0.44, "#18115a");
  gradient.addColorStop(1, "#050a30");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  try {
    const cover = await loadImage("assets/party-cover.jpg");
    drawCoverImage(ctx, cover, 0, 0, width, coverHeight);
    const overlay = ctx.createLinearGradient(0, 0, 0, coverHeight);
    overlay.addColorStop(0, "rgba(5,10,48,0.08)");
    overlay.addColorStop(1, "rgba(5,10,48,0.78)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, coverHeight);
  } catch {
    ctx.fillStyle = "#111747";
    ctx.fillRect(0, 0, width, coverHeight);
  }

  ctx.fillStyle = "#fff06d";
  ctx.font = "800 26px Segoe UI, Arial, sans-serif";
  ctx.fillText("Eurovision night 2026", padding, 88);
  ctx.fillStyle = "#fffaff";
  ctx.font = "900 58px Segoe UI, Arial, sans-serif";
  ctx.fillText("Ted & Tio's songfestival", padding, 160);

  let y = coverHeight + 70;
  ctx.fillStyle = "#6fffb2";
  ctx.font = "900 42px Segoe UI, Arial, sans-serif";
  ctx.fillText(player.name, padding, y);
  y += 54;
  ctx.fillStyle = "#d4d2ff";
  ctx.font = "700 28px Segoe UI, Arial, sans-serif";
  ctx.fillText("Mijn stemmen", padding, y);
  y += 54;

  rows.forEach((row) => {
    if (row.type === "section") {
      ctx.fillStyle = "rgba(255, 240, 109, 0.12)";
      ctx.fillRect(padding, y, width - padding * 2, 54);
      ctx.fillStyle = "#fff06d";
      ctx.font = "900 27px Segoe UI, Arial, sans-serif";
      ctx.fillText(row.text, padding + 20, y + 36);
      y += 54 + rowGap;
      return;
    }

    const boxHeight = 72;
    ctx.fillStyle = "rgba(3, 7, 34, 0.72)";
    ctx.fillRect(padding, y, width - padding * 2, boxHeight);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.strokeRect(padding, y, width - padding * 2, boxHeight);

    ctx.fillStyle = row.badge === "L" ? "#ff146b" : "#41e7ff";
    ctx.beginPath();
    ctx.arc(padding + 38, y + 36, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#03071e";
    ctx.font = "900 24px Segoe UI, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(row.badge, padding + 38, y + 44);
    ctx.textAlign = "left";

    ctx.fillStyle = "#fffaff";
    ctx.font = "800 25px Segoe UI, Arial, sans-serif";
    const lines = wrapText(ctx, row.text, width - padding * 2 - 100).slice(0, 2);
    lines.forEach((line, index) => ctx.fillText(line, padding + 84, y + 30 + index * 28));
    y += boxHeight + rowGap;
  });

  ctx.fillStyle = "#d4d2ff";
  ctx.font = "700 24px Segoe UI, Arial, sans-serif";
  ctx.fillText("Gemaakt met Ted & Tio's songfestival", padding, height - 54);

  const blob = await canvasToBlob(canvas);
  const fileName = `ted-tio-stemmen-${player.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "deelnemer"}.png`;
  const file = new File([blob], fileName, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Mijn Songfestival stemmen",
      text: "Mijn Ted & Tio Songfestival stemmen"
    });
    return;
  }

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 2000);
}

function getTopPickRows() {
  const counts = new Map();
  state.participants.forEach((player) => {
    const country = player.prediction.top5[0];
    if (!country) return;
    if (!counts.has(country)) counts.set(country, []);
    counts.get(country).push(player.name);
  });

  return [...counts.entries()]
    .map(([country, names]) => ({ country, names, count: names.length }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country, "nl"));
}

function renderTopPicksModal() {
  const canScoreFinal = state.actualResult.slice(0, 5).every(Boolean) && Boolean(state.actualResult[state.actualResult.length - 1]);
  if (!canScoreFinal) {
    el.topPicksContent.innerHTML = `<div class="empty-state">Deze lijst wordt zichtbaar nadat de einduitslag bekend is.</div>`;
    return;
  }

  const rows = getTopPickRows();
  if (!rows.length) {
    el.topPicksContent.innerHTML = `<div class="empty-state">Er zijn nog geen nummer 1 keuzes.</div>`;
    return;
  }

  el.topPicksContent.innerHTML = `
    <div class="top-picks-list">
      ${rows.map((row, index) => `
        <article class="top-pick-row">
          <div class="rank-badge">${index + 1}</div>
          <div>
            <h4>${escapeHtml(countryLabel(row.country))}</h4>
            <p>${escapeHtml(row.names.join(", "))}</p>
          </div>
          <strong>${row.count}x</strong>
        </article>
      `).join("")}
    </div>
  `;
}

function openTopPicksModal() {
  renderTopPicksModal();
  el.topPicksModal.classList.remove("hidden");
}

function closeTopPicksModal() {
  el.topPicksModal.classList.add("hidden");
}

function resetPredictionForm() {
  editingId = null;
  el.predictionForm.reset();
  el.predictionFormTitle.textContent = "Nieuwe voorspelling";
  el.cancelEditBtn.classList.add("hidden");
  renderPredictionSelects();
  renderSemiPredictions();
}

function switchTab(tabName) {
  el.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  el.panels.forEach((panel) => panel.classList.toggle("active", panel.id === tabName));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isCountryUsed(countryName) {
  if (state.actualResult.includes(countryName)) return true;
  if (state.semiQualifiers?.semi1?.includes(countryName) || state.semiQualifiers?.semi2?.includes(countryName)) return true;
  return state.participants.some((player) => player.prediction.top5.includes(countryName) || player.prediction.last === countryName || player.prediction.semi1.includes(countryName) || player.prediction.semi2.includes(countryName));
}

el.tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

el.predictionPhaseButtons.forEach((button) => {
  button.addEventListener("click", () => setPredictionPhase(button.dataset.predictionPhase));
});

el.resultPhaseButtons.forEach((button) => {
  button.addEventListener("click", () => setResultPhase(button.dataset.resultPhase));
});

el.votingControls.addEventListener("click", async (event) => {
  const phase = event.target.dataset.toggleVoting;
  if (!phase) return;
  const closed = !state.votingClosed?.[phase];
  try {
    await persistLocalOrRefresh(async () => {
      const votingClosed = { ...state.votingClosed, [phase]: closed };
      if (API_MODE) {
        await api("/api/voting", { method: "PUT", body: JSON.stringify({ votingClosed }) });
      } else {
        state.votingClosed = votingClosed;
      }
    });
  } catch (error) {
    alert(error.message);
  }
});

el.adminBtn.addEventListener("click", async () => {
  if (!API_MODE) {
    alert("Beheer is automatisch beschikbaar zolang je het bestand lokaal opent.");
    return;
  }
  if (isAdmin() && confirm("Beheer vergrendelen?")) {
    adminPin = "";
    sessionStorage.removeItem(ADMIN_KEY);
    await refreshState();
    return;
  }
  const pin = prompt("Beheer-PIN");
  if (!pin) return;
  adminPin = pin;
  sessionStorage.setItem(ADMIN_KEY, adminPin);
  try {
    await api("/api/admin/check", { method: "POST", body: "{}" });
    await refreshState();
  } catch (error) {
    adminPin = "";
    sessionStorage.removeItem(ADMIN_KEY);
    alert(error.message);
    await refreshState();
  }
});

el.myChoiceBtn.addEventListener("click", openChoiceModal);
el.closeChoiceBtn.addEventListener("click", closeChoiceModal);
el.choiceContent.addEventListener("submit", (event) => {
  if (event.target.id !== "choiceLookupForm") return;
  event.preventDefault();
  const name = document.querySelector("#choiceLookupName")?.value || "";
  renderChoiceModal(name);
});
el.choiceContent.addEventListener("click", async (event) => {
  const playerName = event.target.dataset.shareChoice;
  if (!playerName) return;
  event.target.disabled = true;
  event.target.textContent = "Afbeelding maken...";
  try {
    await shareChoiceImage(playerName);
  } catch {
    alert("De afbeelding kon niet worden gemaakt.");
  } finally {
    event.target.disabled = false;
    event.target.textContent = "Deel als afbeelding";
  }
});
el.choiceModal.addEventListener("click", (event) => {
  if (event.target === el.choiceModal) closeChoiceModal();
});
el.topPicksBtn.addEventListener("click", openTopPicksModal);
el.closeTopPicksBtn.addEventListener("click", closeTopPicksModal);
el.topPicksModal.addEventListener("click", (event) => {
  if (event.target === el.topPicksModal) closeTopPicksModal();
});

el.predictionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  flashButton(event.submitter, "is-tapped", 420);
  const phase = event.submitter?.dataset.savePhase || activePredictionPhase;
  if (phase === "final" && !hasCompleteFinalistList()) {
    showMessage(el.predictionMessage, "De finalelijst is nog niet compleet. Vul eerst de doorgangers van beide halve finales in.", "error");
    return;
  }
  if (state.votingClosed?.[phase]) {
    showMessage(el.predictionMessage, "Stemmen voor deze ronde is gesloten.", "error");
    return;
  }
  if (phase === "final" && !validatePredictionSelects()) {
    showMessage(el.predictionMessage, "Een land mag maar een keer in dezelfde voorspelling staan.", "error");
    return;
  }
  if ((phase === "semi1" || phase === "semi2") && !validateSemiGroup(phase === "semi1" ? el.semi1Predictions : el.semi2Predictions, document.querySelector(`#${phase}PredictionCount`))) {
    showMessage(el.predictionMessage, "Kies precies 10 landen.", "error");
    return;
  }

  const next = participantFromPhase(phase);
  if (!next.name) {
    showMessage(el.predictionMessage, "Vul een naam in.", "error");
    return;
  }

  try {
    const wasEditing = Boolean(editingId);
    const savedName = next.name;
    await persistLocalOrRefresh(async () => {
      if (API_MODE) {
        await api("/api/predictions/phase", { method: "POST", body: JSON.stringify(next) });
        return;
      }
      mergeLocalPhaseVote(next);
    });
    if (wasEditing) {
      showMessage(el.predictionMessage, "Voorspelling bijgewerkt.");
    } else {
      showVoteThanks(savedName, phase);
    }
    flashButton(event.submitter, "is-saved", 900);
  } catch (error) {
    showMessage(el.predictionMessage, error.message, "error");
  }
});

el.cancelEditBtn.addEventListener("click", resetPredictionForm);

el.participantList.addEventListener("click", async (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const player = state.participants.find((item) => item.id === editId);
    if (!player) return;
    editingId = editId;
    el.playerName.value = player.name;
    el.predictionFormTitle.textContent = "Voorspelling bewerken";
    el.cancelEditBtn.classList.remove("hidden");
    renderPredictionSelects({
      top1: player.prediction.top5[0],
      top2: player.prediction.top5[1],
      top3: player.prediction.top5[2],
      top4: player.prediction.top5[3],
      top5: player.prediction.top5[4],
      last: player.prediction.last
    });
    renderSemiPredictions({
      semi1: player.prediction.semi1,
      semi2: player.prediction.semi2
    });
    el.playerName.focus();
  }

  if (deleteId && confirm("Deze voorspelling verwijderen?")) {
    try {
      await persistLocalOrRefresh(async () => {
        if (API_MODE) {
          await api(`/api/predictions/${deleteId}`, { method: "DELETE" });
        } else {
          state.participants = state.participants.filter((player) => player.id !== deleteId);
        }
      });
    } catch (error) {
      alert(error.message);
    }
  }
});

el.resultForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  flashButton(event.submitter, "is-tapped", 420);
  const phase = event.submitter?.dataset.resultSavePhase || activeResultPhase;
  if (phase === "final" && !hasCompleteFinalistList()) {
    showMessage(el.resultMessage, "De finalelijst is nog niet compleet. Vul eerst de doorgangers van beide halve finales in.", "error");
    return;
  }
  if (phase === "final" && !validateResultSelects()) {
    showMessage(el.resultMessage, "Een land mag maar een keer in de einduitslag staan.", "error");
    return;
  }
  if ((phase === "semi1" || phase === "semi2") && !validateSemiGroup(phase === "semi1" ? el.semi1ResultRows.querySelector('[data-semi-result="semi1"]') : el.semi2ResultRows.querySelector('[data-semi-result="semi2"]'), document.querySelector(`#${phase}ResultCount`))) {
    showMessage(el.resultMessage, "Kies precies 10 doorgangers.", "error");
    return;
  }

  const actualResult = phase === "final"
    ? [...el.resultRows.querySelectorAll("select")].map((select) => select.value)
    : state.actualResult;
  const semiQualifiers = {
    semi1: phase === "semi1" ? checkedValues(el.semi1ResultRows.querySelector('[data-semi-result="semi1"]')) : state.semiQualifiers.semi1,
    semi2: phase === "semi2" ? checkedValues(el.semi2ResultRows.querySelector('[data-semi-result="semi2"]')) : state.semiQualifiers.semi2
  };
  try {
    await persistLocalOrRefresh(async () => {
      if (API_MODE) {
        await api("/api/results", { method: "PUT", body: JSON.stringify({ actualResult, semiQualifiers }) });
      } else {
        state.actualResult = actualResult;
        state.semiQualifiers = semiQualifiers;
      }
    });
    showMessage(el.resultMessage, `${phaseLabel(phase)} opgeslagen.`);
    flashButton(event.submitter, "is-saved", 900);
  } catch (error) {
    showMessage(el.resultMessage, error.message, "error");
  }
});

el.clearResultsBtn.addEventListener("click", async () => {
  if (!confirm("Einduitslag en halve-finale qualifiers wissen?")) return;
  try {
    await persistLocalOrRefresh(async () => {
      if (API_MODE) {
        await api("/api/results", { method: "PUT", body: JSON.stringify({ actualResult: Array(state.countries.length).fill(""), semiQualifiers: { semi1: [], semi2: [] } }) });
      } else {
        state.actualResult = Array(state.countries.length).fill("");
        state.semiQualifiers = { semi1: [], semi2: [] };
      }
    });
  } catch (error) {
    alert(error.message);
  }
});

el.countryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = el.countryName.value.trim();
  const entry = el.countryEntry.value.trim();
  const videoUrl = el.countryVideoUrl.value.trim();
  if (!name) return;

  try {
    await persistLocalOrRefresh(async () => {
      if (API_MODE) {
        await api("/api/countries", { method: "POST", body: JSON.stringify({ name, entry, videoUrl }) });
      } else {
        if (state.countries.some((country) => country.name.toLowerCase() === name.toLowerCase())) throw new Error("Dit land bestaat al.");
        state.countries.push({ name, entry, videoUrl });
        state.actualResult = Array(state.countries.length).fill("");
        state.semiQualifiers = { semi1: [], semi2: [] };
      }
    });
    el.countryForm.reset();
  } catch (error) {
    el.countryName.classList.add("invalid");
    alert(error.message);
  }
});

el.countryName.addEventListener("input", () => el.countryName.classList.remove("invalid"));

el.countryList.addEventListener("click", async (event) => {
  const countryName = event.target.dataset.removeCountry;
  if (!countryName) return;
  if (!API_MODE && isCountryUsed(countryName)) {
    alert("Dit land wordt al gebruikt in een voorspelling of einduitslag.");
    return;
  }
  try {
    await persistLocalOrRefresh(async () => {
      if (API_MODE) {
        await api(`/api/countries/${encodeURIComponent(countryName)}`, { method: "DELETE" });
      } else {
        state.countries = state.countries.filter((country) => country.name !== countryName);
        state.actualResult = Array(state.countries.length).fill("");
        state.semiQualifiers = { semi1: [], semi2: [] };
      }
    });
  } catch (error) {
    alert(error.message);
  }
});

el.restoreCountriesBtn.addEventListener("click", async () => {
  if (!confirm("Standaardlanden terugzetten? Voorspellingen blijven staan, maar de einduitslag wordt leeggemaakt.")) return;
  try {
    await persistLocalOrRefresh(async () => {
      if (API_MODE) {
        await api("/api/countries/restore", { method: "POST", body: "{}" });
      } else {
        state.countries = defaultCountries;
        state.actualResult = Array(defaultCountries.length).fill("");
        state.semiQualifiers = { semi1: [], semi2: [] };
      }
    });
  } catch (error) {
    alert(error.message);
  }
});

el.resetBtn.addEventListener("click", async () => {
  if (!confirm("Alles wissen en opnieuw beginnen?")) return;
  try {
    await persistLocalOrRefresh(async () => {
      if (API_MODE) {
        await api("/api/state", { method: "DELETE" });
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(MY_CHOICE_KEY);
        state = loadLocalState();
      }
    });
  } catch (error) {
    alert(error.message);
  }
});

el.printBtn.addEventListener("click", () => window.print());

refreshState();
