import * as React from "react";
import { useTheme } from "../contexts/ThemeContext.jsx";
const PROTOCOL_INTEGRATION_MAP = {
  "REST API": [
    "OOTB REST Connector",
    "Custom REST Integration",
    "REST API Polling",
    "REST API Event-Based",
  ],
  "SCIM 2.0": [
    "OOTB SCIM Connector",
    "Custom SCIM Integration",
    "SCIM Provisioning",
  ],
  "SAML 2.0": [
    "OOTB SAML Connector",
    "SAML SSO Integration",
    "SAML Federation",
  ],
  "Graph API": [
    "OOTB Graph API Connector",
    "Custom Graph API Integration",
    "Microsoft Graph Provisioning",
  ],
  JDBC: [
    "OOTB JDBC Connector",
    "Custom JDBC Integration",
    "Database Table Sync",
    "Stored Procedure Integration",
  ],
  "RFC/BAPI": [
    "OOTB SAP RFC Connector",
    "Custom SAP BAPI Integration",
    "SAP Table Sync",
  ],
  "AWS SDK": [
    "OOTB AWS Connector",
    "Custom AWS SDK Integration",
    "AWS IAM Integration",
  ],
  "SOAP/Web Services": [
    "OOTB SOAP Connector",
    "Custom SOAP/Web Service Integration",
    "WSDL-Based Integration",
  ],
  LDAP: ["OOTB LDAP Connector", "Custom LDAP Integration", "Directory Sync"],
  "Active Directory (AD)": [
    "OOTB Active Directory Connector",
    "Custom AD Integration",
    "AD Group Sync",
    "AD User Provisioning",
  ],
  "Azure Active Directory (Azure AD)": [
    "OOTB Azure AD Connector",
    "Custom Azure AD Integration",
    "Azure AD Group Sync",
    "Azure AD User Provisioning",
    "Entra ID Integration",
  ],
};
const DEFAULT_INTEGRATIONS = [
  "OOTB Connector",
  "Custom Integration",
  "Custom REST Integration",
  "Custom SCIM Integration",
  "Custom LDAP Integration",
  "Custom JDBC Integration",
  "Custom SAP Integration",
];
const PROTOCOLS = [
  "REST API",
  "SCIM 2.0",
  "SAML 2.0",
  "Graph API",
  "JDBC",
  "RFC/BAPI",
  "AWS SDK",
  "SOAP/Web Services",
  "LDAP",
  "Active Directory (AD)",
  "Azure Active Directory (Azure AD)",
];
function ImportPage({ onClose, onImport }) {
  const csvInputRef = React.useRef(null);
  const [selectedCsv, setSelectedCsv] = React.useState(null);
  const selectCsv = (file) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      window.alert("Please choose a CSV file.");
      return;
    }
    setSelectedCsv(file);
  };
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const INPUT_STYLE = {
    width: "100%",
    background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "8px 12px",
    color: isDark ? "#e5e7eb" : "#0f172a",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };
  const [activeTab, setActiveTab] = React.useState(0);
  const [manualForm, setManualForm] = React.useState({
    name: "",
    department: "",
    owner: "",
    ownerEmail: "",
    businessOwner: "",
    businessOwnerEmail: "",
    protocol: "REST API",
    integration: "OOTB REST Connector",
    criticality: "medium",
  });
  const tabs = ["CSV Upload", "CMDB Sync", "Manual Entry"];
  return (
    <div className={"import-page"}>
      <div
        style={{
          background: isDark ? "#0d1424" : "#ffffff",
          border: isDark
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid #e2e8f0",
          borderRadius: 12,
          width: "100%",
          maxWidth: "100%",
          minHeight: 400,
          overflow: "auto",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: isDark ? "#fff" : "#0f172a",
            }}
          >
            {"Choose an Import Method"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            borderBottom: isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid #e2e8f0",
            padding: "0 24px",
          }}
        >
          {tabs.map((tab, i) => (
            <button
              type={"button"}
              data-ocid={`import.tab.${i + 1}`}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "10px 16px",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === i
                    ? "2px solid #6366f1"
                    : "2px solid transparent",
                color:
                  activeTab === i ? "#818cf8" : isDark ? "#6b7280" : "#64748b",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeTab === i ? 600 : 400,
              }}
              key={tab}
            >
              {tab}
            </button>
          ))}
        </div>
        <div
          style={{
            padding: 24,
          }}
        >
          {activeTab === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  border: isDark
                    ? "2px dashed rgba(255,255,255,0.12)"
                    : "2px dashed #cbd5e1",
                  borderRadius: 10,
                  padding: "40px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                role={"button"}
                tabIndex={0}
                aria-label={"Choose CSV file to upload"}
                onClick={() => csvInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    csvInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  selectCsv(e.dataTransfer.files[0]);
                }}
              >
                <input
                  ref={csvInputRef}
                  type={"file"}
                  accept={".csv,text/csv"}
                  hidden={true}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    selectCsv(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 12,
                    color: isDark ? "#cbd5e1" : "#0d263e",
                  }}
                >
                  <svg
                    width={36}
                    height={36}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={2}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                    aria-hidden={true}
                  >
                    <path d={"M12 16V3 M6 9l6-6 6 6 M3 16v5h18v-5"} />
                  </svg>
                </div>
                <div
                  style={{
                    color: isDark ? "#9ca3af" : "#64748b",
                    fontSize: 14,
                  }}
                >
                  {selectedCsv
                    ? selectedCsv.name
                    : "Choose a CSV file or drag it here"}
                </div>
                <div
                  style={{
                    color: isDark ? "#6b7280" : "#94a3b8",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {"or click to browse"}
                </div>
              </div>
              <button
                type={"button"}
                data-ocid={"import.csv_sample_button"}
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 6,
                  padding: "8px 16px",
                  color: "#818cf8",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {"⬇ Download Sample CSV"}
              </button>
            </div>
          )}
          {activeTab === 1 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div>
                <label
                  htmlFor={"cmdb-url"}
                  style={{
                    fontSize: 12,
                    color: isDark ? "#9ca3af" : "#64748b",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {"CMDB URL"}
                </label>
                <input
                  id={"cmdb-url"}
                  type={"text"}
                  style={INPUT_STYLE}
                  placeholder={"https://cmdb.company.com/api"}
                />
              </div>
              <div>
                <label
                  htmlFor={"cmdb-api-key"}
                  style={{
                    fontSize: 12,
                    color: isDark ? "#9ca3af" : "#64748b",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {"API Key"}
                </label>
                <input
                  id={"cmdb-api-key"}
                  type={"password"}
                  style={INPUT_STYLE}
                  placeholder={"Enter API key"}
                />
              </div>
              <div>
                <label
                  htmlFor={"cmdb-sync-scope"}
                  style={{
                    fontSize: 12,
                    color: isDark ? "#9ca3af" : "#64748b",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {"Sync Scope"}
                </label>
                <select id={"cmdb-sync-scope"} style={INPUT_STYLE}>
                  <option>{"All Applications"}</option>
                  <option>{"Critical Only"}</option>
                  <option>{"New Since Last Sync"}</option>
                </select>
              </div>
              <button
                type={"button"}
                data-ocid={"import.cmdb_sync_button"}
                style={{
                  background: "#6366f1",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 20px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                {"🔄 Sync Now"}
              </button>
            </div>
          )}
          {activeTab === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onImport(manualForm);
                onClose();
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {[
                "name",
                "department",
                "owner",
                "ownerEmail",
                "businessOwner",
                "businessOwnerEmail",
              ].map((field) => (
                <div key={field}>
                  <label
                    htmlFor={`manual-${field}`}
                    style={{
                      fontSize: 12,
                      color: isDark ? "#9ca3af" : "#64748b",
                      display: "block",
                      marginBottom: 4,
                      textTransform: "capitalize",
                    }}
                  >
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    id={`manual-${field}`}
                    data-ocid={`import.${field}_input`}
                    type={"text"}
                    style={INPUT_STYLE}
                    value={manualForm[field]}
                    onChange={(e) =>
                      setManualForm((p) => ({
                        ...p,
                        [field]: e.target.value,
                      }))
                    }
                    required={true}
                  />
                </div>
              ))}
              <div>
                <label
                  htmlFor={"manual-protocol"}
                  style={{
                    fontSize: 12,
                    color: isDark ? "#9ca3af" : "#64748b",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {"Protocol"}
                </label>
                <select
                  id={"manual-protocol"}
                  data-ocid={"import.protocol_select"}
                  style={INPUT_STYLE}
                  value={manualForm.protocol}
                  onChange={(e) => {
                    const newProtocol = e.target.value;
                    const integrations =
                      PROTOCOL_INTEGRATION_MAP[newProtocol] ??
                      DEFAULT_INTEGRATIONS;
                    setManualForm((p) => ({
                      ...p,
                      protocol: newProtocol,
                      integration: integrations[0],
                    }));
                  }}
                >
                  {PROTOCOLS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor={"manual-integration"}
                  style={{
                    fontSize: 12,
                    color: isDark ? "#9ca3af" : "#64748b",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {"Integration"}
                </label>
                <select
                  id={"manual-integration"}
                  data-ocid={"import.integration_select"}
                  style={INPUT_STYLE}
                  value={manualForm.integration}
                  onChange={(e) =>
                    setManualForm((p) => ({
                      ...p,
                      integration: e.target.value,
                    }))
                  }
                >
                  {(
                    PROTOCOL_INTEGRATION_MAP[manualForm.protocol] ??
                    DEFAULT_INTEGRATIONS
                  ).map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor={"manual-criticality"}
                  style={{
                    fontSize: 12,
                    color: isDark ? "#9ca3af" : "#64748b",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {"Criticality"}
                </label>
                <select
                  id={"manual-criticality"}
                  style={INPUT_STYLE}
                  value={manualForm.criticality}
                  onChange={(e) =>
                    setManualForm((p) => ({
                      ...p,
                      criticality: e.target.value,
                    }))
                  }
                >
                  <option value={"critical"}>{"Critical"}</option>
                  <option value={"high"}>{"High"}</option>
                  <option value={"medium"}>{"Medium"}</option>
                  <option value={"low"}>{"Low"}</option>
                </select>
              </div>
              <button
                type={"submit"}
                data-ocid={"import.submit_button"}
                style={{
                  background: "#6366f1",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 20px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                {"+ Add Application"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export {
  PROTOCOL_INTEGRATION_MAP,
  DEFAULT_INTEGRATIONS,
  PROTOCOLS,
  ImportPage,
};
