const { runIntakeAgent } = require("./intakeAgent.cjs");
const { runAnalysisAgent } = require("./analysisAgent.cjs");
const { runMappingAgent } = require("./mappingAgent.cjs");
const { runDocumentationAgent } = require("./documentationAgent.cjs");

function validateDraft(intake, analysis, mapping) {
  const errors = [...intake.validationErrors];
  try {
    const url = new URL(intake.answers.baseUrl);
    if (url.protocol !== "https:") errors.push("Base URL must use HTTPS.");
    if (url.username || url.password) errors.push("Base URL must not contain credentials.");
    if (url.search) errors.push("Base URL must not contain query parameters or tokens.");
  } catch { errors.push("A valid HTTPS base URL is required."); }
  if (!analysis.endpoints.accounts?.path) errors.push("An account import endpoint is required.");
  for (const endpoint of Object.values(analysis.endpoints)) {
    if (!endpoint) continue;
    if (!String(endpoint.path).startsWith("/")) errors.push(`Endpoint path must be relative: ${endpoint.path}`);
    if (/https?:\/\/|[?&](token|key|secret|password)=/i.test(endpoint.path)) errors.push("Endpoint paths cannot contain hostnames or credentials.");
  }
  if (!mapping.mappings.some((item) => item.target === "accountId")) errors.push("A stable account ID mapping is required before configuration can be approved.");
  return { status: errors.length ? "failed" : "passed", errors, checkedAt: new Date().toISOString() };
}

function makeConnectorConfig(applicationName, intake, analysis, mapping, version) {
  return {
    name: `${applicationName} REST connector`,
    version,
    protocol: "REST",
    baseUrl: intake.answers.baseUrl,
    authentication: intake.answers.authType,
    secretReference: "SET_IN_APPROVED_SECRETS_STORE",
    operations: Object.entries(analysis.endpoints).filter(([, endpoint]) => endpoint).map(([name, endpoint]) => ({ name, method: endpoint.method, path: endpoint.path })),
    pagination: analysis.pagination,
    mappings: mapping.mappings,
    requiresOwnerConfirmation: true,
    status: "draft",
  };
}

function runConnectorAgents(input) {
  const applicationName = String(input?.applicationName || "").trim();
  if (!applicationName || applicationName.length > 120) throw new Error("Application name is required and must be under 120 characters.");
  const version = Number.isInteger(input.version) && input.version > 0 ? input.version : 1;
  const intake = runIntakeAgent(input);
  const analysis = runAnalysisAgent(intake);
  const mapping = runMappingAgent(intake);
  const validation = validateDraft(intake, analysis, mapping);
  const connectorConfig = makeConnectorConfig(applicationName, intake, analysis, mapping, version);
  const documentation = runDocumentationAgent({ applicationName, intake, analysis, mapping, validation, version });
  return {
    sequence: ["intake", "analysis", "mapping", "configuration_validation", "documentation"],
    status: validation.status === "passed" ? "ready_for_sme_review" : "needs_review",
    version,
    safeAnswers: { ...intake.answers, hasOpenApi: intake.evidence.hasOpenApi, hasSample: intake.evidence.hasSample },
    agents: { intake: { ...intake, evidence: { hasOpenApi: intake.evidence.hasOpenApi, hasSample: intake.evidence.hasSample } }, analysis, mapping, documentation },
    validation,
    connectorConfig,
  };
}

module.exports = { runConnectorAgents, validateDraft };
