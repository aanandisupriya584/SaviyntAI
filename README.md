# Saviynt IGA Onboarding Hub

React frontend with an Express API. The application runs at **http://localhost:3003**.

## Requirements

- Node.js **22.12 or newer** and npm for local development.
- Docker Desktop with Linux containers, or Docker Engine with Compose v2, for containers.
- Git.

## Run after cloning

```sh
git clone --branch Dev https://github.com/aanandisupriya584/SaviyntAI.git
cd SaviyntAI
npm ci
npm run setup
npm run build
npm start
```

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution is disabled.
Open **http://localhost:3003**. Keep the terminal running; use Ctrl+C to stop.
`start.bat` installs missing frontend/backend dependencies, builds the frontend, and starts the server.

Existing `data/` and `documents/` directories are reused. A fresh local installation creates
`admin` / `admin123`, unless `INITIAL_ADMIN_PASSWORD` is supplied before the first start.
Change that initial password before exposing the application to other users.

## Development with live React updates

```sh
npm run dev
```

Vite serves React on **3003** and proxies `/api` to Express on **3004**. Do not run
`npm start` and `npm run dev` at the same time: both use 3003 for the browser-facing app.
The backend development port can be changed with `API_PORT`.

## Docker

Copy the example environment file and set a strong initial admin password:

```sh
# macOS/Linux
cp .env.example .env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

Edit `.env`, replacing `INITIAL_ADMIN_PASSWORD`. Then:

```sh
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

Open **http://localhost:3003**. On a new Docker volume, log in as `admin` using the
initial password configured in `.env`. That environment variable only affects creation
of the initial account; it does not reset passwords in existing volumes.

If port 3003 is already used by the local app, stop the local server or change
`APP_PORT` in `.env`. The container still listens on 3003 internally.

```sh
# Stop without deleting stored data
docker compose down

# Rebuild and restart after source changes
docker compose up -d --build
```

The image uses a multi-stage build, locked npm dependencies, a non-root runtime user,
an HTTP health check, and graceful shutdown. Compose enables a read-only root filesystem,
drops Linux capabilities, limits container log size, and mounts writable named volumes:

| Volume | Contents |
| --- | --- |
| `app-data` | Users, applications, settings, and email records |
| `app-documents` | Uploaded integration specifications |
| `app-logs` | Onboarding and integration logs |

Local data, credentials, uploads, test artifacts, and `.env` are excluded from the build
context. Docker starts with separate data; it does not automatically copy your local data.
Back up all three volumes before moving or replacing a deployment. Do not use
`docker compose down -v` unless you intend to delete that deployment's data.

For a shared deployment, terminate HTTPS at your reverse proxy/load balancer and restrict
network access according to your environment. The container packaging does not replace
an application authentication/security review. Existing sessions remain in server memory,
so a restart requires login and multiple replicas require a shared session-store design.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3003` | Express listening port |
| `HOST` | `127.0.0.1` locally; `0.0.0.0` in Docker | Listening interface |
| `DIST_DIR` | `frontend/dist` | Built frontend directory |
| `DATA_DIR` | `data/` | Persistent JSON data directory |
| `DOCS_DIR` | `documents/` | Uploaded files directory |
| `LOGS_DIR` | `logs/` | Integration log directory |
| `INITIAL_ADMIN_PASSWORD` | Local development default | Password for first account creation |
| `APP_PORT` | `3003` | Compose host port |
| `API_PORT` | `3004` | Backend port for `npm run dev` |

`.env` is read by Compose. For local Node commands, set environment variables in your shell.
The frontend uses the same-origin Express API on every hostname. The original browser-only
storage fallback remains available by building with `VITE_STORAGE_MODE=browser`.

## Source structure

```text
frontend/
  index.html
  vite.config.js
  public/                     Static images, branding, environment metadata
  src/
    main.jsx                  React entry point and providers
    App.jsx                   Navigation, shared application state and actions
    pages/
      Login.jsx
      Dashboard.jsx
      Applications.jsx
      EmailLog.jsx
      Users.jsx
      IDPSettings.jsx
      EICSettings.jsx
      Import.jsx
    components/
      application-details/    Edit tabs, schema, lifecycle, tests, specifications
      common/                 Badges, metrics, progress, toasts and role guard
      dashboard/              Health chart
      settings/               Shared EIC instance form
      ui/                     Shared button, card, input, label and switch
    contexts/                 Authentication, theme and identity providers
    services/                 API, AI assessment and EIC requests
    data/                     Connector definitions and initial application data
    utils/                    Progress calculation and connection defaults
    styles/                   Base utilities, page styles and animations
server/
  server.cjs                  Express routes and persistent data handling
scripts/dev.cjs               Local development process launcher
tests/app.spec.cjs            Browser and API regression checks
Dockerfile
compose.yaml
```

Edit **`frontend/src/`**, not a built JavaScript bundle. `npm run build` regenerates
`frontend/dist/`, which is ignored by Git and built inside Docker. Static assets belong
in `frontend/public/`. Existing utility styles are retained in `src/styles/base.css`
to preserve the current UI; page styling lives alongside them in the other CSS files.

The original checkout contained a built bundle rather than React source. This branch
recovers page/component boundaries and JSX from that bundle while retaining existing
handlers, API contracts, data formats, theme settings, and role checks. The identity
provider wrapper is retained for compatibility; its Dfinity dependencies are not migrated
to a different authentication SDK as part of this refactor.

## Validation

```sh
npm run build
npm test
```

Browser tests use installed Chrome by default. To use Playwright's bundled Chromium:

```sh
npx playwright install chromium
# Set PLAYWRIGHT_CHANNEL=chromium in your shell, then npm test.
```

Tests cover navigation, refresh restoration, login/logout, theme switching, search,
filters, selection, CSV export, application Edit tabs, import file selection, IDP toggle,
user editor, responsive layouts, and actual backend login/session/document-upload routes.
Backend tests use separate temporary storage under ignored `logs/`; your data is not altered.

Health endpoint: **`GET /api/health`** returns `{"status":"ok"}`.
