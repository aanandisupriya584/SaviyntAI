const assert = require("node:assert/strict");

const baseUrl = (process.env.APP_URL || "http://127.0.0.1:3003").replace(/\/$/, "");
const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD;
if (!password) throw new Error("Set ADMIN_PASSWORD to the Docker app's initial admin password.");

async function main() {
  const anonymous = await fetch(`${baseUrl}/api/connector-agents/anonymous/latest`);
  assert.equal(anonymous.status, 401, "agent results should require an authenticated session");
  const login = await fetch(`${baseUrl}/api/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  assert.equal(login.ok, true, "Docker admin login should succeed");
  const cookie = login.headers.getSetCookie().find((value) => value.startsWith("onboarder_session="))?.split(";", 1)[0];
  assert.ok(cookie, "server should issue a session cookie");

  const appId = `docker-agent-smoke-${Date.now()}`;
  const payload = {
    appId,
    applicationName: "Docker Agent Smoke Test",
    version: 1,
    answers: {
      baseUrl: "https://api.example.test/v1",
      authType: "OAuth 2.0 client credentials",
      users: "/users",
      groups: "/groups",
      pagination: "Cursor / next link",
      provisioning: "Read accounts and groups",
      contact: "smoke-owner@example.test",
      apiSpec: JSON.stringify({ openapi: "3.0.0", paths: { "/users": { get: {} }, "/groups": { get: {} } } }),
      sampleData: JSON.stringify({ users: [{ id: "fixture-id", email: "fixture-person@example.test", password: "must-not-persist" }] }),
    },
  };
  const run = await fetch(`${baseUrl}/api/connector-agents/run`, {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify(payload),
  });
  assert.equal(run.status, 201, `agent run should be saved to Docker Postgres (got ${run.status})`);
  const result = await run.json();
  assert.deepEqual(result.sequence, ["intake", "analysis", "mapping", "configuration_validation", "documentation"]);
  assert.equal(result.validation.status, "passed");
  assert.ok(result.runId);
  assert.equal(JSON.stringify(result).includes("must-not-persist"), false);
  assert.equal(JSON.stringify(result).includes("fixture-person@example.test"), false);

  const latest = await fetch(`${baseUrl}/api/connector-agents/${encodeURIComponent(appId)}/latest`, { headers: { Cookie: cookie } });
  assert.equal(latest.status, 200, "saved agent result should be readable from Docker Postgres");
  const saved = await latest.json();
  assert.equal(String(saved.runId), String(result.runId));
  assert.deepEqual(saved.sequence, result.sequence);


  const approval = await fetch(`${baseUrl}/api/connector-agents/${encodeURIComponent(appId)}/approve`, {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ version: 1 }),
  });
  assert.equal(approval.status, 200, "admin should approve the exact validated version");
  assert.equal((await approval.json()).approval.version, 1);
  const approved = await (await fetch(`${baseUrl}/api/connector-agents/${encodeURIComponent(appId)}/latest`, { headers: { Cookie: cookie } })).json();
  assert.equal(approved.status, "approved");

  const duplicate = await fetch(`${baseUrl}/api/connector-agents/run`, {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify(payload),
  });
  assert.equal(duplicate.status, 409, "database uniqueness should prevent duplicate version creation");
  console.log("Docker connector-agent smoke test passed: authenticated run, four agents, Postgres persistence, redaction, exact-version approval, and duplicate-version guard.");
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
