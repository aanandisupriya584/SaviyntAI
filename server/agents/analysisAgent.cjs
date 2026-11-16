function normalizePath(value) {
  return String(value || "").replace(/\/$/, "").toLowerCase();
}

function runAnalysisAgent(intake) {
  const openApi = intake.evidence.parsedOpenApi;
  const paths = openApi?.paths && typeof openApi.paths === "object" ? openApi.paths : {};
  const pathList = Object.entries(paths).flatMap(([path, methods]) =>
    Object.keys(methods || {}).map((method) => ({ path, method: method.toUpperCase() })),
  );
  const matchEndpoint = (provided, words) => {
    const target = normalizePath(provided);
    return pathList.find((item) => normalizePath(item.path) === target)
      || pathList.find((item) => words.some((word) => item.path.toLowerCase().includes(word)));
  };
  const account = matchEndpoint(intake.answers.users, ["user", "account", "worker"]);
  const entitlement = matchEndpoint(intake.answers.groups, ["group", "role", "entitlement"]);
  const securitySchemes = openApi?.components?.securitySchemes || openApi?.securityDefinitions || {};
  const authFromSpec = Object.values(securitySchemes).map((scheme) => scheme.type === "http"
    ? (scheme.scheme || "http")
    : (scheme.type || "unspecified"));
  const warnings = [];
  if (!intake.evidence.hasOpenApi) warnings.push("No OpenAPI JSON was provided; paths are based on owner answers only.");
  if (intake.evidence.hasOpenApi && !account) warnings.push("Could not match the account path to the OpenAPI document.");
  if (intake.evidence.hasOpenApi && intake.answers.groups && !entitlement) warnings.push("Could not match the entitlement path to the OpenAPI document.");
  if (!authFromSpec.length) warnings.push("Authentication was not confirmed by the API document.");
  return {
    agent: "analysis",
    status: warnings.length ? "review_required" : "ready_for_mapping",
    endpoints: {
      accounts: account || (intake.answers.users ? { path: intake.answers.users, method: "GET", source: "owner_answer" } : null),
      entitlements: entitlement || (intake.answers.groups ? { path: intake.answers.groups, method: "GET", source: "owner_answer" } : null),
    },
    authentication: { ownerAnswer: intake.answers.authType, documentSchemes: authFromSpec },
    pagination: intake.answers.pagination,
    warnings,
  };
}

module.exports = { runAnalysisAgent };
