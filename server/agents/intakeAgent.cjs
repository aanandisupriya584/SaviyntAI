const SECRET_KEY = /(password|passwd|secret|token|api[_-]?key|authorization|credential)/i;
const MAX_EVIDENCE_CHARS = 250_000;

function redactText(value) {
  return String(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\b(?:\+?\d[\d ().-]{7,}\d)\b/g, "[redacted-phone]")
    .replace(/\bBearer\s+[A-Z0-9._~+/-]+=*/gi, "Bearer [redacted]");
}

function redactValue(value) {
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [
      key,
      SECRET_KEY.test(key) ? "[redacted-secret]" : redactValue(child),
    ]));
  }
  return typeof value === "string" ? redactText(value) : value;
}

function parseEvidence(value, label) {
  if (!value) return { parsed: null, error: null };
  if (typeof value !== "string" || value.length > MAX_EVIDENCE_CHARS) {
    return { parsed: null, error: `${label} must be text under 250 KB.` };
  }
  try {
    return { parsed: JSON.parse(value), error: null };
  } catch {
    return { parsed: null, error: `${label} must be valid JSON for this pilot.` };
  }
}

function safeBaseUrl(value) {
  try {
    const url = new URL(value);
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function safeEndpoint(value) {
  const raw = String(value || "");
  try {
    if (/^https?:\/\//i.test(raw)) return new URL(raw).pathname || "/";
  } catch { return ""; }
  return raw.split(/[?#]/, 1)[0];
}

function runIntakeAgent(input) {
  const answers = input?.answers || {};
  const apiEvidence = parseEvidence(answers.apiSpec, "OpenAPI document");
  const sampleEvidence = parseEvidence(answers.sampleData, "Sample response");
  const gaps = [];
  const validationErrors = [];
  if (!input?.applicationName?.trim()) gaps.push("Application name is missing.");
  if (!answers.baseUrl) gaps.push("API base URL is missing.");
  if (!answers.authType || /not sure|other/i.test(answers.authType)) gaps.push("Confirm the authentication pattern with the application owner.");
  if (!answers.users) gaps.push("Account endpoint is missing.");
  if (!answers.contact) gaps.push("Name a technical contact to resolve open questions.");
  try {
    const base = new URL(answers.baseUrl || "");
    if (base.protocol !== "https:") validationErrors.push("Base URL must use HTTPS.");
    if (base.username || base.password) validationErrors.push("Base URL must not contain credentials.");
    if (base.search || base.hash) validationErrors.push("Base URL must not contain query parameters or tokens.");
  } catch { validationErrors.push("A valid HTTPS base URL is required."); }
  for (const endpoint of [answers.users, answers.groups].filter(Boolean)) {
    if (!String(endpoint).startsWith("/") || String(endpoint).startsWith("//")) validationErrors.push("Endpoint paths must be relative paths beginning with one slash.");
    if (/[?#]/.test(String(endpoint))) validationErrors.push("Endpoint paths must not contain query parameters or fragments.");
  }
  if (!answers.apiSpec) gaps.push("OpenAPI evidence was not provided; endpoint details need owner confirmation.");
  if (!answers.sampleData) gaps.push("Sample data was not provided; field mappings cannot be confirmed.");
  if (apiEvidence.error) gaps.push(apiEvidence.error);
  if (sampleEvidence.error) gaps.push(sampleEvidence.error);

  return {
    agent: "intake",
    status: gaps.some((gap) => /missing|must be valid|under 250/i.test(gap)) ? "needs_information" : "ready_for_analysis",
    owner: answers.contact || "Application owner",
    gaps,
    validationErrors,
    evidence: {
      hasOpenApi: Boolean(apiEvidence.parsed),
      hasSample: Boolean(sampleEvidence.parsed),
      sanitizedSample: sampleEvidence.parsed ? redactValue(sampleEvidence.parsed) : null,
      parsedOpenApi: apiEvidence.parsed ? redactValue(apiEvidence.parsed) : null,
    },
    answers: {
      baseUrl: safeBaseUrl(answers.baseUrl),
      authType: ["OAuth 2.0 client credentials", "API key", "Basic authentication", "No authentication", "Other / not sure"].includes(answers.authType) ? answers.authType : "Other / not sure",
      users: safeEndpoint(answers.users),
      groups: safeEndpoint(answers.groups),
      pagination: answers.pagination || "Not sure",
      provisioning: answers.provisioning || "Not sure",
      contact: answers.contact || "",
    },
  };
}

module.exports = { runIntakeAgent, redactValue, redactText };
