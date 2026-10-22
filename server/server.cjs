/**
 * Saviynt AI Onboarder — Local Windows Server
 * Development mode: ROOT_DIR = project root, dist at src/frontend/dist/
 * Deployed zip mode: ROOT_DIR = folder containing server/, dist at dist/
 */
"use strict";

const http  = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");

let express, multer, archiver, bcrypt;
try { express = require("express"); } catch { console.error("Missing express. Run: npm install --prefix server"); process.exit(1); }
try { multer = require("multer"); } catch { console.error("Missing multer. Run: npm install --prefix server"); process.exit(1); }
try { archiver = require("archiver"); } catch (e) {
  console.warn("[warn] archiver module not found — package download will be unavailable.", e.message);
  archiver = null;
}
try { bcrypt = require("bcryptjs"); } catch {
  console.warn("[warn] bcryptjs not found — passwords will not be hashed. Run: npm install --prefix server");
  bcrypt = null;
}

const app = express();

// ─── Paths ────────────────────────────────────────────────────────────────────
// __dirname is the server/ folder.
// ROOT_DIR is one level up (project root or zip root).
const SERVER_DIR = __dirname;
const ROOT_DIR   = path.resolve(SERVER_DIR, "..");

// dist/ lives at ROOT_DIR/src/frontend/dist in dev,
// or ROOT_DIR/dist in the deployed zip.
function resolveDist() {
  const zipDist = path.join(ROOT_DIR, "dist");
  const devDist = path.join(ROOT_DIR, "src", "frontend", "dist");
  if (fs.existsSync(zipDist) && fs.existsSync(path.join(zipDist, "index.html"))) return zipDist;
  if (fs.existsSync(devDist) && fs.existsSync(path.join(devDist, "index.html"))) return devDist;
  return zipDist; // fallback — show "not built" message
}

const DIST_DIR = resolveDist();
const DATA_DIR = path.join(ROOT_DIR, "data");
const DOCS_DIR = path.join(ROOT_DIR, "documents");
const LOGS_DIR = path.join(ROOT_DIR, "logs");

console.log(`[server] ROOT : ${ROOT_DIR}`);
console.log(`[server] DIST : ${DIST_DIR}`);
console.log(`[server] DATA : ${DATA_DIR}`);
console.log(`[server] LOGS : ${LOGS_DIR}`);

// ─── Default data ─────────────────────────────────────────────────────────────
// users.json ships with passwordHash = "admin123" (plain text).
// The migration block below converts it to a proper hash on first boot.
function makeDefaultUsers() {
  return [
    {
      id:            "admin-001",
      username:      "admin",
      passwordHash:  "admin123",   // migrated to pbkdf2/bcrypt on first boot
      role:          "admin",
      name:          "Administrator",
      email:         "admin@company.com",
      assignedApps:  [],
      assignedAppIds: [],
      useIDP:        false,
      idpEnabled:    false,
      createdAt:     "2024-01-01T00:00:00.000Z"
    }
  ];
}

const DEFAULT_SETTINGS = {
  nonProd: { url: "", username: "", password: "", verified: false },
  prod:    { url: "", username: "", password: "", verified: false },
  idp:     { enabled: false, issuerUrl: "", clientId: "", metadataUrl: "" }
};

// ─── JSON CRUD helpers (defined early — used by bootstrap + migration) ─────────
function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return null; }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// ─── Bootstrap data directory ─────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ensureFile(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf8");
    console.log("Created:", path.relative(ROOT_DIR, filePath));
  }
}

ensureDir(DATA_DIR);
ensureDir(DOCS_DIR);
ensureDir(LOGS_DIR);
ensureFile(path.join(DATA_DIR, "users.json"),    makeDefaultUsers());
ensureFile(path.join(DATA_DIR, "settings.json"), DEFAULT_SETTINGS);
ensureFile(path.join(DATA_DIR, "approvals.json"), []);
ensureFile(path.join(DATA_DIR, "emails.json"),   []);
ensureFile(path.join(DATA_DIR, "apps.json"),     []);

// ─── One-time password migration: hash any plain-text passwords in users.json ─
// Runs on every boot but only writes when a change is detected.
// Uses the same hashPassword() helper as the auth routes so it always works,
// even before npm install has run (no bcryptjs dependency).
{
  // hashPassword is defined later in the file but JS hoists function declarations.
  // However hashPassword is a const arrow fn — define a local inline version here
  // that mirrors it exactly, since we're before the auth section.
  const _cryptoMod = require("crypto");
  const _localHash = (plain) => {
    if (bcrypt) return bcrypt.hashSync(plain, 10);
    const salt = _cryptoMod.randomBytes(16).toString("hex");
    const h    = _cryptoMod.pbkdf2Sync(plain, salt, 100000, 32, "sha256").toString("hex");
    return `pbkdf2:${salt}:${h}`;
  };

  const usersFile = path.join(DATA_DIR, "users.json");
  const existingUsers = readJSON(usersFile);
  if (Array.isArray(existingUsers)) {
    let migrated = false;
    const updatedUsers = existingUsers.map((u) => {
      const { password: _legacyPw, ...cleanUser } = u;
      if (u.password !== undefined) migrated = true;

      // Normalise role to lowercase
      if (cleanUser.role && cleanUser.role !== cleanUser.role.toLowerCase()) {
        cleanUser.role = cleanUser.role.toLowerCase();
        migrated = true;
      }

      const rawHash = cleanUser.passwordHash || "";
      // Plain text or missing hash — hash it now using _localHash (works without npm)
      if (!rawHash || (!rawHash.startsWith("$2") && !rawHash.startsWith("pbkdf2:"))) {
        const plain = rawHash || "admin123"; // use existing plain value or default
        console.log(`[bootstrap] Hashing plain-text password for user: ${u.username || "?"}`);
        migrated = true;
        return { ...cleanUser, passwordHash: _localHash(plain) };
      }
      return cleanUser;
    });
    if (migrated) {
      writeJSON(usersFile, updatedUsers);
      console.log("[bootstrap] User migration complete.");
    }
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Username, X-User-Role");
  if (req.method === "OPTIONS") { res.sendStatus(200); return; }
  next();
});
app.use(express.json({ limit: "50mb" }));

// ─── Multer for file uploads ──────────────────────────────────────────────────
const upload = multer({
  storage: multer.diskStorage({
    destination: DOCS_DIR,
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      const ts = Date.now();
      cb(null, `${ts}_${safe}`);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ─── API Routes ───────────────────────────────────────────────────────────────

const DATA_FILES = {
  apps:      "apps.json",
  users:     "users.json",
  approvals: "approvals.json",
  settings:  "settings.json",
  emails:    "emails.json"
};

for (const [key, filename] of Object.entries(DATA_FILES)) {
  const filePath = path.join(DATA_DIR, filename);

  app.get(`/api/${key}`, (req, res) => {
    const data = readJSON(filePath);
    if (data === null) return res.status(500).json({ error: `Cannot read ${filename}` });
    // Never expose passwordHash in bulk user reads
    if (key === "users" && Array.isArray(data)) {
      return res.json(data.map((u) => { const { passwordHash, password, ...safe } = u; return safe; }));
    }
    res.json(data);
  });

  app.post(`/api/${key}`, (req, res) => {
    if (!req.body) return res.status(400).json({ error: "No body" });
    try {
      let body = req.body;
      // When the frontend saves the users array, preserve existing password hashes.
      // GET /api/users intentionally strips passwordHash before sending to the browser,
      // so when the frontend POSTs users back (e.g. after updating lastLogin), the
      // incoming records have no passwordHash. Without this guard, the server would
      // re-hash an empty string as "changeme" — destroying the real password every login.
      if (key === "users" && Array.isArray(body)) {
        // Load the current on-disk users so we can restore their hashes
        const diskUsers = readJSON(filePath) || [];
        const diskMap = Object.fromEntries(diskUsers.map((u) => [u.id, u]));

        const _c = require("crypto");
        const _hp = (plain) => {
          if (bcrypt) return bcrypt.hashSync(plain, 10);
          const s = _c.randomBytes(16).toString("hex");
          const h = _c.pbkdf2Sync(plain, s, 100000, 32, "sha256").toString("hex");
          return `pbkdf2:${s}:${h}`;
        };

        body = body.map((u) => {
          const { password: _legacyPw, ...cleanU } = u;
          if (cleanU.role) cleanU.role = cleanU.role.toLowerCase();

          const incomingHash = cleanU.passwordHash || "";
          const isRealHash = incomingHash.startsWith("$2") || incomingHash.startsWith("pbkdf2:");

          if (isRealHash) {
            // Frontend sent a proper hash (e.g. admin set a new password) — keep it
            return cleanU;
          }

          // No hash in incoming data — restore from disk if this user exists
          const diskUser = diskMap[cleanU.id];
          if (diskUser && diskUser.passwordHash) {
            const diskHash = diskUser.passwordHash;
            const isDiskReal = diskHash.startsWith("$2") || diskHash.startsWith("pbkdf2:");
            if (isDiskReal) {
              // Restore the existing hash — DO NOT re-hash
              return { ...cleanU, passwordHash: diskHash };
            }
            // Disk also has a plain-text hash — hash it now (migration)
            return { ...cleanU, passwordHash: _hp(diskHash || "admin123") };
          }

          // New user with no hash — hash the provided plain-text value or use default
          const plain = incomingHash || _legacyPw || "changeme";
          return { ...cleanU, passwordHash: _hp(plain) };
        });
      }
      writeJSON(filePath, body);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });
}

// ─── Auth Routes ─────────────────────────────────────────────────────────────

/**
 * Password hashing uses bcryptjs when available (installed by npm in start.bat).
 * When bcryptjs is NOT yet installed (first boot before npm install runs),
 * we fall back to Node's built-in crypto: PBKDF2-SHA256 with a random salt,
 * stored as "pbkdf2:<salt>:<hash>".
 *
 * This guarantees login ALWAYS works — no dependency on npm install timing.
 */
const crypto = require("crypto");

function hashPassword(plain) {
  if (bcrypt) return bcrypt.hashSync(plain, 10);
  // Built-in fallback: PBKDF2
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(plain, salt, 100000, 32, "sha256").toString("hex");
  return `pbkdf2:${salt}:${hash}`;
}

function checkPassword(plainText, storedHash) {
  if (!storedHash || !plainText) return false;

  // bcrypt hash
  if (storedHash.startsWith("$2")) {
    if (bcrypt) {
      try { return bcrypt.compareSync(plainText, storedHash); } catch { return false; }
    }
    // bcrypt not loaded — can't verify a bcrypt hash, fall through to false
    return false;
  }

  // PBKDF2 hash (our built-in fallback)
  if (storedHash.startsWith("pbkdf2:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const [, salt, expectedHash] = parts;
    try {
      const actual = crypto.pbkdf2Sync(plainText, salt, 100000, 32, "sha256").toString("hex");
      return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expectedHash, "hex"));
    } catch { return false; }
  }

  // Plain-text legacy (strip and compare — handles migration edge cases)
  return plainText === storedHash;
}

// POST /api/login — verify username + password, return user object (no hash)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "username and password are required" });
  }
  const users = readJSON(path.join(DATA_DIR, "users.json")) || [];
  const user = users.find((u) => (u.username || "").toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }
  const valid = checkPassword(password, user.passwordHash || user.password || "");
  if (!valid) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }
  const { passwordHash, password: _pw, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// POST /api/change-password — any authenticated user changes their own password
app.post("/api/change-password", (req, res) => {
  const { username, currentPassword, newPassword } = req.body || {};
  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "username, currentPassword and newPassword are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
  }
  const usersFile = path.join(DATA_DIR, "users.json");
  const users = readJSON(usersFile) || [];
  const idx = users.findIndex((u) => (u.username || "").toLowerCase() === username.toLowerCase());
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const user = users[idx];
  const valid = checkPassword(currentPassword, user.passwordHash || user.password || "");
  if (!valid) {
    return res.status(401).json({ success: false, message: "Current password is incorrect" });
  }
  const newHash = hashPassword(newPassword);
  const { password: _pw, ...cleanUser } = user;
  users[idx] = { ...cleanUser, passwordHash: newHash };
  try {
    writeJSON(usersFile, users);
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to save: " + String(e) });
  }
});

// POST /api/admin-reset-password — admin resets any user's password (no current password needed)
app.post("/api/admin-reset-password", (req, res) => {
  const { targetUsername, newPassword } = req.body || {};
  if (!targetUsername || !newPassword) {
    return res.status(400).json({ success: false, message: "targetUsername and newPassword are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
  }
  const usersFile = path.join(DATA_DIR, "users.json");
  const users = readJSON(usersFile) || [];
  const idx = users.findIndex((u) => (u.username || "").toLowerCase() === targetUsername.toLowerCase());
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const newHash = hashPassword(newPassword);
  const { password: _pw, ...cleanUser } = users[idx];
  users[idx] = { ...cleanUser, passwordHash: newHash };
  try {
    writeJSON(usersFile, users);
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to save: " + String(e) });
  }
});

// Document upload
app.post("/api/documents/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file received" });
  res.json({
    ok: true,
    fileName:    req.file.originalname,
    storedName:  req.file.filename,
    path:        `/api/documents/${req.file.filename}`,
    size:        req.file.size
  });
});

// Serve document files
app.get("/api/documents/:filename", (req, res) => {
  const filePath = path.join(DOCS_DIR, path.basename(req.params.filename));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
  res.sendFile(filePath);
});

// ─── Download full package as zip ─────────────────────────────────────────────
//
// Strategy: buffer the entire zip in memory before sending.  This lets us
// catch any archiver error before a single byte is written to the HTTP
// response — the client either gets a valid 200 + complete zip, or a clean
// 500 JSON error.  No truncated / corrupt downloads.
//
// GENERATED start.bat content (used if file is not found on disk)
const GENERATED_START_BAT = `@echo off
echo Starting Saviynt AI Onboarder...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please download and install Node.js from https://nodejs.org/
    echo Then run this file again.
    pause
    exit /b 1
)
cd /d "%~dp0"
echo Installing / updating server dependencies (including bcryptjs)...
cd server
npm install
cd ..
echo Starting server...
start "" http://localhost:3000
node server\\server.cjs
pause
`;

// GENERATED README content (used if file is not found on disk)
const GENERATED_README = `# Saviynt AI Onboarder - Windows Setup

1. Install Node.js from https://nodejs.org/ (LTS version)
2. Extract this zip to a folder (e.g. C:\\SaviyntOnboarder\\)
3. Double-click start.bat to launch the app
   (start.bat runs "npm install" automatically, which installs bcryptjs and all dependencies)
4. Open http://localhost:3000 in your browser
   Default login: admin / admin123

Passwords are stored as bcrypt hashes — plain-text passwords are automatically migrated
on first run. Use the Change Password feature in the app to update passwords.

Your data is stored in the data/ folder alongside the app.
`;

// ─── /api/download-package — REMOVED ─────────────────────────────────────────
// Download package feature has been removed. Route returns 410 Gone.
app.get("/api/download-package", (req, res) => {
  res.status(410).json({ error: "Download package feature has been removed." });
});

// Route: GET /api/saviynt/primary-instance
// Returns the single active Saviynt instance configuration (URL and username only — no password).
// Used by the frontend to show the active instance at the top of every page.
app.get("/api/saviynt/primary-instance", (req, res) => {
  const cfg = getPrimaryInstance();
  if (!cfg || !cfg.url) {
    return res.json({ configured: false, url: null, username: null });
  }
  return res.json({
    configured: true,
    url:        cfg.url,
    username:   cfg.username || "",
    verified:   cfg.verified || false
  });
});


// ─── Saviynt EIC Proxy Routes ────────────────────────────────────────────────
//
// All outbound calls to Saviynt go through these routes so CORS never applies.
// The browser calls /api/saviynt/* on localhost; the server makes the
// server-to-server request (no browser CORS restrictions) and relays the result.
//

/**
 * Make an outbound HTTP/HTTPS request and return a Promise that resolves to
 * { statusCode, body } regardless of 2xx vs error status, so the frontend
 * always receives a meaningful response.
 *
 * bodyEncoding:
 *   "json"  (default) — serialises body as JSON, sets Content-Type: application/json
 *   "form"            — serialises body as URL-encoded key=value pairs,
 *                       sets Content-Type: application/x-www-form-urlencoded
 *                       (required by Saviynt /ECM/api/login)
 */
function saviyntRequest(method, urlStr, { headers = {}, body, bodyEncoding = "json", timeout = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(urlStr); } catch (e) { return reject(new Error(`Invalid URL: ${urlStr}`)); }

    const isHttps = parsed.protocol === "https:";
    const lib     = isHttps ? https : http;
    const port    = parsed.port || (isHttps ? 443 : 80);

    let bodyStr  = null;
    let contentType = "application/json";
    if (body != null) {
      if (bodyEncoding === "form") {
        bodyStr     = new URLSearchParams(body).toString();
        contentType = "application/x-www-form-urlencoded";
      } else {
        bodyStr     = JSON.stringify(body);
        contentType = "application/json";
      }
    }

    const reqHeaders = {
      "Content-Type": contentType,
      "Accept":       "application/json",
      ...headers,
      ...(bodyStr != null ? { "Content-Length": Buffer.byteLength(bodyStr) } : {})
    };

    const options = {
      hostname:           parsed.hostname,
      port,
      path:               parsed.pathname + (parsed.search || ""),
      method:             method.toUpperCase(),
      headers:            reqHeaders,
      rejectUnauthorized: false,  // accept self-signed certs on-prem
      timeout
    };

    const req = lib.request(options, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end",  () => resolve({ statusCode: res.statusCode, headers: res.headers, body: raw }));
    });

    req.on("timeout", () => { req.destroy(); reject(new Error("Request timed out after 30 s")); });
    req.on("error",   (e)  => reject(e));

    if (bodyStr != null) req.write(bodyStr);
    req.end();
  });
}

/**
 * Saviynt EIC v5 API endpoint catalogue.
 * Paths verified against Saviynt's official Go SDK (saviynt-api-go-client v1.0.0)
 * and the PowerShell community module.
 *
 * Key facts confirmed from official sources:
 *  - Login:           POST /ECM/api/login           (JSON body)
 *  - Create Endpoint: POST /ECM/api/v5/createEndpoint  (lowercase 'p' — NOT createEndPoint)
 *  - Update Endpoint: PUT  /ECM/api/v5/updateEndpoint
 *  - Get Endpoints:   POST /ECM/api/v5/getEndpoints
 *  - Get Sec Systems: GET  /ECM/api/v5/getSecuritySystems  (READ ONLY — no createSecuritySystem API)
 *
 * IMPORTANT: There is NO createSecuritySystem REST API in Saviynt EIC.
 * Security Systems are created automatically by Saviynt when createEndpoint
 * is called with a new securitysystem name, OR via Transport Package import.
 * The previous attempts to call createSecuritySystem caused the 404 errors.
 */
const SAVIYNT_ENDPOINTS = {
  login:                   (base) => `${base}/ECM/api/login`,
  createEndpoint:          (base) => `${base}/ECM/api/v5/createEndpoint`,
  updateEndpoint:          (base) => `${base}/ECM/api/v5/updateEndpoint`,
  getEndpoints:            (base) => `${base}/ECM/api/v5/getEndpoints`,
  getSecuritySystems:      (base) => `${base}/ECM/api/v5/getSecuritySystems`,
  createUser:              (base) => `${base}/ECM/api/v5/createUser`,
  updateUser:              (base) => `${base}/ECM/api/v5/updateUser`,
  removeUserAccess:        (base) => `${base}/ECM/api/v5/removeUserAccess`,
  onboardApplications:     (base) => `${base}/ECM/api/v5/onboardApplications`,
  getUser:                 (base) => `${base}/ECM/api/v5/getUser`,
  // Post-registration mandatory artifact APIs
  createEntitlementType:   (base) => `${base}/ECM/api/v5/createEntitlementType`,
  updateEntitlementType:   (base) => `${base}/ECM/api/v5/updateEntitlementType`,
  createEntitlementPolicy: (base) => `${base}/ECM/api/v5/createEntitlementPolicy`,
  createRole:              (base) => `${base}/ECM/api/v5/createRole`,
};

/**
 * Read Saviynt EIC config for a given environment from data/settings.json.
 * Single-instance mode: if only one instance is configured (nonProd OR prod),
 * that instance is used for ALL integration points regardless of the requested env.
 * This ensures the single configured instance is always used throughout the app.
 */
function getSaviyntConfig(env) {
  const settings = readJSON(path.join(DATA_DIR, "settings.json")) || {};
  const nonProd = settings.nonProd || null;
  const prod    = settings.prod    || null;

  const nonProdConfigured = nonProd && nonProd.url && nonProd.url.trim();
  const prodConfigured    = prod    && prod.url    && prod.url.trim();

  // Exact match first
  if (env === "prod" && prodConfigured) return prod;
  if (env !== "prod" && nonProdConfigured) return nonProd;

  // Single-instance fallback: return whichever is configured
  if (nonProdConfigured) return nonProd;
  if (prodConfigured)    return prod;
  return null;
}

/**
 * Return the single primary configured Saviynt instance (nonProd preferred).
 * Used by routes that should always use the one configured instance.
 */
function getPrimaryInstance() {
  return getSaviyntConfig("nonprod");
}

/**
 * Extract a bearer token from a Saviynt login response body.
 * Handles all known response shapes:
 *   { access_token }  { token }  { bearerToken }  { Authorization }  { data.access_token }
 *   { access_token, token_type: 'Bearer' }  { message, token }  { accessToken }
 * Also detects any string value that looks like a JWT (two dots, length > 20).
 */
function extractBearerToken(data) {
  if (!data || typeof data !== "object") return null;

  const candidates = [
    data.access_token,
    data.token,
    data.bearerToken,
    data.accessToken,
    data.Authorization,
    data.authorization,
    data.data && data.data.access_token,
    data.data && data.data.token,
  ];

  for (const c of candidates) {
    if (c && typeof c === "string" && c.trim().length > 0) {
      return c.replace(/^Bearer\s+/i, "").trim();
    }
  }

  // Fallback: scan all string values for anything that looks like a JWT
  for (const val of Object.values(data)) {
    if (typeof val === "string" && val.split(".").length === 3 && val.length > 20) {
      return val.trim();
    }
  }

  return null;
}

/**
 * In-memory token cache keyed by environment ("nonProd" | "prod").
 * Each entry: { token: string, expiresAt: number (ms epoch) }
 */
const tokenCache = { nonProd: null, prod: null };

/**
 * Return a valid bearer token for the given environment.
 * Re-uses a cached token if still valid; otherwise authenticates fresh.
 * Throws an Error with a descriptive message on failure.
 */
/**
 * Authenticate against Saviynt EIC and return a raw { statusCode, body } pair.
 *
 * Saviynt instances vary: some accept JSON bodies on /ECM/api/login, others
 * require application/x-www-form-urlencoded.  We try JSON first (the original
 * working behaviour) and automatically fall back to form-encoded if the JSON
 * attempt returns an HTML page or a 4xx status — which is the signal that the
 * instance rejected the content-type.
 */
async function saviyntLogin(loginUrl, username, password) {
  // Attempt 1 — JSON body (works on most modern EIC versions)
  const jsonAttempt = await saviyntRequest("POST", loginUrl, {
    body: { username, password },
    bodyEncoding: "json"
  });

  // If we got a real JSON response (not HTML) treat it as authoritative
  const trimmed = (jsonAttempt.body || "").trimStart();
  if (!trimmed.startsWith("<") && jsonAttempt.statusCode !== 415) {
    return jsonAttempt;
  }

  // Attempt 2 — form-encoded fallback (older / on-prem Tomcat configs)
  console.log("[saviyntLogin] JSON login returned HTML/415 — retrying with form-encoded body");
  return saviyntRequest("POST", loginUrl, {
    body: { username, password },
    bodyEncoding: "form"
  });
}

async function getOrRefreshToken(env) {
  const key = env === "prod" ? "prod" : "nonProd";
  const now = Date.now();

  // Return cached token if still valid (60s safety margin)
  if (tokenCache[key] && tokenCache[key].expiresAt > now + 60000) {
    return tokenCache[key].token;
  }

  const cfg = getSaviyntConfig(env);
  if (!cfg || !cfg.url) {
    throw new Error(`Saviynt EIC URL not configured for environment '${key}'. Go to Saviynt Settings to save the instance URL.`);
  }
  if (!cfg.username || !cfg.password) {
    throw new Error(`Saviynt EIC username/password not set for '${key}'. Go to Saviynt Settings to save your credentials.`);
  }

  const loginUrl = SAVIYNT_ENDPOINTS.login(cfg.url.replace(/\/$/, ""));
  const { statusCode, body } = await saviyntLogin(loginUrl, cfg.username, cfg.password);

  const parsed = parseBody(body, statusCode);

  if (parsed.error && parsed.detail !== undefined) {
    throw new Error(parsed.error);
  }

  const token = extractBearerToken(parsed);
  if (!token) {
    const detail = parsed.errorMessage || parsed.message || parsed.error || JSON.stringify(parsed).slice(0, 300);
    throw new Error(`Saviynt login succeeded (HTTP ${statusCode}) but no bearer token found in response. Detail: ${detail}`);
  }

  const expiresInSec = typeof parsed.expires_in === "number" ? parsed.expires_in : 3600;
  tokenCache[key] = { token, expiresAt: now + expiresInSec * 1000 };

  return token;
}

/**
 * Parse a raw response body as JSON.
 * If the body looks like HTML (starts with < after trimming), return a clear
 * structured error instead of passing raw HTML through. This prevents the
 * browser seeing "<!DOCTYPE ..." where it expects JSON.
 *
 * Note: "HTML error page" from Saviynt is NOT a CORS error — it is a server-side
 * rejection (usually 403 Forbidden from Tomcat when the path is wrong or the API
 * user lacks permission). The error message is worded accordingly.
 */
function parseBody(raw, statusCode) {
  const trimmed = (raw || "").trimStart();
  if (trimmed.startsWith("<")) {
    // Extract title from HTML for a more helpful message
    const titleMatch = trimmed.match(/<title[^>]*>([^<]+)<\/title>/i);
    const htmlTitle = titleMatch ? titleMatch[1].trim() : "";
    let hint = "";
    if (statusCode === 403 || trimmed.includes("403"))
      hint = " The API user may lack the required role (ROLE_ADMIN or API). Check user permissions in Saviynt.";
    else if (statusCode === 404 || trimmed.includes("404"))
      hint = " The API path was not found — check the instance URL does not have a trailing path segment.";
    else if (statusCode === 401 || trimmed.includes("401"))
      hint = " Authentication was rejected — check the username and password in Saviynt Settings.";
    return {
      error: `Saviynt returned an HTML page (${htmlTitle || `HTTP ${statusCode || "?"}`}) instead of JSON.${hint}`,
      detail: trimmed.slice(0, 300)
    };
  }
  try { return JSON.parse(raw); }
  catch { return { rawBody: raw }; }
}

// Route 1 — POST /api/saviynt/login
// Accepts { environment } OR { username, password, url } directly.
// Returns { success, token, expiresIn } on success; { success: false, error } on failure.
app.post("/api/saviynt/login", async (req, res) => {
  try {
    const { environment, username, password, url } = req.body || {};

    let token;
    if (username && password && url) {
      // Caller supplied credentials inline — authenticate without caching
      const loginUrl = SAVIYNT_ENDPOINTS.login(url.replace(/\/$/, ""));
      const { statusCode, body } = await saviyntLogin(loginUrl, username, password);
      const parsed = parseBody(body, statusCode);
      if (parsed.error && parsed.detail !== undefined) {
        return res.status(502).json({ success: false, error: parsed.error });
      }
      token = extractBearerToken(parsed);
      if (!token) {
        const detail = parsed.errorMessage || parsed.message || parsed.error || JSON.stringify(parsed).slice(0, 300);
        return res.status(502).json({ success: false, error: `Login failed (HTTP ${statusCode}): ${detail}` });
      }
    } else {
      // Use stored credentials for the given environment
      token = await getOrRefreshToken(environment || "nonprod");
    }

    const key = environment === "prod" ? "prod" : "nonProd";
    const cached = tokenCache[key];
    const expiresIn = cached ? Math.max(0, Math.round((cached.expiresAt - Date.now()) / 1000)) : 3600;
    return res.json({ success: true, token, expiresIn });
  } catch (e) {
    const code = e.code || "";
    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
      return res.status(502).json({ success: false, error: `Cannot connect to Saviynt instance: ${e.message}. Check the URL in Saviynt Settings.` });
    }
    res.status(502).json({ success: false, error: e.message });
  }
});

// Route 2 — POST /api/saviynt/register-endpoint
// Registers the application in Saviynt EIC using the confirmed v5 API:
//   POST /ECM/api/v5/createEndpoint
//
// Saviynt automatically creates the Security System when createEndpoint is called
// with a new securitysystem name. There is NO separate createSecuritySystem API.
// Mandatory fields: endpointname, displayName, securitysystem
app.post("/api/saviynt/register-endpoint", async (req, res) => {
  try {
    const { environment = "nonprod", applicationData = {} } = req.body || {};

    const cfg = getSaviyntConfig(environment);
    if (!cfg || !cfg.url) {
      return res.status(400).json({
        success: false,
        error: "Saviynt EIC credentials not configured. Go to Saviynt Settings and save the instance URL, username, and password."
      });
    }

    const base  = cfg.url.replace(/\/$/, "");
    const token = await getOrRefreshToken(environment);

    // Normalise names: Saviynt replaces spaces with underscores in endpoint/security system names.
    // Normalising here ensures registration, post-reg artifact creation, and JML tests all
    // reference the exact same identifier.
    const appName   = (applicationData.applicationName || applicationData.displayName || "UnnamedApp").trim().replace(/\s+/g, "_");
    const secSystem = (applicationData.securitySystem  || appName).trim().replace(/\s+/g, "_");

    // ── Build full createEndpoint payload with all mandatory Saviynt EIC fields ──
    // Reference: Saviynt EIC REST API v5 — createEndpoint mandatory parameters.
    // Fields marked (* mandatory) are required for the endpoint to be created and
    // for JML operations (joiner/mover/leaver) to function correctly.
    const connParams = applicationData.connectionParams || {};
    const payload = {
      // (* mandatory) Unique endpoint identifier — used in all subsequent API calls
      endpointname:           appName,
      // (* mandatory) Human-readable label shown in EIC UI
      displayName:            applicationData.displayName   || appName,
      // (* mandatory) Parent Security System — auto-created if new
      securitysystem:         secSystem,
      // Description for audit/documentation purposes
      description:            applicationData.description   ||
                              `Managed by Saviynt Onboarder — ${applicationData.connectorType || "REST"} integration`,
      // Connector type: must match an installed Saviynt connector
      connectorType:          applicationData.connectorType || connParams.connectorType || "REST",
      // Connection string / base URL for the target system
      connection:             connParams.baseUrl             || connParams.connection || "",
      // Authentication credentials for the target system
      connectionuser:         connParams.username            || connParams.connectionuser || "",
      connectionpassword:     connParams.password            || connParams.connectionpassword || "",
      // Access token URL for OAuth connectors
      accessTokenUrl:         connParams.tokenEndpoint       || connParams.accessTokenUrl || "",
      clientId:               connParams.clientId            || "",
      clientSecret:           connParams.clientSecret        || "",
      grantType:              connParams.grantType           || "client_credentials",
      // Provisioning/reconciliation queries — only included when explicitly provided by the user.
      // DO NOT send default SQL strings: Saviynt's WAF blocks requests containing SQL keywords
      // (INSERT, UPDATE, SELECT) in the payload body, returning a misleading 401 response.
      // These fields are optional at endpoint creation time; they can be configured later
      // in the Saviynt EIC UI under the endpoint's Connection tab.
      ...(connParams.addAccount    ? { addAccount:    connParams.addAccount    } : {}),
      ...(connParams.removeAccount ? { removeAccount: connParams.removeAccount } : {}),
      ...(connParams.updateAccount ? { updateAccount: connParams.updateAccount } : {}),
      ...(connParams.reconQuery    ? { reconQuery:    connParams.reconQuery    } : {}),
      // Enable/disable the endpoint immediately after creation
      enableEndpoint:         "true",
      // Ownership and organisational metadata
      ...(applicationData.owner       ? { owner:          applicationData.owner       } : {}),
      ...(applicationData.ownerEmail  ? { ownerEmail:     applicationData.ownerEmail  } : {}),
      ...(applicationData.department  ? { department:     applicationData.department  } : {}),
      // Pass through any additional connector-specific overrides from the UI form
      ...Object.fromEntries(
        Object.entries(connParams).filter(([k]) =>
          !["baseUrl","connection","username","connectionuser","password","connectionpassword",
            "tokenEndpoint","accessTokenUrl","clientId","clientSecret","grantType",
            "addAccount","removeAccount","updateAccount","reconQuery","connectorType"].includes(k)
        )
      )
    };

    console.log(`[register-endpoint] POST createEndpoint → ${SAVIYNT_ENDPOINTS.createEndpoint(base)}`);
    console.log(`[register-endpoint] Payload:`, JSON.stringify(payload));

    const { statusCode, body } = await saviyntRequest("POST", SAVIYNT_ENDPOINTS.createEndpoint(base), {
      headers: { Authorization: `Bearer ${token}` },
      body:    payload
    });
    const parsed = parseBody(body, statusCode);
    console.log(`[register-endpoint] HTTP ${statusCode}:`, JSON.stringify(parsed).slice(0, 300));

    // 409 = already exists — treat as success (idempotent)
    const alreadyExists = statusCode === 409 ||
      (parsed.message && parsed.message.toLowerCase().includes("already exists")) ||
      (parsed.errorCode && String(parsed.errorCode) === "002");

    if (statusCode >= 400 && !alreadyExists) {
      // Some Saviynt WAF/validation errors put the real message in rawBody (string) rather than
      // in a JSON field — check both so friendlyRegistrationError sees the actual message.
      const rawBodyStr = typeof body === "string" ? body : "";
      const detail = parsed.errorMessage || parsed.message || parsed.error || parsed.rawBody || rawBodyStr || `HTTP ${statusCode}`;
      return res.status(502).json({
        success: false,
        step:    "createEndpoint",
        error:   friendlyRegistrationError(statusCode, detail, appName),
        rawResponse: parsed
      });
    }

    return res.json({
      success:       true,
      alreadyExisted: alreadyExists,
      message:       alreadyExists
        ? `"${appName}" already exists in Saviynt EIC — no changes made.`
        : `"${appName}" registered in Saviynt EIC successfully under Security System "${secSystem}".`,
      rawResponse:   parsed
    });

  } catch (e) {
    const code = e.code || "";
    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
      return res.status(502).json({ success: false, error: `Cannot connect to Saviynt: ${e.message}. Check the URL in Saviynt Settings.` });
    }
    res.status(502).json({ success: false, error: e.message });
  }
});

// Route 2b — POST /api/saviynt/post-registration-setup
//
// After a successful endpoint registration, this route auto-creates all
// mandatory Saviynt artifacts required for JML test cases to work:
//
//   1. Entitlement Type  — defines the governance category (e.g. "Role")
//   2. Access Query      — the SQL/query used to pull entitlements from the target system
//   3. Entitlement Policy — the policy governing who can request/be assigned entitlements
//   4. SAV Role          — the Saviynt role that maps to provisioned access
//
// All objects are created under the registered endpoint/security system.
// If an object already exists, the step is treated as a success (idempotent).
//
// Saviynt v5 API paths used:
//   POST /ECM/api/v5/createEntitlementType
//   POST /ECM/api/v5/updateEntitlementType     (adds access query)
//   POST /ECM/api/v5/createEntitlementPolicy
//   POST /ECM/api/v5/createRole               (SAV role)
//
app.post("/api/saviynt/post-registration-setup", async (req, res) => {
  const { environment = "nonprod", applicationName, securitySystem } = req.body || {};

  if (!applicationName) {
    return res.status(400).json({ success: false, error: "applicationName is required" });
  }

  const cfg = getSaviyntConfig(environment);
  if (!cfg || !cfg.url) {
    return res.status(400).json({
      success: false,
      error: "Saviynt EIC is not configured. Open Saviynt Settings and save the instance URL, username, and password."
    });
  }

  const base    = cfg.url.replace(/\/$/, "");
  // Normalise the app name to match exactly what Saviynt stores as the endpoint name.
  // Saviynt replaces spaces with underscores internally; all artifact names must match.
  const appName = applicationName.trim().replace(/\s+/g, "_");
  const sysName = (securitySystem || applicationName).trim().replace(/\s+/g, "_");
  const logPath = getLogFilePath(`post-reg-${appName}`);
  const log     = createLogger(logPath);

  log.info(`=== Post-Registration Setup: ${appName} (SecuritySystem: ${sysName}) ===`);

  const results = {};
  let token;

  try {
    token = await getOrRefreshToken(environment);
    log.info("Authentication: OK");
  } catch (e) {
    log.error(`Authentication failed: ${e.message}`);
    log.flush();
    return res.status(502).json({ success: false, error: `Cannot authenticate with Saviynt: ${e.message}` });
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // ── Helper: safe POST to Saviynt, returns { ok, data } ──────────────────
  async function saviyntPost(label, url, body) {
    try {
      const { statusCode, body: raw } = await saviyntRequest("POST", url, { headers: authHeaders, body });
      const data = parseBody(raw, statusCode);
      const alreadyExists =
        statusCode === 409 ||
        (data.message && data.message.toLowerCase().includes("already exist")) ||
        (data.errorCode && ["002", "1"].includes(String(data.errorCode)));

      if (alreadyExists) {
        log.warn(`${label}: Already exists — skipping (idempotent).`);
        return { ok: true, alreadyExisted: true, data };
      }
      if (statusCode >= 400) {
        const err = data.errorMessage || data.message || data.error || `HTTP ${statusCode}`;
        log.error(`${label}: FAILED — ${err}`);
        return { ok: false, error: err, data };
      }
      log.info(`${label}: Created successfully.`);
      return { ok: true, alreadyExisted: false, data };
    } catch (e) {
      log.error(`${label}: Exception — ${e.message}`);
      return { ok: false, error: e.message };
    }
  }

  // ── Step 1: Create Entitlement Type ──────────────────────────────────────
  // Mandatory for JML: defines the entitlement category (e.g. "Role", "Profile")
  log.info("Step 1: Creating Entitlement Type...");
  const entTypeName = `${appName}_Role`;
  results.entitlementType = await saviyntPost(
    "EntitlementType",
    `${base}/ECM/api/v5/createEntitlementType`,    {
      endpointname:           appName,
      entitlementtypename:    entTypeName,
      displayName:            `${appName} Role`,
      description:            `Primary entitlement type for ${appName} — auto-created by Saviynt Onboarder`,
      requestable:            "true",
      requestableByUser:      "true",
      requestableByManager:   "true",
      selfRequestable:        "false",
      approvalRequired:       "true",
      allowMultipleValues:    "false",
      accessType:             "Application",
      entitlementOwnerType:   "SYSTEM",
      attributetype:          "role",
      status:                 "1"
    }
  );

  // ── Step 2: Set Access Query on Entitlement Type ──────────────────────────
  // Access query is required for Saviynt to pull entitlement values from the target system
  log.info("Step 2: Setting Access Query on Entitlement Type...");
  results.accessQuery = await saviyntPost(
    "AccessQuery",
    `${base}/ECM/api/v5/updateEntitlementType`,
    {
      endpointname:        appName,
      entitlementtypename: entTypeName,
      accessQuery:         `SELECT entitlement_value, displayname, description, status FROM userEntitlements WHERE endpoint='${appName}' AND entitlementtype='${entTypeName}'`,
      reconcileQuery:      `SELECT accountname, entitlement_value FROM roleMembers WHERE endpoint='${appName}'`,
      queryTimeout:        "30"
    }
  );

  // ── Step 3: Create Entitlement Policy ────────────────────────────────────
  // Mandatory for JML: governs who can have entitlements assigned/requested.
  // policyType "direct" + no policyConditions = any user can be provisioned.
  // approvalRequired "false" = joiner test case completes without workflow.
  log.info("Step 3: Creating Entitlement Policy...");
  results.entitlementPolicy = await saviyntPost(
    "EntitlementPolicy",
    SAVIYNT_ENDPOINTS.createEntitlementPolicy(base),
    {
      policyname:          `${appName}_Default_Policy`,
      displayName:         `${appName} Default Access Policy`,
      description:         `Default entitlement policy for ${appName} — permits all JML provisioning without approval`,
      endpointname:        appName,
      entitlementtypename: entTypeName,
      policyType:          "direct",       // "direct" = no attribute condition check
      maxAllowed:          "0",            // 0 = unlimited
      approvalRequired:    "false",
      expirationDays:      "0",
      status:              "1"
      // No policyConditions — an empty/missing condition means all users pass
    }
  );

  // ── Step 4: Create SAV Role (Saviynt Role for provisioning) ──────────────
  // Required for role-based provisioning in JML joiner/mover flows
  log.info("Step 4: Creating SAV Role...");
  results.savRole = await saviyntPost(
    "SAVRole",
    `${base}/ECM/api/v5/createRole`,
    {
      rolename:            `${appName}_Standard_User`,
      displayName:         `${appName} Standard User`,
      description:         `Standard user role for ${appName} — assigned during JML joiner provisioning`,
      roletype:            "EntitlementRole",
      requestable:         "true",
      requestableByUser:   "true",
      approvalRequired:    "false",
      status:              "1",
      entitlements:        JSON.stringify([
        {
          endpointname:        appName,
          entitlementtypename: entTypeName,
          entitlementvalue:    `${appName}_Basic_Access`
        }
      ])
    }
  );

  // ── Summary ───────────────────────────────────────────────────────────────
  const allOk     = Object.values(results).every(r => r.ok);
  const summary   = Object.entries(results).map(([k, v]) =>
    `${k}: ${v.ok ? (v.alreadyExisted ? "already existed" : "created") : "FAILED — " + (v.error || "unknown")}`
  );

  log.info(`Post-registration setup ${allOk ? "COMPLETE" : "PARTIAL"}.`);
  summary.forEach(s => log.info("  " + s));
  log.flush();

  return res.json({
    success:  allOk,
    partial:  !allOk && Object.values(results).some(r => r.ok),
    summary,
    results,
    logFile:  path.basename(logPath)
  });
});

// Route 3 — POST /api/saviynt/jml
// Authenticates internally via getOrRefreshToken — caller does NOT need to supply a token.
app.post("/api/saviynt/jml", async (req, res) => {
  try {
    const { environment = "nonprod", action, payload = {} } = req.body || {};

    const cfg = getSaviyntConfig(environment);
    if (!cfg || !cfg.url) {
      return res.status(400).json({ success: false, error: `Saviynt EIC credentials not configured for environment '${environment}'` });
    }
    if (!action) {
      return res.status(400).json({ success: false, error: "action is required (joiner|mover|leaver)" });
    }

    const token = await getOrRefreshToken(environment);
    const headers = { Authorization: `Bearer ${token}` };
    const base = cfg.url.replace(/\/$/, "");

    let method, urlPath, enrichedPayload;

    if (action === "joiner") {
      method  = "POST";
      urlPath = SAVIYNT_ENDPOINTS.createUser(base);

      const appName     = payload.endpointname || payload.securitysystem || "";
      // Saviynt normalises endpoint names: spaces → underscores, lowercased in some versions.
      // Always normalise to match exactly what was registered.
      const safeAppName = appName.replace(/\s+/g, "_");
      const roleName    = safeAppName ? `${safeAppName}_Standard_User` : "";

      // ServiceNow uses different field names than Saviynt's generic user model.
      // Saviynt's OOTB SN connector maps these fields when calling /api/now/table/sys_user:
      //   Saviynt field  →  ServiceNow field
      //   firstname      →  first_name
      //   lastname       →  last_name
      //   username       →  user_name  (also sent as systemUserName)
      //   email          →  email
      //   department     →  department (SN reference — send name, SN resolves it)
      //   statuskey=1    →  active=true
      // We send BOTH naming conventions so either connector version works.

      const fn = payload.firstname || payload.first_name || "Test";
      const ln = payload.lastname  || payload.last_name  || "User";
      const em = payload.email     || `${payload.username}@test.local`;

      enrichedPayload = {
        // ── Saviynt generic field names ──────────────────────────────────────
        username:             payload.username,
        firstname:            fn,
        lastname:             ln,
        email:                em,
        displayname:          `${fn} ${ln}`,
        statuskey:            "1",
        // ── ServiceNow field names (passed through to SN connector) ──────────
        user_name:            payload.username,   // SN primary key
        first_name:           fn,
        last_name:            ln,
        active:               "true",
        locked_out:           "false",
        // ── Endpoint association — use normalised name ────────────────────────
        ...(safeAppName ? { systemUserName:  payload.username } : {}),
        ...(safeAppName ? { endpointname:    safeAppName }      : {}),
        ...(safeAppName ? { securitysystem:  safeAppName }      : {}),
        // ── Department / manager ──────────────────────────────────────────────
        // Send as plain string — Saviynt/SN connector resolves reference
        department:           payload.department || "IT",
        manager:              payload.manager    || "",
        // ── Provisioning metadata ─────────────────────────────────────────────
        provisioningComments: "JML Joiner test — auto-provisioned by Saviynt Onboarder",
        // ── SAV role grant — satisfies entitlement policy check ───────────────
        ...(roleName ? { roles: JSON.stringify([{ rolename: roleName }]) } : {}),
        // ── Pass through any extra fields from the form ───────────────────────
        ...Object.fromEntries(
          Object.entries(payload).filter(([k]) =>
            !["username","firstname","lastname","first_name","last_name","email",
              "displayname","endpointname","securitysystem","systemUserName",
              "department","manager","statuskey","active","locked_out",
              "user_name","provisioningComments","roles","userAttributes"].includes(k)
          )
        ),
        // Flatten userAttributes — SN-specific fields the user typed in the form
        ...(payload.userAttributes && typeof payload.userAttributes === "object"
          ? payload.userAttributes : {})
      };

    } else if (action === "mover") {
      method  = "POST";
      urlPath = `${base}/ECM/api/v5/updateUser`;

      const appName     = payload.endpointname || payload.securitysystem || "";
      const safeAppName = appName.replace(/\s+/g, "_");

      const newDept = payload.newDepartment || payload.department || "IT";
      const newMgr  = payload.newManager    || payload.manager    || "";

      enrichedPayload = {
        username:             payload.username,
        user_name:            payload.username,
        // Updated attributes — both Saviynt and SN field names
        department:           newDept,
        manager:              newMgr,
        title:                payload.title || payload.newTitle || "",
        ...(safeAppName ? { endpointname:   safeAppName } : {}),
        ...(safeAppName ? { securitysystem: safeAppName } : {}),
        statuskey:            "1",
        active:               "true",
        provisioningComments: "JML Mover test — auto-updated by Saviynt Onboarder",
        ...(payload.userAttributes && typeof payload.userAttributes === "object"
          ? payload.userAttributes : {}),
        ...Object.fromEntries(
          Object.entries(payload).filter(([k]) =>
            !["username","user_name","department","newDepartment","manager","newManager",
              "title","newTitle","endpointname","securitysystem","statuskey","active",
              "provisioningComments","userAttributes"].includes(k)
          )
        )
      };

    } else if (action === "leaver") {
      method  = "POST";
      urlPath = SAVIYNT_ENDPOINTS.removeUserAccess(base);

      const appName     = payload.endpointname || payload.securitysystem || "";
      const safeAppName = appName.replace(/\s+/g, "_");

      enrichedPayload = {
        username:             payload.username,
        usernames:            [payload.username],
        user_name:            payload.username,
        ...(safeAppName ? { endpointname:   safeAppName } : {}),
        ...(safeAppName ? { securitysystem: safeAppName } : {}),
        removeAllAccess:      "true",
        active:               "false",   // also signal SN to deactivate the account
        statuskey:            "0",
        provisioningComments: "JML Leaver test — auto-deprovisioned by Saviynt Onboarder",
      };

    } else {
      return res.status(400).json({ success: false, error: `Unknown action '${action}'` });
    }

    const { statusCode, body } = await saviyntRequest(method, urlPath, { headers, body: enrichedPayload });
    const parsed = parseBody(body, statusCode);

    // Surface a clear error if Saviynt blocks due to entitlement policy
    const rawMsg = (parsed.errorMessage || parsed.message || parsed.error || "").toLowerCase();
    if (rawMsg.includes("entitlement policy") || rawMsg.includes("policy") && rawMsg.includes("block")) {
      return res.status(502).json({
        success: false,
        error: `Provisioning blocked by Saviynt entitlement policy. ` +
               `Ensure the post-registration setup ran successfully (EntitlementType, EntitlementPolicy with policyType=direct, and SAV Role must all exist for "${payload.endpointname || "this app"}"). ` +
               `Raw: ${parsed.errorMessage || parsed.message || parsed.error}`,
        rawResponse: parsed
      });
    }

    res.status(statusCode >= 200 && statusCode < 300 ? 200 : 502).json(parsed);

  } catch (e) {
    const code = e.code || "";
    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
      return res.status(502).json({ success: false, error: `Cannot connect to Saviynt instance: ${e.message}. Check the URL in Saviynt Settings.` });
    }
    res.status(502).json({ success: false, error: e.message });
  }
});

// Route 4 — POST /api/saviynt/submit-queue — DISABLED (Queue feature removed)
app.post("/api/saviynt/submit-queue", (req, res) => {
  res.status(410).json({ success: false, error: "The Saviynt Queue feature has been removed. Use the endpoint registration flow directly." });
});

// Route 5 — POST /api/saviynt/test-connection
// Verifies connectivity AND credential validity by obtaining a bearer token.
app.post("/api/saviynt/test-connection", async (req, res) => {
  try {
    const { environment = "nonprod" } = req.body || {};

    const cfg = getSaviyntConfig(environment);
    if (!cfg || !cfg.url) {
      return res.json({
        success: false,
        tokenObtained: false,
        message: "Not configured",
        error: `Saviynt EIC credentials not configured for '${environment}'. Go to Saviynt Settings to save the instance URL, username, and password.`
      });
    }

    // Force a fresh login so we always verify live credentials (don't use cache)
    const key = environment === "prod" ? "prod" : "nonProd";
    tokenCache[key] = null;

    const start = Date.now();
    const token = await getOrRefreshToken(environment);
    const latencyMs = Date.now() - start;

    res.json({
      success: true,
      tokenObtained: true,
      latencyMs,
      message: "Bearer token obtained successfully",
      detail: `Connected to ${cfg.url} in ${latencyMs} ms`
    });
  } catch (e) {
    const code = e.code || "";
    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
      return res.json({
        success: false,
        tokenObtained: false,
        message: "Network error",
        error: `Cannot reach Saviynt instance: ${e.message}. Check the URL and ensure the server is reachable from this machine.`
      });
    }
    res.json({
      success: false,
      tokenObtained: false,
      message: "Authentication failed",
      error: e.message
    });
  }
});

// ─── Logging helpers ──────────────────────────────────────────────────────────

function getLogFilePath(appName) {
  const safe = (appName || "onboarding").replace(/[^a-zA-Z0-9_-]/g, "_");
  const ts   = new Date().toISOString().replace(/[:T]/g, "-").replace(/\..+/, "");
  return path.join(LOGS_DIR, `${safe}_${ts}.log`);
}

function createLogger(logPath) {
  const lines = [];
  const log = (level, msg) => {
    const line = `[${new Date().toISOString()}] [${level}] ${msg}`;
    lines.push(line);
    console.log(line);
  };
  const flush = () => {
    try {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
      fs.writeFileSync(logPath, lines.join("\n") + "\n", "utf8");
    } catch (e) {
      console.error("[logger] Could not write log file:", e.message);
    }
  };
  return { info: (m) => log("INFO", m), warn: (m) => log("WARN", m), error: (m) => log("ERROR", m), flush, lines };
}

/** Translate raw Saviynt / network errors into plain-English messages */
function friendlyError(err, context) {
  const msg = (err && err.message) ? err.message : String(err || "Unknown error");
  const code = (err && err.code) || "";
  if (code === "ECONNREFUSED") return `Could not connect to the Saviynt instance — connection refused. Check that the URL is correct and the server is running.`;
  if (code === "ENOTFOUND")    return `Could not find the Saviynt server — hostname not found. Check the URL in Saviynt Settings.`;
  if (code === "ETIMEDOUT")    return `The request to Saviynt timed out. The server may be slow or unreachable. Try again or check your network.`;
  if (msg.includes("No bearer token"))  return `Login succeeded but Saviynt did not return an access token. Check the API is enabled on your instance.`;
  if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) return `Authentication failed — wrong username or password for the Saviynt instance. Update your credentials in Saviynt Settings.`;
  if (msg.includes("403") || msg.toLowerCase().includes("forbidden"))    return `Permission denied by Saviynt. The configured user may not have the required API role.`;
  if (msg.includes("404"))  return `The Saviynt API endpoint was not found (404). Check that the URL is correct and the API version is supported.`;
  if (msg.includes("409"))  return `${context || "The resource"} already exists in Saviynt (conflict). It may have been onboarded previously.`;
  if (msg.includes("500"))  return `Saviynt returned an internal server error (500). Check the Saviynt server logs for details.`;
  if (msg.includes("HTML error page")) return `Saviynt returned an HTML page instead of a JSON response. The URL may be wrong or the instance may be down.`;
  return msg;
}

/**
 * Produce a plain-English error message for Security System / Endpoint registration failures.
 * The HTTP status code from Saviynt's Tomcat container is the most actionable signal.
 */
function friendlyRegistrationError(statusCode, rawMessage, resourceName) {
  const msg = (rawMessage || "").toLowerCase();

  // Saviynt WAF blocks payloads containing SQL-like keywords and returns a non-standard
  // body with a misleading HTTP status. Detect this before branching on status code.
  if (msg.includes("sql query") || msg.includes("resembles") || msg.includes("sql injection")) {
    return `Saviynt rejected the payload because it contained SQL-like text. Remove any SQL from the connection parameters and try again. Raw message: ${rawMessage}`;
  }

  switch (statusCode) {
    case 400: return `Bad request registering "${resourceName}" — some fields may be missing or invalid. Check connector type, department, and owner fields. Detail: ${rawMessage}`;
    case 401: return `Authentication error (401) — the bearer token was rejected. The session may have expired; try the Test Connection button in Saviynt Settings to get a fresh token. Detail: ${rawMessage}`;
    case 403: return `Access denied (403) — the Saviynt API user does not have permission to create Security Systems or Endpoints. Ask your Saviynt admin to grant the "ROLE_ADMIN" or "ROLE_API" role to this user. Detail: ${rawMessage}`;
    case 404: return `API endpoint not found (404) — the instance URL may be wrong, or this EIC version does not support the v5 REST API. Expected path: /ECM/api/v5/createEndpoint. Detail: ${rawMessage}`;
    case 409: return `"${resourceName}" already exists in Saviynt EIC. No changes were made.`;
    case 500: return `Saviynt returned an internal server error (500) while registering "${resourceName}". Check the Saviynt application logs. Detail: ${rawMessage}`;
    default:  return rawMessage || `Unexpected HTTP ${statusCode} from Saviynt while registering "${resourceName}".`;
  }
}

// Route 9b — POST /api/saviynt/jml-cleanup
// Server-side proxy for the JML leaver cleanup step.
// The frontend previously called Saviynt directly (causing CORS). This route
// performs the login + removeUserAccess call server-side and returns the result.
app.post("/api/saviynt/jml-cleanup", async (req, res) => {
  const { url, username, password, targetUser } = req.body || {};
  if (!url || !username || !password || !targetUser) {
    return res.status(400).json({ success: false, error: "url, username, password and targetUser are required" });
  }
  try {
    // Step 1 — Authenticate (tries JSON first, falls back to form-encoded automatically)
    const loginUrl = SAVIYNT_ENDPOINTS.login(url.replace(/\/$/, ""));
    const { statusCode: loginStatus, body: loginBody } = await saviyntLogin(loginUrl, username, password);
    const loginParsed = parseBody(loginBody, loginStatus);
    const token = extractBearerToken(loginParsed);
    if (!token) {
      const detail = loginParsed.errorMessage || loginParsed.message || loginParsed.error || `HTTP ${loginStatus}`;
      return res.status(502).json({ success: false, error: `Saviynt login failed during cleanup: ${detail}` });
    }

    // Step 2 — Remove user access
    const removeUrl = SAVIYNT_ENDPOINTS.removeUserAccess(url.replace(/\/$/, ""));
    const { statusCode, body } = await saviyntRequest("POST", removeUrl, {
      headers: { Authorization: `Bearer ${token}` },
      body: {
        username:        targetUser,
        usernames:       [targetUser],
        removeAllAccess: "true",
        provisioningComments: "JML Leaver cleanup — triggered by Saviynt Onboarder"
      }
    });
    const parsed = parseBody(body);
    res.status(statusCode >= 200 && statusCode < 300 ? 200 : 502).json({ success: statusCode >= 200 && statusCode < 300, result: parsed });
  } catch (e) {
    const code = e.code || "";
    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
      return res.status(502).json({ success: false, error: `Cannot reach Saviynt instance: ${e.message}` });
    }
    res.status(502).json({ success: false, error: e.message });
  }
});

// Route 10 — POST /api/saviynt/onboard-application
// One-click onboarding: validates config, authenticates, registers the app, and writes a log file.
app.post("/api/saviynt/onboard-application", async (req, res) => {
  const { environment = "nonprod", applicationData = {}, appName = "Application" } = req.body || {};
  const logPath = getLogFilePath(appName);
  const log = createLogger(logPath);

  log.info(`=== One-Click Onboarding started for: ${appName} ===`);
  log.info(`Target environment: ${environment}`);

  try {
    // Step 1 — Check Saviynt config is saved
    const cfg = getSaviyntConfig(environment);
    if (!cfg || !cfg.url) {
      const msg = `Saviynt EIC is not configured for '${environment}'. Please open Saviynt Settings and save the instance URL, username, and password before onboarding.`;
      log.error(`Step 1 FAILED — missing config: ${msg}`);
      log.flush();
      return res.status(400).json({ success: false, step: "config-check", error: msg, logFile: path.basename(logPath) });
    }
    if (!cfg.username || !cfg.password) {
      const msg = `Saviynt EIC username or password is missing for '${environment}'. Update the credentials in Saviynt Settings.`;
      log.error(`Step 1 FAILED — missing credentials: ${msg}`);
      log.flush();
      return res.status(400).json({ success: false, step: "config-check", error: msg, logFile: path.basename(logPath) });
    }
    log.info(`Step 1 PASSED — Saviynt config found (URL: ${cfg.url})`);

    // Step 2 — Obtain bearer token (always fresh for onboarding)
    log.info(`Step 2 — Authenticating with Saviynt EIC at ${cfg.url} …`);
    const envKey = environment === "prod" ? "prod" : "nonProd";
    tokenCache[envKey] = null; // force fresh auth
    let token;
    try {
      token = await getOrRefreshToken(environment);
      log.info(`Step 2 PASSED — Authentication successful, bearer token obtained.`);
    } catch (authErr) {
      const friendly = friendlyError(authErr, "Authentication");
      log.error(`Step 2 FAILED — ${friendly}`);
      log.error(`Raw error: ${authErr.message}`);
      log.flush();
      return res.status(502).json({ success: false, step: "authentication", error: friendly, logFile: path.basename(logPath) });
    }

    // Step 3 — Register application in Saviynt EIC (Security System + Endpoint)
    log.info(`Step 3 — Registering application in Saviynt EIC via createEndpoint …`);
    log.info(`Payload: ${JSON.stringify(applicationData, null, 2)}`);
    let registerResult;
    try {
      const base        = cfg.url.replace(/\/$/, "");
      const authHeaders = { Authorization: `Bearer ${token}` };
      const epName      = (applicationData.applicationName || appName).trim();
      const secSystem   = (applicationData.securitySystem  || epName).trim();

      const epPayload = {
        // (* mandatory) Unique endpoint identifier
        endpointname:           epName,
        // (* mandatory) Display name in EIC
        displayName:            applicationData.displayName || epName,
        // (* mandatory) Parent Security System
        securitysystem:         secSystem,
        description:            applicationData.description ||
                                `Managed by Saviynt Onboarder — ${applicationData.connectorType || "REST"} integration`,
        connectorType:          applicationData.connectorType || (applicationData.connectionParams || {}).connectorType || "REST",
        connection:             (applicationData.connectionParams || {}).baseUrl || (applicationData.connectionParams || {}).connection || "",
        connectionuser:         (applicationData.connectionParams || {}).username || "",
        connectionpassword:     (applicationData.connectionParams || {}).password || "",
        accessTokenUrl:         (applicationData.connectionParams || {}).tokenEndpoint || "",
        clientId:               (applicationData.connectionParams || {}).clientId || "",
        clientSecret:           (applicationData.connectionParams || {}).clientSecret || "",
        grantType:              (applicationData.connectionParams || {}).grantType || "client_credentials",
        // Provisioning/reconciliation queries — only included when explicitly provided.
        // Default SQL strings are omitted to avoid Saviynt WAF blocking the request.
        ...((applicationData.connectionParams || {}).addAccount    ? { addAccount:    (applicationData.connectionParams || {}).addAccount    } : {}),
        ...((applicationData.connectionParams || {}).removeAccount ? { removeAccount: (applicationData.connectionParams || {}).removeAccount } : {}),
        ...((applicationData.connectionParams || {}).updateAccount ? { updateAccount: (applicationData.connectionParams || {}).updateAccount } : {}),
        ...((applicationData.connectionParams || {}).reconQuery    ? { reconQuery:    (applicationData.connectionParams || {}).reconQuery    } : {}),
        enableEndpoint:         "true",
        ...(applicationData.owner      ? { owner:      applicationData.owner      } : {}),
        ...(applicationData.ownerEmail ? { ownerEmail: applicationData.ownerEmail } : {}),
        ...(applicationData.department ? { department: applicationData.department } : {}),
      };

      log.info(`Step 3 — POST createEndpoint for: ${epName} (securitysystem: ${secSystem})`);
      const epRes    = await saviyntRequest("POST", SAVIYNT_ENDPOINTS.createEndpoint(base), { headers: authHeaders, body: epPayload });
      const epParsed = parseBody(epRes.body, epRes.statusCode);
      log.info(`Step 3 HTTP ${epRes.statusCode}: ${JSON.stringify(epParsed).slice(0, 300)}`);

      const alreadyExists = epRes.statusCode === 409 ||
        (epParsed.message && epParsed.message.toLowerCase().includes("already exists")) ||
        (epParsed.errorCode && String(epParsed.errorCode) === "002");

      if (epRes.statusCode >= 400 && !alreadyExists) {
        const errMsg = friendlyRegistrationError(epRes.statusCode, epParsed.errorMessage || epParsed.message || epParsed.error || "", epName);
        log.error(`Step 3 FAILED — ${errMsg}`);
        log.flush();
        return res.status(502).json({ success: false, step: "createEndpoint", error: errMsg, rawResponse: epParsed, logFile: path.basename(logPath) });
      }

      registerResult = { endpoint: epParsed, alreadyExisted: alreadyExists };
      if (alreadyExists) {
        log.warn(`Step 3 WARNING — "${epName}" already exists in Saviynt EIC.`);
      } else {
        log.info(`Step 3 PASSED — Application registered successfully.`);
      }
    } catch (regErr) {
      const friendly = friendlyError(regErr, `Registering ${appName}`);
      log.error(`Step 3 FAILED — ${friendly}`);
      log.error(`Raw error: ${regErr.message}`);
      log.flush();
      return res.status(502).json({ success: false, step: "register", error: friendly, logFile: path.basename(logPath) });
    }

    // Step 4 — Update app record status in local data
    log.info(`Step 4 — Updating local application status to 'onboarded' …`);
    try {
      const appsFile = path.join(DATA_DIR, "apps.json");
      const apps = readJSON(appsFile) || [];
      const idx = apps.findIndex((a) => a.name === appName || a.id === applicationData.id);
      if (idx !== -1) {
        apps[idx].onboardedAt = new Date().toISOString();
        apps[idx].onboardedEnv = environment;
        apps[idx].onboardStatus = "onboarded";
        writeJSON(appsFile, apps);
        log.info(`Step 4 PASSED — Local app record updated.`);
      } else {
        log.warn(`Step 4 — App '${appName}' not found in local apps.json; status not updated.`);
      }
    } catch (localErr) {
      log.warn(`Step 4 — Could not update local app record: ${localErr.message}`);
    }

    log.info(`=== Onboarding complete for: ${appName} ===`);
    log.flush();

    return res.json({
      success: true,
      step:    "complete",
      message: `${appName} was successfully onboarded to Saviynt EIC (${environment} environment).`,
      result:  registerResult,
      logFile: path.basename(logPath)
    });

  } catch (unexpectedErr) {
    const friendly = `An unexpected error occurred: ${unexpectedErr.message}. Please check the log file for details.`;
    log.error(`Unexpected error: ${unexpectedErr.message}`);
    log.error(unexpectedErr.stack || "(no stack)");
    log.flush();
    return res.status(500).json({ success: false, step: "unexpected", error: friendly, logFile: path.basename(logPath) });
  }
});

// Route 11 — GET /api/logs — list onboarding log files
app.get("/api/logs", (req, res) => {
  try {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
    const files = fs.readdirSync(LOGS_DIR)
      .filter((f) => f.endsWith(".log"))
      .map((f) => {
        const stat = fs.statSync(path.join(LOGS_DIR, f));
        return { name: f, size: stat.size, created: stat.birthtime };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    res.json(files);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Route 12 — GET /api/logs/:filename — download a specific log file
app.get("/api/logs/:filename", (req, res) => {
  const safe = path.basename(req.params.filename);
  if (!safe.endsWith(".log")) return res.status(400).json({ error: "Only .log files can be downloaded." });
  const filePath = path.join(LOGS_DIR, safe);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Log file not found." });
  res.setHeader("Content-Type", "text/plain");
  res.sendFile(filePath);
});


app.post("/api/saviynt/test-endpoint", async (req, res) => {
  const { url, method = "GET", headers = {}, body } = req.body || {};
  if (!url) return res.status(400).json({ error: "url is required" });

  try {
    const { statusCode, body: responseBody } = await saviyntRequest(method, url, { headers, body });
    const success = statusCode >= 200 && statusCode < 300;
    res.json({ success, status: statusCode, statusText: success ? "OK" : "Error", responseBody });
  } catch (e) {
    res.json({ success: false, status: 0, statusText: "Network Error", responseBody: e.message });
  }
});

// ─── RBAC helper for Saviynt settings endpoints ──────────────────────────────
// Reads X-Username and X-User-Role headers, looks the user up in users.json,
// and returns true only when the verified role is 'admin'.
// Returns a clear JSON 403 error and returns false if access should be denied.
function requireAdmin(req, res) {
  const headerUsername = (req.headers["x-username"] || "").trim();
  const headerRole     = (req.headers["x-user-role"] || "").trim();

  if (!headerUsername) {
    res.status(401).json({ error: "Unauthorized: X-Username header is required to access Saviynt Settings." });
    return false;
  }

  // Verify against users.json so the header cannot be spoofed with just a role claim
  const users = readJSON(path.join(DATA_DIR, "users.json")) || [];
  const user  = users.find((u) => (u.username || "").toLowerCase() === headerUsername.toLowerCase());

  if (!user) {
    res.status(403).json({ error: `Access denied: user '${headerUsername}' not found.` });
    return false;
  }

  // Cross-check header role against the stored role for defence-in-depth
  const storedRole = (user.role || "").toLowerCase();
  if (storedRole !== "admin" || headerRole.toLowerCase() !== "admin") {
    res.status(403).json({
      error: `Access denied: Saviynt EIC Settings can only be modified by Admin users. Your role is '${user.role || storedRole}'.`
    });
    return false;
  }

  return true;
}

// Route 7 — GET /api/saviynt/settings
app.get("/api/saviynt/settings", (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const settings = readJSON(path.join(DATA_DIR, "settings.json"));
    if (!settings) {
      return res.status(500).json({ error: "Cannot read settings.json" });
    }
    // Always return camelCase keys (nonProd) — never lowercase 'nonprod'
    res.json({
      nonProd: settings.nonProd || { url: "", username: "", password: "", verified: false },
      prod:    settings.prod    || { url: "", username: "", password: "", verified: false }
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Route 8 — PUT /api/saviynt/settings
app.put("/api/saviynt/settings", (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { environment, url, username, password } = req.body || {};
    if (!environment) return res.status(400).json({ error: "environment is required" });

    const filePath = path.join(DATA_DIR, "settings.json");
    const settings = readJSON(filePath) || {};
    // Normalise: 'nonprod', 'non-prod', 'nonProd' all map to the 'nonProd' key
    const key = environment === "prod" ? "prod" : "nonProd";

    settings[key] = { url: url || "", username: username || "", password: password || "", verified: false };

    writeJSON(filePath, settings);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Route 9 — POST /api/saviynt/ping
// Simple URL reachability check — no credentials needed
app.post("/api/saviynt/ping", async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "url is required" });
  try {
    const { statusCode } = await saviyntRequest("GET", url, { timeout: 8000 });
    res.json({ reachable: true, statusCode });
  } catch (e) {
    res.json({ reachable: false, error: e.message });
  }
});

// ─── Global JSON error handler for /api/* routes ────────────────────────────
// Placed AFTER all /api routes and BEFORE the SPA catch-all so any unhandled
// error in an API route always returns JSON, never the SPA index.html.
app.use((err, req, res, _next) => {
  console.error("[server] Unhandled error:", err);
  if (res.headersSent) return;
  if (req.path.startsWith("/api/")) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
  res.status(500).send("Server error");
});

// ─── Serve Vite dist (SPA fallback) ──────────────────────────────────────────
// IMPORTANT: This block is registered LAST — all /api/* routes above take
// priority because Express matches routes in registration order.
//
// Guard: prevent express.static from ever serving a file at an /api/ path.
// This ensures /api/download-package (and all other API routes) are always
// handled by the explicit route handlers above, never by the static middleware.
app.use("/api", (req, res, next) => {
  // If an API route was not matched by any handler above, return JSON 404.
  // This line is only reached when NO prior /api/* route matched.
  res.status(404).json({ error: `API route not found: ${req.path ? "/api" + req.path : req.originalUrl}` });
});

if (fs.existsSync(DIST_DIR) && fs.existsSync(path.join(DIST_DIR, "index.html"))) {
  app.use(express.static(DIST_DIR));
  // Catch-all: serve SPA for all remaining non-API paths.
  app.get("*", (req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
} else {
  // No built frontend — show setup instructions for all non-API paths
  app.get("*", (req, res) => {
    res.send(`<html><body style="font-family:sans-serif;padding:40px;background:#0d1424;color:#e5e7eb">
      <h2>&#9889; Saviynt AI Onboarder &#8212; Server Running</h2>
      <p style="color:#f87171">&#9888; No built frontend found at <code>${DIST_DIR}</code>.</p>
      <p>Run <code>pnpm build</code> inside <code>src/frontend/</code> first, then restart this server.</p>
    </body></html>`);
  });
}

// ─── Start on port 3000, fallback 3001 ───────────────────────────────────────
const PORT_PRIMARY  = 3000;
const PORT_FALLBACK = 3001;

const server = http.createServer(app);

server.listen(PORT_PRIMARY, "127.0.0.1", () => {
  console.log("");
  console.log("\u2554" + "\u2550".repeat(50) + "\u2557");
  console.log("\u2551   \u26A1  Saviynt AI Onboarder  \u2014  Local Server       \u2551");
  console.log("\u2560" + "\u2550".repeat(50) + "\u2563");
  console.log(`\u2551   URL : http://localhost:${PORT_PRIMARY}                     \u2551`);
  console.log(`\u2551   Data: ${path.relative(process.cwd(), DATA_DIR).padEnd(40)} \u2551`);
  console.log("\u2551   Login: admin / admin123                        \u2551");
  console.log("\u2551   Logs : logs\\ folder (onboarding logs)          \u2551");
  console.log("\u255A" + "\u2550".repeat(50) + "\u255D");
  console.log("");
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    server.listen(PORT_FALLBACK, "127.0.0.1", () => {
      console.log("");
      console.log(`\u26A1 Saviynt AI Onboarder running on http://localhost:${PORT_FALLBACK}`);
      console.log(`   (Port ${PORT_PRIMARY} was busy \u2014 using ${PORT_FALLBACK} instead)`);
      console.log("");
    });
  } else {
    throw err;
  }
});
