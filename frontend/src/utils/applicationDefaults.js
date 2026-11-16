import * as React from "react";
function buildEmptyInputs(attrs) {
  if (attrs.length > 0)
    return Object.fromEntries(attrs.map((a) => [a.name, ""]));
  return {
    username: "",
    email: "",
    department: "",
    role: "",
  };
}
const CONNECTOR_PREFILL_DEFAULTS = {
  "active-directory": {
    AD_HOST: "ldap://domain-controller.company.com",
    AD_PORT: "389",
    BASE_DN: "DC=company,DC=com",
    SEARCH_FILTER: "(sAMAccountName={0})",
  },
  adsi: {
    SEARCH_BASE: "OU=Users,DC=company,DC=com",
  },
  "microsoft-entra-id": {
    RESOURCE_URL: "https://graph.microsoft.com",
    SCOPES: "https://graph.microsoft.com/.default",
    GRANT_TYPE: "client_credentials",
  },
  "microsoft-teams": {
    RESOURCE_URL: "https://graph.microsoft.com",
    GRANT_TYPE: "client_credentials",
  },
  "sharepoint-graph-api": {
    RESOURCE_URL: "https://graph.microsoft.com/",
    GRANT_TYPE: "client_credentials",
  },
  ldap: {
    PORT: "389",
    USE_SSL: "No",
    SEARCH_FILTER: "(uid={0})",
  },
  openldap: {
    PORT: "389",
    USE_SSL: "No",
  },
  "rest-generic": {
    AUTH_TYPE: "Basic",
  },
  "custom-rest": {
    AUTH_TYPE: "Basic",
  },
  "scim-20-generic": {
    AUTH_TYPE: "OAuth2",
    SCIM_VERSION: "2.0",
  },
  "database-jdbc": {
    JDBC_DRIVER: "MySQL (com.mysql.cj.jdbc.Driver)",
    DRIVER_CLASS: "com.mysql.cj.jdbc.Driver",
  },
  "sap-rfc-bapi": {
    LANGUAGE: "EN",
    SYSTEM_NUMBER: "00",
    CLIENT: "100",
  },
  "sap-hana-jdbc": {
    DRIVER_CLASS: "com.sap.db.jdbc.Driver",
  },
  "sap-s4hana-rest": {
    GRANT_TYPE: "client_credentials",
  },
  "sap-concur-rest": {
    GRANT_TYPE: "client_credentials",
  },
  "okta-scim-oauth2": {
    SCOPE: "okta.users.read okta.groups.read",
    GRANT_TYPE: "client_credentials",
  },
  "okta-rest-token": {},
  "salesforce-rest-oauth2": {
    AUTH_TYPE: "OAuth2",
    GRANT_TYPE: "password",
  },
  "servicenow-rest": {
    AUTH_TYPE: "Basic",
    API_VERSION: "v2",
  },
  "workday-rest-oauth": {
    AUTH_TYPE: "OAuth2",
    TENANT_TYPE: "Production",
  },
  "workday-soap": {
    PASSWORD_TYPE: "Password",
  },
  "snowflake-rest-scim": {},
  "snowflake-jdbc": {
    DRIVER_CLASS: "net.snowflake.client.jdbc.SnowflakeDriver",
  },
  "aws-iam-sdk": {
    REGION: "us-east-1",
  },
  "aws-iam-identity-center": {
    REGION: "us-east-1",
  },
  "oracle-erp-rest": {},
  "oracle-erp-jdbc": {
    DRIVER_CLASS: "oracle.jdbc.OracleDriver",
  },
  "oracle-db-jdbc": {
    DRIVER_CLASS: "oracle.jdbc.OracleDriver",
  },
  "oracle-peoplesoft": {},
  "oracle-identity-manager": {},
  "oracle-unified-directory": {
    PORT: "389",
  },
  "ibm-db2-jdbc": {
    DRIVER_CLASS: "com.ibm.db2.jcc.DB2Driver",
  },
  "ibm-as400": {
    PORT: "449",
  },
  "ibm-racf": {
    PORT: "992",
    USE_TLS: "Yes",
  },
  "unix-linux-ssh": {
    PORT: "22",
    AUTH_TYPE: "Password",
  },
  "forgerock-ciam": {
    REALM: "/",
  },
  "ping-identity": {
    GRANT_TYPE: "client_credentials",
  },
  "saviynt-eic": {
    GRANT_TYPE: "password",
    TOKEN_URL: "/ECM/oauth/token",
    API_VERSION: "v5",
  },
  "saviynt-scf": {
    VERSION: "1.0",
  },
  "zoom-rest-oauth2": {
    BASE_URL: "https://api.zoom.us/v2",
  },
  "jira-rest-basic": {},
  "jira-rest-oauth": {},
  "confluence-rest-basic": {},
  "confluence-rest-oauth": {},
  "github-rest-token": {
    BASE_URL: "https://api.github.com",
  },
  "github-rest-oauth": {
    BASE_URL: "https://api.github.com",
  },
};
function buildDefaultParams(connector, _instanceType) {
  var _a2;
  const overrides = CONNECTOR_PREFILL_DEFAULTS[connector.id] ?? {};
  const result = {};
  for (const p of connector.params) {
    if (p.type === "password") continue;
    if (p.type === "select") {
      const val2 =
        overrides[p.key] ??
        p.defaultValue ??
        ((_a2 = p.options) == null ? void 0 : _a2[0]);
      if (val2) result[p.key] = val2;
      continue;
    }
    const val = p.defaultValue ?? overrides[p.key];
    if (val) result[p.key] = val;
  }
  return result;
}
export { buildEmptyInputs, CONNECTOR_PREFILL_DEFAULTS, buildDefaultParams };
