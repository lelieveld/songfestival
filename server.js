const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const ADMIN_PIN = String(process.env.ADMIN_PIN || "1234");
const DATA_FILE = path.join(__dirname, "data.json");
const PUBLIC_DIR = __dirname;
const DATABASE_URL = process.env.DATABASE_URL || "";
const USE_FIRESTORE = process.env.STORAGE_BACKEND === "firestore" || Boolean(process.env.K_SERVICE);
const USE_POSTGRES = Boolean(DATABASE_URL) && !USE_FIRESTORE;
const FIRESTORE_COLLECTION = process.env.FIRESTORE_COLLECTION || "songfestival";
const FIRESTORE_DOCUMENT = process.env.FIRESTORE_DOCUMENT || "speelkopie";
const POSTGRES_KEY = process.env.POSTGRES_STATE_KEY || "speelkopie";

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
  semi1: ["Moldavie", "Zweden", "Kroatie", "Griekenland", "Portugal", "Georgie", "Finland", "Montenegro", "Estland", "Israel", "Belgie", "Litouwen", "San Marino", "Polen", "Servie"],
  semi2: ["Bulgarije", "Azerbeidzjan", "Roemenie", "Luxemburg", "Tsjechie", "Armenie", "Zwitserland", "Cyprus", "Letland", "Denemarken", "Australie", "Oekraine", "Albanie", "Malta", "Noorwegen"]
};

const automaticFinalists = ["Oostenrijk", "Frankrijk", "Duitsland", "Italie", "Verenigd Koninkrijk"];

function emptyState() {
  return {
    countries: defaultCountries,
    participants: [],
    actualResult: Array(defaultCountries.length).fill(""),
    semiQualifiers: { semi1: [], semi2: [] },
    finalRunningOrder: [],
    votingClosed: { semi1: false, semi2: false, final: false }
  };
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

function normalizeCountry(country) {
  return {
    name: String(country.name || "").trim(),
    entry: String(country.entry || "").trim(),
    videoUrl: String(country.videoUrl || "").trim()
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

function normalizeState(state) {
  if (state && Array.isArray(state.countries) && Array.isArray(state.participants)) {
    return {
      countries: state.countries.map(normalizeCountry),
      participants: state.participants.map(normalizePlayer),
      actualResult: Array.isArray(state.actualResult) ? state.actualResult : Array(state.countries.length).fill(""),
      semiQualifiers: normalizeSemiQualifiers(state.semiQualifiers),
      finalRunningOrder: Array.isArray(state.finalRunningOrder) ? state.finalRunningOrder : [],
      votingClosed: normalizeVotingClosed(state.votingClosed)
    };
  }
  return emptyState();
}

function getFirestore() {
  const { Firestore } = require("@google-cloud/firestore");
  return new Firestore();
}

function getFirestoreRef(db) {
  return db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOCUMENT);
}

let pgPool;

function getPostgresSsl() {
  const sslMode = String(process.env.PGSSLMODE || "").toLowerCase();
  const explicitSsl = String(process.env.POSTGRES_SSL || "").toLowerCase();
  if (["disable", "false", "0"].includes(sslMode) || ["false", "0"].includes(explicitSsl)) return false;
  if (["require", "no-verify", "true", "1"].includes(sslMode) || ["true", "1"].includes(explicitSsl)) return { rejectUnauthorized: false };

  try {
    const host = new URL(DATABASE_URL).hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".railway.internal")) return false;
    if (host.includes("render.com") || host.includes("oregon-postgres.render.com")) return { rejectUnauthorized: false };
  } catch {
    return false;
  }

  return false;
}

function getPostgresPool() {
  if (!pgPool) {
    const { Pool } = require("pg");
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: getPostgresSsl()
    });
  }
  return pgPool;
}

async function ensurePostgresSchema(client) {
  await client.query(`
    create table if not exists app_state (
      key text primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
}

async function readState() {
  if (USE_FIRESTORE) {
    const db = getFirestore();
    const ref = getFirestoreRef(db);
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      const next = emptyState();
      await ref.set(next);
      return next;
    }
    return normalizeState(snapshot.data());
  }

  if (USE_POSTGRES) {
    const pool = getPostgresPool();
    const client = await pool.connect();
    try {
      await ensurePostgresSchema(client);
      const result = await client.query("select data from app_state where key = $1", [POSTGRES_KEY]);
      if (!result.rowCount) {
        const next = emptyState();
        await client.query(
          "insert into app_state (key, data) values ($1, $2::jsonb)",
          [POSTGRES_KEY, JSON.stringify(next)]
        );
        return next;
      }
      return normalizeState(result.rows[0].data);
    } finally {
      client.release();
    }
  }

  try {
    const state = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return normalizeState(state);
  } catch {
    return emptyState();
  }
}

async function writeState(state) {
  if (USE_FIRESTORE) {
    const db = getFirestore();
    await getFirestoreRef(db).set(normalizeState(state));
    return;
  }

  if (USE_POSTGRES) {
    const pool = getPostgresPool();
    const client = await pool.connect();
    try {
      await ensurePostgresSchema(client);
      await client.query(
        `insert into app_state (key, data, updated_at)
         values ($1, $2::jsonb, now())
         on conflict (key) do update set data = excluded.data, updated_at = now()`,
        [POSTGRES_KEY, JSON.stringify(normalizeState(state))]
      );
    } finally {
      client.release();
    }
    return;
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

async function updateState(mutator) {
  if (USE_FIRESTORE) {
    const db = getFirestore();
    const ref = getFirestoreRef(db);
    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const state = snapshot.exists ? normalizeState(snapshot.data()) : emptyState();
      const result = await mutator(state);
      transaction.set(ref, normalizeState(state));
      return result || state;
    });
  }

  if (USE_POSTGRES) {
    const pool = getPostgresPool();
    const client = await pool.connect();
    try {
      await client.query("begin");
      await ensurePostgresSchema(client);
      const existing = await client.query("select data from app_state where key = $1 for update", [POSTGRES_KEY]);
      const state = existing.rowCount ? normalizeState(existing.rows[0].data) : emptyState();
      const result = await mutator(state);
      await client.query(
        `insert into app_state (key, data, updated_at)
         values ($1, $2::jsonb, now())
         on conflict (key) do update set data = excluded.data, updated_at = now()`,
        [POSTGRES_KEY, JSON.stringify(normalizeState(state))]
      );
      await client.query("commit");
      return result || state;
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  const state = await readState();
  const result = await mutator(state);
  await writeState(state);
  return result || state;
}

function sendJson(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(value));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Bestand is te groot"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Ongeldige JSON"));
      }
    });
  });
}

function requireAdmin(req) {
  if (req.headers["x-admin-pin"] !== ADMIN_PIN) {
    const error = new Error("Beheer-PIN klopt niet");
    error.status = 401;
    throw error;
  }
}

function getFinalCountryNames(state) {
  return [...new Set([
    ...automaticFinalists,
    ...(state.semiQualifiers?.semi1 || []),
    ...(state.semiQualifiers?.semi2 || [])
  ])];
}

function hasCompleteFinalistList(state) {
  return state.semiQualifiers?.semi1?.length === 10 && state.semiQualifiers?.semi2?.length === 10;
}

function validatePrediction(state, payload, existingId = "") {
  const name = String(payload.name || "").trim().slice(0, 60);
  const attendingParty = Boolean(payload.attendingParty);
  const top5 = payload.prediction?.top5 || [];
  const last = payload.prediction?.last || "";
  const semi1 = Array.isArray(payload.prediction?.semi1) ? payload.prediction.semi1 : [];
  const semi2 = Array.isArray(payload.prediction?.semi2) ? payload.prediction.semi2 : [];
  const picks = [...top5, last];
  const countryNames = getFinalCountryNames(state);

  if (!name) throw new Error("Vul een naam in.");
  if (!hasCompleteFinalistList(state)) throw new Error("De finalelijst is nog niet compleet.");
  if (top5.length !== 5 || picks.some((pick) => !countryNames.includes(pick))) throw new Error("Kies overal een geldig land.");
  if (new Set(picks).size !== picks.length) throw new Error("Een land mag maar een keer in dezelfde voorspelling staan.");
  if (semi1.length !== 10 || semi2.length !== 10) throw new Error("Kies precies 10 landen per halve finale.");
  if (new Set(semi1).size !== semi1.length || new Set(semi2).size !== semi2.length) throw new Error("Een land mag maar een keer per halve finale worden gekozen.");
  if (semi1.some((pick) => !semiFinals.semi1.includes(pick)) || semi2.some((pick) => !semiFinals.semi2.includes(pick))) throw new Error("Een halve-finale voorspelling bevat een ongeldig land.");
  if (state.participants.some((player) => player.id !== existingId && player.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("Deze naam staat al in de poule.");
  }
  return { name, attendingParty, prediction: { top5, last, semi1, semi2 } };
}

function validatePhasePrediction(state, body) {
  const phase = String(body.phase || "");
  const name = String(body.name || "").trim().slice(0, 60);
  const attendingParty = Boolean(body.attendingParty);
  const prediction = body.prediction || {};
  const countryNames = getFinalCountryNames(state);

  if (!["semi1", "semi2", "final"].includes(phase)) throw new Error("Onbekende stemronde.");
  if (state.votingClosed?.[phase]) throw new Error("Stemmen voor deze ronde is gesloten.");
  if (!name) throw new Error("Vul een naam in.");

  if (phase === "semi1" || phase === "semi2") {
    const picks = Array.isArray(prediction[phase]) ? prediction[phase] : [];
    if (picks.length !== 10) throw new Error("Kies precies 10 landen.");
    if (new Set(picks).size !== picks.length) throw new Error("Een land mag maar een keer worden gekozen.");
    if (picks.some((pick) => !semiFinals[phase].includes(pick))) throw new Error("Deze ronde bevat een ongeldig land.");
    return { phase, name, attendingParty, picks };
  }

  const top5 = Array.isArray(prediction.top5) ? prediction.top5 : [];
  const last = prediction.last || "";
  const picks = [...top5, last];
  if (!hasCompleteFinalistList(state)) throw new Error("De finalelijst is nog niet compleet.");
  if (top5.length !== 5 || picks.some((pick) => !countryNames.includes(pick))) throw new Error("Kies overal een geldig land.");
  if (new Set(picks).size !== picks.length) throw new Error("Een land mag maar een keer in dezelfde voorspelling staan.");
  return { phase, name, attendingParty, top5, last };
}

function mergePhasePrediction(player, payload) {
  const current = normalizePlayer(player);
  current.attendingParty = Boolean(payload.attendingParty);
  if (payload.phase === "semi1" || payload.phase === "semi2") {
    current.prediction[payload.phase] = payload.picks;
  } else {
    current.prediction.top5 = payload.top5;
    current.prediction.last = payload.last;
  }
  current.name = payload.name;
  return current;
}

function isCountryUsed(state, countryName) {
  if (state.actualResult.includes(countryName)) return true;
  if (state.semiQualifiers?.semi1?.includes(countryName) || state.semiQualifiers?.semi2?.includes(countryName)) return true;
  return state.participants.some((player) => player.prediction.top5.includes(countryName) || player.prediction.last === countryName || player.prediction.semi1.includes(countryName) || player.prediction.semi2.includes(countryName));
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, {
      ok: true,
      storage: USE_FIRESTORE ? "firestore" : USE_POSTGRES ? "postgres" : "file",
      postgresSsl: USE_POSTGRES ? Boolean(getPostgresSsl()) : false,
      hasDatabaseUrl: Boolean(DATABASE_URL)
    });
  }
  if (req.method === "GET" && url.pathname === "/api/state") return sendJson(res, 200, await readState());
  if (req.method === "POST" && url.pathname === "/api/admin/check") {
    requireAdmin(req);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/predictions") {
    const body = await parseBody(req);
    const next = await updateState((state) => {
      const payload = validatePrediction(state, body);
      state.participants.push({ id: crypto.randomUUID(), ...payload, createdAt: new Date().toISOString() });
      return state;
    });
    return sendJson(res, 201, next);
  }

  if (req.method === "POST" && url.pathname === "/api/predictions/phase") {
    const body = await parseBody(req);
    const next = await updateState((state) => {
      const payload = validatePhasePrediction(state, body);
      const index = state.participants.findIndex((player) => player.name.toLowerCase() === payload.name.toLowerCase());
      if (index === -1) {
        state.participants.push(mergePhasePrediction({
          id: crypto.randomUUID(),
          name: payload.name,
          attendingParty: payload.attendingParty,
          prediction: { top5: [], last: "", semi1: [], semi2: [] },
          createdAt: new Date().toISOString()
        }, payload));
      } else {
        state.participants[index] = mergePhasePrediction(state.participants[index], payload);
      }
      return state;
    });
    return sendJson(res, 200, next);
  }

  const predictionMatch = url.pathname.match(/^\/api\/predictions\/([^/]+)$/);
  if (predictionMatch && req.method === "PUT") {
    requireAdmin(req);
    const id = decodeURIComponent(predictionMatch[1]);
    const body = await parseBody(req);
    const next = await updateState((state) => {
      const payload = validatePrediction(state, body, id);
      const index = state.participants.findIndex((player) => player.id === id);
      if (index === -1) throw new Error("Deelnemer niet gevonden.");
      state.participants[index] = { ...state.participants[index], ...payload };
      return state;
    });
    return sendJson(res, 200, next);
  }

  if (predictionMatch && req.method === "DELETE") {
    requireAdmin(req);
    const id = decodeURIComponent(predictionMatch[1]);
    const next = await updateState((state) => {
      state.participants = state.participants.filter((player) => player.id !== id);
      return state;
    });
    return sendJson(res, 200, next);
  }

  if (req.method === "PUT" && url.pathname === "/api/results") {
    requireAdmin(req);
    const body = await parseBody(req);
    const next = await updateState((state) => {
      const actualResult = Array.isArray(body.actualResult) ? body.actualResult : [];
      const semiQualifiers = normalizeSemiQualifiers(body.semiQualifiers);
      const finalRunningOrder = Array.isArray(body.finalRunningOrder) ? body.finalRunningOrder : state.finalRunningOrder || [];
      const filled = actualResult.filter(Boolean);
      const runningFilled = finalRunningOrder.filter(Boolean);
      const countryNames = getFinalCountryNames(state);
      if (filled.some((name) => !countryNames.includes(name))) throw new Error("De uitslag bevat een onbekend land.");
      if (filled.length && !hasCompleteFinalistList(state)) throw new Error("De finalelijst is nog niet compleet.");
      if (new Set(filled).size !== filled.length) throw new Error("Een land mag maar een keer in de einduitslag staan.");
      if (runningFilled.some((name) => !countryNames.includes(name))) throw new Error("De volgorde van optreden bevat een onbekend land.");
      if (new Set(runningFilled).size !== runningFilled.length) throw new Error("Een land mag maar een keer in de volgorde van optreden staan.");
      if (![0, 10].includes(semiQualifiers.semi1.length) || ![0, 10].includes(semiQualifiers.semi2.length)) throw new Error("Kies precies 10 doorgangers per halve finale.");
      if (new Set(semiQualifiers.semi1).size !== semiQualifiers.semi1.length || new Set(semiQualifiers.semi2).size !== semiQualifiers.semi2.length) throw new Error("Een land mag maar een keer per halve finale worden gekozen.");
      if (semiQualifiers.semi1.some((pick) => !semiFinals.semi1.includes(pick)) || semiQualifiers.semi2.some((pick) => !semiFinals.semi2.includes(pick))) throw new Error("Een halve-finale uitslag bevat een ongeldig land.");
      state.actualResult = actualResult.slice(0, Math.max(state.countries.length, 6));
      state.semiQualifiers = semiQualifiers;
      state.finalRunningOrder = finalRunningOrder.slice(0, countryNames.length);
      return state;
    });
    return sendJson(res, 200, next);
  }

  if (req.method === "PUT" && url.pathname === "/api/voting") {
    requireAdmin(req);
    const body = await parseBody(req);
    const next = await updateState((state) => {
      state.votingClosed = normalizeVotingClosed(body.votingClosed);
      return state;
    });
    return sendJson(res, 200, next);
  }

  if (req.method === "POST" && url.pathname === "/api/countries") {
    requireAdmin(req);
    const body = await parseBody(req);
    const next = await updateState((state) => {
      const name = String(body.name || "").trim().slice(0, 80);
      const entry = String(body.entry || "").trim().slice(0, 120);
      const videoUrl = String(body.videoUrl || "").trim().slice(0, 300);
      if (!name) throw new Error("Vul een land in.");
      if (videoUrl && !/^https?:\/\//i.test(videoUrl)) throw new Error("Gebruik een geldige videolink.");
      if (state.countries.some((country) => country.name.toLowerCase() === name.toLowerCase())) throw new Error("Dit land bestaat al.");
      state.countries.push({ name, entry, videoUrl });
      state.actualResult = Array(state.countries.length).fill("");
      state.semiQualifiers = { semi1: [], semi2: [] };
      state.finalRunningOrder = [];
      state.votingClosed = normalizeVotingClosed(state.votingClosed);
      return state;
    });
    return sendJson(res, 201, next);
  }

  const countryMatch = url.pathname.match(/^\/api\/countries\/([^/]+)$/);
  if (countryMatch && req.method === "DELETE") {
    requireAdmin(req);
    const countryName = decodeURIComponent(countryMatch[1]);
    const next = await updateState((state) => {
      if (isCountryUsed(state, countryName)) throw new Error("Dit land wordt al gebruikt in een voorspelling of einduitslag.");
      state.countries = state.countries.filter((country) => country.name !== countryName);
      state.actualResult = Array(state.countries.length).fill("");
      state.semiQualifiers = { semi1: [], semi2: [] };
      state.finalRunningOrder = [];
      state.votingClosed = normalizeVotingClosed(state.votingClosed);
      return state;
    });
    return sendJson(res, 200, next);
  }

  if (req.method === "POST" && url.pathname === "/api/countries/restore") {
    requireAdmin(req);
    const next = await updateState((state) => {
      state.countries = defaultCountries;
      state.actualResult = Array(defaultCountries.length).fill("");
      state.semiQualifiers = { semi1: [], semi2: [] };
      state.finalRunningOrder = [];
      state.votingClosed = normalizeVotingClosed(state.votingClosed);
      return state;
    });
    return sendJson(res, 200, next);
  }

  if (req.method === "POST" && url.pathname === "/api/import") {
    requireAdmin(req);
    const imported = await parseBody(req);
    if (!Array.isArray(imported.countries) || !Array.isArray(imported.participants)) throw new Error("Ongeldig importbestand.");
    const next = {
      countries: imported.countries,
      participants: imported.participants.map(normalizePlayer),
      actualResult: Array.isArray(imported.actualResult) ? imported.actualResult : Array(imported.countries.length).fill(""),
      semiQualifiers: normalizeSemiQualifiers(imported.semiQualifiers),
      finalRunningOrder: Array.isArray(imported.finalRunningOrder) ? imported.finalRunningOrder : [],
      votingClosed: normalizeVotingClosed(imported.votingClosed)
    };
    await writeState(next);
    return sendJson(res, 200, next);
  }

  if (req.method === "DELETE" && url.pathname === "/api/state") {
    requireAdmin(req);
    const next = emptyState();
    await writeState(next);
    return sendJson(res, 200, next);
  }

  sendJson(res, 404, { error: "Niet gevonden" });
}

function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(PUBLIC_DIR, requested));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  if (filePath === DATA_FILE || path.basename(filePath).startsWith(".")) {
    res.writeHead(404);
    return res.end("Not found");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".png": "image/png",
      ".json": "application/json; charset=utf-8"
    };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, error.status || 400, { error: error.message || "Actie mislukt" });
  }
});

function getLanUrls() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((net) => net && net.family === "IPv4" && !net.internal)
    .map((net) => `http://${net.address}:${PORT}`);
}

server.listen(PORT, HOST, () => {
  console.log(`Songfestival Poule draait op http://localhost:${PORT}`);
  getLanUrls().forEach((url) => console.log(`Wifi-link: ${url}`));
});
