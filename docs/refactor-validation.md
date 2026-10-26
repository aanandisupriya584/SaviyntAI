# Frontend restructuring validation

Validated on 26 October 2026 on `Dev` (originally `frontend-changes`), branched from `UAT`.

## Behavior preservation

The visible content of Dashboard, Applications, Email Log, Users, IDP Settings,
EIC Settings, and Import was compared against the original built frontend using the
same fixtures. All seven pages matched after normalizing the application origin in
the IDP redirect URI (port 3000 became 3003).

The existing handlers and API contracts were retained. Source is now readable JSX
under `frontend/src/`, with one module per page and separate shared components,
contexts, services, data definitions, and styles.

## Automated checks

`npm run build` completed successfully.

`npm test`: **6 passed**. Coverage includes:

- All main pages render without runtime errors and restore after refresh.
- Application search, filters, row selection, CSV export, Edit popup and Lifecycle-tab restoration.
- Login, session restoration, account controls, theme switching and logout.
- CSV file picker, import tabs, user editor and enabling IDP fields.
- All pages fit 1440px, 768px and 390px viewports without page-level horizontal overflow.
- Actual backend login/session, document upload and logout using isolated storage.

The Vite development server was also started on 3003, its API proxy returned 200,
and the login page rendered without runtime errors.

## Container checks

The multi-stage Docker image built successfully and Compose started a healthy container.
Using a separate smoke-test Compose project and port 3005 to avoid the local app:

- Health endpoint returned 200.
- The configured initial admin password authenticated successfully.
- Application data could be written.
- An integration document could be uploaded.
- Both the application record and uploaded document survived container restart.
- Runtime user was `node`.
- The container root filesystem was read-only.

Production dependency audits for the frontend and backend reported zero known
vulnerabilities at validation time. The existing Multer 1.x dependency was updated
to a compatible 2.x release, with the upload endpoint exercised after the update.

## Boundaries

External Saviynt/EIC endpoints and an organization's real identity provider were not
called during regression checks. Those integrations retain their previous request
paths and handlers; environment-specific credentials and connectivity still require
validation in the target environment.

The source checkout was missing the two local font files referenced by its base
stylesheet. Existing font fallbacks and the pre-existing Google Fonts import were
retained. This produces two build warnings but does not prevent building or running.

Container packaging is not a complete security audit of the inherited application.
HTTPS termination, network access controls and session scaling are documented in README.md.
