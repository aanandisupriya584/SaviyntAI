const TARGETS = [
  ["accountId", ["id", "accountid", "userid", "employeeid", "uuid"]],
  ["username", ["username", "login", "userprincipalname", "upn"]],
  ["email", ["email", "emailaddress", "mail"]],
  ["firstName", ["firstname", "givenname", "given_name"]],
  ["lastName", ["lastname", "surname", "familyname", "family_name"]],
  ["displayName", ["displayname", "fullname", "name"]],
  ["active", ["active", "enabled", "isenabled", "status"]],
];

function flatten(value, prefix = "", out = []) {
  if (Array.isArray(value)) {
    if (value.length) flatten(value[0], `${prefix}[0]`, out);
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
  } else if (prefix) out.push({ path: prefix, key: prefix.split(".").at(-1).replace(/\[\d+\]$/, ""), type: value === null ? "null" : typeof value });
  return out;
}

function runMappingAgent(intake) {
  const leaves = flatten(intake.evidence.sanitizedSample);
  const mappings = TARGETS.map(([target, aliases]) => {
    const match = leaves.find((leaf) => aliases.includes(leaf.key.toLowerCase().replace(/[^a-z0-9_]/g, "")));
    return match ? {
      source: match.path,
      target,
      sampleType: match.type,
      confidence: aliases.includes(match.key.toLowerCase()) ? 0.92 : 0.72,
      ownerConfirmationRequired: true,
    } : null;
  }).filter(Boolean);
  const unresolved = TARGETS.map(([target]) => target).filter((target) => !mappings.some((item) => item.target === target));
  return {
    agent: "mapping",
    status: mappings.some((item) => item.target === "accountId") ? "review_required" : "blocked",
    mappings,
    unresolved,
    notice: intake.evidence.hasSample
      ? "Only field names and types were analyzed; sample values are withheld from the output. Confirm every mapping with the application owner."
      : "No sample was provided. Add sanitized sample data before relying on field mapping proposals.",
  };
}

module.exports = { runMappingAgent, flatten };
