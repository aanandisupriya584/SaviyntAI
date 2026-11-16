const test = require("node:test");
const assert = require("node:assert/strict");
const { runConnectorAgents } = require("../server/agents/index.cjs");

const answers = {
  baseUrl: "https://api.example.test/v1",
  authType: "OAuth 2.0 client credentials",
  users: "/users",
  groups: "/groups",
  pagination: "Cursor / next link",
  provisioning: "Read accounts and groups",
  contact: "owner@example.test",
  apiSpec: JSON.stringify({
    openapi: "3.0.0",
    paths: { "/users": { get: {} }, "/groups": { get: {} } },
    components: { securitySchemes: { oauth: { type: "oauth2" } } },
  }),
  sampleData: JSON.stringify({ users: [{ id: "user-123", email: "person@example.test", userName: "person", active: true, password: "do-not-store" }] }),
};

test("runs the four agents in a fixed order and creates a passing review draft", () => {
  const result = runConnectorAgents({ appId: "app-1", applicationName: "Example", version: 3, answers });
  assert.deepEqual(result.sequence, ["intake", "analysis", "mapping", "configuration_validation", "documentation"]);
  assert.equal(result.status, "ready_for_sme_review");
  assert.equal(result.validation.status, "passed");
  assert.equal(result.connectorConfig.version, 3);
  assert.equal(result.agents.analysis.endpoints.accounts.path, "/users");
  assert.ok(result.agents.mapping.mappings.some((mapping) => mapping.target === "accountId" && mapping.source === "users[0].id"));
  assert.match(result.agents.documentation.runbook, /sandbox only/i);
  assert.equal(JSON.stringify(result).includes("do-not-store"), false);
  assert.equal(JSON.stringify(result).includes("person@example.test"), false);
});

test("redacts secret fields and personal values before mapping and persistence outputs", () => {
  const result = runConnectorAgents({ applicationName: "Example", version: 1, answers });
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes("user-123"), false);
  assert.equal(serialized.includes("do-not-store"), false);
  assert.equal(serialized.includes("person@example.test"), false);
  assert.equal(result.safeAnswers.sampleData, undefined);
  assert.equal(result.safeAnswers.apiSpec, undefined);
});

test("blocks unsafe URLs, endpoint paths, and missing stable account identifiers", () => {
  const result = runConnectorAgents({
    applicationName: "Example",
    answers: {
      ...answers,
      baseUrl: "https://user:password@api.example.test/v1?token=hidden",
      users: "https://api.example.test/users?api_key=hidden",
      sampleData: JSON.stringify({ users: [{ email: "redacted@example.test" }] }),
    },
  });
  assert.equal(result.validation.status, "failed");
  assert.ok(result.validation.errors.some((error) => /credentials/i.test(error)));
  assert.ok(result.validation.errors.some((error) => /query/i.test(error)));
  assert.ok(result.validation.errors.some((error) => /stable account ID/i.test(error)));
  assert.equal(JSON.stringify(result).includes("password"), false);
  assert.equal(JSON.stringify(result).includes("hidden"), false);
});

test("rejects a missing application name", () => {
  assert.throws(() => runConnectorAgents({ answers }), /Application name is required/);
});
