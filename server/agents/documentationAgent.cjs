function runDocumentationAgent({ applicationName, intake, analysis, mapping, validation, version }) {
  const mappingLines = mapping.mappings.length
    ? mapping.mappings.map((item) => `- \`${item.source}\` → \`${item.target}\` (${item.sampleType}, confidence ${item.confidence}; owner confirmation required)`).join("\n")
    : "- No field mappings proposed. Provide a sanitized sample before configuration.";
  const endpoints = [
    analysis.endpoints.accounts && `- Accounts: \`${analysis.endpoints.accounts.method} ${analysis.endpoints.accounts.path}\``,
    analysis.endpoints.entitlements && `- Entitlements: \`${analysis.endpoints.entitlements.method} ${analysis.endpoints.entitlements.path}\``,
  ].filter(Boolean).join("\n") || "- Endpoints require owner confirmation.";
  const warnings = [...intake.gaps, ...analysis.warnings, ...mapping.unresolved.map((field) => `Mapping unresolved: ${field}`), ...validation.errors];
  const runbook = [
    `# ${applicationName} connector handoff`,
    "",
    `Draft version: ${version}`,
    "Environment: non-production sandbox only",
    "",
    "## Connection",
    `- Base URL: ${intake.answers.baseUrl || "TBD"}`,
    `- Authentication pattern: ${intake.answers.authType || "TBD"}`,
    "- Credential values are not part of this document. Configure them through the approved secrets store.",
    "",
    "## Operations",
    endpoints,
    `- Pagination: ${analysis.pagination || "TBD"}`,
    "",
    "## Proposed field mappings",
    mappingLines,
    "",
    "## Validation and approval",
    `- Template checks: ${validation.status}`,
    "- Saviynt SME must approve this exact version before any sandbox integration action.",
    "- Compare imported accounts and entitlements with sanitized expected fixtures before handoff.",
    "",
    "## Open questions",
    warnings.length ? warnings.map((warning) => `- ${warning}`).join("\n") : "- No open questions were found by the guided checks; owner and SME confirmation is still required.",
  ].join("\n");
  return { agent: "documentation", status: "ready_for_review", runbook, openQuestions: warnings };
}

module.exports = { runDocumentationAgent };
