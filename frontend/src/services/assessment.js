import * as React from "react";
const OOTB_CONNECTORS = {
  workday: {
    connectorName: "Workday Connector",
    effortEstimate: "2-4 hours",
  },
  salesforce: {
    connectorName: "Salesforce Connector",
    effortEstimate: "4-8 hours",
  },
  sap: {
    connectorName: "SAP GRC Connector",
    effortEstimate: "4-8 hours",
  },
  servicenow: {
    connectorName: "ServiceNow Connector",
    effortEstimate: "2-4 hours",
  },
  aws: {
    connectorName: "AWS Connector",
    effortEstimate: "4-8 hours",
  },
  okta: {
    connectorName: "Okta Connector",
    effortEstimate: "2-4 hours",
  },
  github: {
    connectorName: "GitHub Connector",
    effortEstimate: "4-8 hours",
  },
  jira: {
    connectorName: "Atlassian Connector",
    effortEstimate: "4-8 hours",
  },
  confluence: {
    connectorName: "Atlassian Connector",
    effortEstimate: "4-8 hours",
  },
  sharepoint: {
    connectorName: "Microsoft 365 Connector",
    effortEstimate: "4-8 hours",
  },
  oracle: {
    connectorName: "Oracle EBS Connector",
    effortEstimate: "4-8 hours",
  },
};
const COMPLEX_PROTOCOLS = [
  "JDBC",
  "RFC/BAPI",
  "SAP Connector",
  "Database Connector",
];
const MEDIUM_PROTOCOLS = ["SOAP/Web Services", "Webhook", "AWS SDK", "LDAP"];
const SIMPLE_PROTOCOLS = [
  "REST API",
  "OAuth 2.0",
  "SCIM 2.0",
  "Graph API",
  "SAML 2.0",
];
function getAppType(protocol) {
  const map = {
    "SCIM 2.0": "SaaS/Cloud",
    LDAP: "On-Premise Directory",
    JDBC: "Legacy/On-Premise",
    "Database Connector": "Legacy/On-Premise",
    "SAP Connector": "Enterprise/On-Premise",
    "RFC/BAPI": "Enterprise/On-Premise",
    "AWS SDK": "Cloud-Native/IaaS",
    "SAML 2.0": "SaaS/Federated Identity",
    Webhook: "SaaS/Event-Driven",
    "SOAP/Web Services": "COTS",
  };
  return map[protocol] ?? "Hybrid/Unknown";
}
const COMPLEXITY_FACTORS = {
  OOTB: [
    "Pre-built Saviynt connector available",
    "Connector supports user lifecycle management",
    "Standard attribute mapping included",
    "Certification campaigns supported out-of-the-box",
  ],
  "Custom-Simple": [
    "REST API with standard OAuth 2.0 flow",
    "JSON response parsing straightforward",
    "Standard user/group endpoints available",
    "Pagination support needed for large datasets",
  ],
  "Custom-Medium": [
    "SOAP WSDL parsing and mapping required",
    "Session management and token refresh handling",
    "Field-level transformation logic needed",
    "Error handling for fault responses required",
  ],
  "Custom-Complex": [
    "Custom RFC/BAPI function module development required",
    "Complex role hierarchy mapping needed",
    "Authorization object extraction requires specialized expertise",
    "Performance testing required for large user volumes",
  ],
};
function getNextSteps(pattern, connectorName, appName) {
  switch (pattern) {
    case "OOTB":
      return [
        `1. Download and configure the ${connectorName} from Saviynt marketplace`,
        "2. Configure connection parameters and test connectivity",
        "3. Map user attributes and run initial reconciliation",
      ];
    case "Custom-Simple":
      return [
        "1. Create custom connector configuration in Saviynt",
        "2. Configure REST endpoints and OAuth 2.0 authentication",
        "3. Define attribute mappings and test provisioning workflow",
      ];
    case "Custom-Medium":
      return [
        "1. Engage Saviynt Professional Services for connector development",
        "2. Document API specifications and integration requirements",
        "3. Implement and test connector in staging environment",
      ];
    case "Custom-Complex":
      return [
        `1. Engage Saviynt Professional Services and ${appName} vendor support`,
        "2. Design connector architecture with security and performance requirements",
        "3. Conduct phased implementation with UAT and performance testing",
      ];
  }
}
function runAIAssessment(app) {
  const nameLower = app.name.toLowerCase();
  for (const [key, val] of Object.entries(OOTB_CONNECTORS)) {
    if (nameLower.includes(key)) {
      return {
        appType: getAppType(app.protocol),
        integrationPattern: "OOTB",
        connectorName: val.connectorName,
        effortEstimate: val.effortEstimate,
        complexityFactors: COMPLEXITY_FACTORS.OOTB,
        nextSteps: getNextSteps("OOTB", val.connectorName, app.name),
        assessedAt: new Date().toISOString(),
      };
    }
  }
  let pattern;
  let effortEstimate;
  if (COMPLEX_PROTOCOLS.includes(app.protocol)) {
    pattern = "Custom-Complex";
    effortEstimate = "8-16 weeks";
  } else if (MEDIUM_PROTOCOLS.includes(app.protocol)) {
    pattern = "Custom-Medium";
    effortEstimate = "3-6 weeks";
  } else if (SIMPLE_PROTOCOLS.includes(app.protocol)) {
    pattern = "Custom-Simple";
    effortEstimate = "1-2 weeks";
  } else {
    pattern = "Custom-Medium";
    effortEstimate = "3-6 weeks";
  }
  return {
    appType: getAppType(app.protocol),
    integrationPattern: pattern,
    connectorName: `${app.name} Custom Connector`,
    effortEstimate,
    complexityFactors: COMPLEXITY_FACTORS[pattern],
    nextSteps: getNextSteps(pattern, `${app.name} Custom Connector`, app.name),
    assessedAt: new Date().toISOString(),
  };
}
function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
async function simulateConnectionTest(params, connector) {
  var _a2, _b2, _c2, _d2, _e2;
  const latency = Math.floor(Math.random() * 1200) + 800;
  await new Promise((resolve) => setTimeout(resolve, latency));
  if (!connector) {
    return {
      success: false,
      latency,
      message: "No connector selected",
      details: ["Select a connector / driver type before testing."],
    };
  }
  const failures = [];
  for (const p of connector.params) {
    if (p.optional) continue;
    const val = params[p.key];
    if (!val || val.trim() === "") {
      failures.push(`Required field "${p.label}" is empty.`);
    }
  }
  for (const p of connector.params) {
    if (p.type !== "url") continue;
    const val = params[p.key];
    if (val && val.trim() !== "" && !isValidUrl(val)) {
      failures.push(`"${p.label}" must be a valid HTTPS URL (got: ${val}).`);
    }
  }
  if (failures.length > 0) {
    return {
      success: false,
      latency,
      message: `Connection failed — ${failures.length} issue${failures.length > 1 ? "s" : ""} found`,
      details: failures,
    };
  }
  if (connector.id === "saviynt-eic") {
    const saviyntUrl =
      ((_a2 = params.SAVIYNT_URL) == null ? void 0 : _a2.trim()) ?? "";
    const username =
      ((_b2 = params.USERNAME) == null ? void 0 : _b2.trim()) ?? "";
    const password =
      ((_c2 = params.PASSWORD) == null ? void 0 : _c2.trim()) ?? "";
    const tokenUrl =
      ((_d2 = params.TOKEN_URL) == null ? void 0 : _d2.trim()) ??
      "/ECM/oauth/token";
    const apiVersion =
      ((_e2 = params.API_VERSION) == null ? void 0 : _e2.trim()) ?? "v5";
    if (saviyntUrl && !isValidUrl(saviyntUrl)) {
      failures.push(
        `"Saviynt Instance URL" must be a valid HTTPS URL (got: ${saviyntUrl}).`,
      );
    }
    if (!username) failures.push('"Service Account Username" is required.');
    if (!password) failures.push('"Service Account Password" is required.');
    if (tokenUrl && !tokenUrl.startsWith("/")) {
      failures.push(
        `"Token Endpoint Path" must start with "/" (got: ${tokenUrl}).`,
      );
    }
    if (apiVersion && !["v3", "v4", "v5"].includes(apiVersion)) {
      failures.push(
        `"API Version" must be one of v3, v4, v5 (got: ${apiVersion}).`,
      );
    }
    if (failures.length > 0) {
      return {
        success: false,
        latency,
        message: `Saviynt EIC validation failed — ${failures.length} issue${failures.length > 1 ? "s" : ""} found`,
        details: failures,
      };
    }
    return {
      success: true,
      latency,
      message: `Saviynt EIC connection validated — ready to push apps to ${saviyntUrl || "instance"}`,
    };
  }
  const connectorHash = connector.id
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  if (connectorHash % 7 === 0) {
    return {
      success: false,
      latency,
      message: "Connection timed out — remote host did not respond",
      details: [
        "Verify the target hostname is reachable from this network.",
        "Ensure the service account has network-level access.",
        "Check firewall rules allow outbound HTTPS on port 443.",
      ],
    };
  }
  return {
    success: true,
    latency,
    message: `Connected successfully via ${connector.label}`,
  };
}
export {
  OOTB_CONNECTORS,
  COMPLEX_PROTOCOLS,
  MEDIUM_PROTOCOLS,
  SIMPLE_PROTOCOLS,
  getAppType,
  COMPLEXITY_FACTORS,
  getNextSteps,
  runAIAssessment,
  isValidUrl,
  simulateConnectionTest,
};
