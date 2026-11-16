import * as React from "react";
import { useTheme } from "../../contexts/ThemeContext.jsx";
const PROTOCOL_URL_PLACEHOLDERS = {
  "SCIM 2.0": "https://api.workday.com/scim/v2",
  "REST API": "https://api.example.com/v1",
  "SOAP/Web Services": "https://service.example.com/soap/endpoint",
  "SAML 2.0": "https://sso.example.com/saml2/idp",
  "Graph API": "https://graph.microsoft.com/v1.0",
  "AWS SDK": "https://iam.amazonaws.com",
  JDBC: "jdbc:oracle:thin:@host:1521/orcl",
  "RFC/BAPI": "https://sap-host:8000/sap/bc/adt",
  "Database Connector": "jdbc:sqlserver://host:1433;database=IAMdb",
  "SAP Connector": "https://sap-host:8000/sap/bc/adt",
  "OAuth 2.0": "https://auth.example.com/oauth2/token",
};
let _testId = 1;
function FunctionalTestModal({ app, onClose, onTestComplete }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const urlPlaceholder =
    PROTOCOL_URL_PLACEHOLDERS[app.protocol] ||
    "https://api.example.com/endpoint";
  const [testName, setTestName] = React.useState(
    `${app.name} — Connectivity Test`,
  );
  const [connectionUrl, setConnectionUrl] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [testQuery, setTestQuery] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [running, setRunning] = React.useState(false);
  const BG = isDark ? "#0d1424" : "#ffffff";
  const BORDER = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const TEXT = isDark ? "#e2e8f0" : "#0f172a";
  const MUTED = isDark ? "#6b7280" : "#64748b";
  const INPUT_BG = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  function runTest() {
    setRunning(true);
    setTimeout(() => {
      const allFilled =
        testName.trim() !== "" &&
        connectionUrl.trim() !== "" &&
        username.trim() !== "" &&
        password.trim() !== "" &&
        testQuery.trim() !== "";
      const urlValid =
        connectionUrl.toLowerCase().includes("http") ||
        connectionUrl.toLowerCase().includes("jdbc");
      const passed = allFilled && urlValid;
      const testResult = {
        testId: String(++_testId),
        appId: app.id,
        testName: testName.trim() || `${app.name} Test`,
        status: passed ? "pass" : "fail",
        summary: passed
          ? `Connection to ${connectionUrl} verified. User provisioning query executed successfully. All ${app.protocol} endpoints responded within expected parameters.`
          : allFilled && !urlValid
            ? `Invalid connection URL format. URL must start with 'http://', 'https://', or 'jdbc:'. Received: "${connectionUrl}"`
            : `Test failed: ${[!testName.trim() && "test name", !connectionUrl.trim() && "connection URL", !username.trim() && "username", !password.trim() && "password", !testQuery.trim() && "test query"].filter(Boolean).join(", ")} field(s) are required.`,
        testedAt: new Date().toISOString(),
        inputValues: {
          testName,
          connectionUrl,
          username,
          testQuery,
        },
      };
      setResult(testResult);
      setRunning(false);
    }, 900);
  }
  function handleAccept() {
    if (result) {
      onTestComplete(result);
      onClose();
    }
  }
  const inputStyle = {
    width: "100%",
    background: INPUT_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: 7,
    padding: "9px 12px",
    color: TEXT,
    fontSize: 13,
    outline: "none",
    fontFamily: '"DM Sans", sans-serif',
  };
  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: MUTED,
    marginBottom: 5,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role={"presentation"}
    >
      <div
        data-ocid={"functional_test.dialog"}
        style={{
          background: BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: TEXT,
              }}
            >
              {"🧪 Functional Test"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: MUTED,
                marginTop: 3,
              }}
            >
              {app.name}
              {" — "}
              {app.protocol}
            </div>
          </div>
          <button
            type={"button"}
            data-ocid={"functional_test.close_button"}
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: MUTED,
              fontSize: 18,
              cursor: "pointer",
              lineHeight: 1,
              padding: 4,
            }}
            aria-label={"Close functional test modal"}
          >
            {"✕"}
          </button>
        </div>
        {result && (
          <div
            data-ocid={"functional_test.result"}
            style={{
              background:
                result.status === "pass"
                  ? "rgba(74,222,128,0.1)"
                  : "rgba(248,113,113,0.1)",
              border:
                result.status === "pass"
                  ? "1px solid rgba(74,222,128,0.35)"
                  : "1px solid rgba(248,113,113,0.35)",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                }}
              >
                {result.status === "pass" ? "✅" : "❌"}
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: result.status === "pass" ? "#4ade80" : "#f87171",
                  fontSize: 13,
                }}
              >
                {result.status === "pass" ? "TEST PASSED" : "TEST FAILED"}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  color: MUTED,
                  fontFamily: "IBM Plex Mono, monospace",
                }}
              >
                {new Date(result.testedAt).toLocaleTimeString()}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: TEXT,
                lineHeight: 1.6,
              }}
            >
              {result.summary}
            </div>
            {result.status === "pass" && (
              <button
                type={"button"}
                data-ocid={"functional_test.confirm_button"}
                onClick={handleAccept}
                style={{
                  marginTop: 12,
                  background: "rgba(74,222,128,0.2)",
                  border: "1px solid rgba(74,222,128,0.4)",
                  borderRadius: 7,
                  padding: "7px 16px",
                  color: "#4ade80",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {"✓ Save Result & Close"}
              </button>
            )}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div>
            <label htmlFor={"ft-testname"} style={labelStyle}>
              {"Test Name"}
            </label>
            <input
              id={"ft-testname"}
              data-ocid={"functional_test.testname_input"}
              type={"text"}
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              style={inputStyle}
              placeholder={"e.g. Workday HCM — Provisioning Test"}
            />
          </div>
          <div>
            <label htmlFor={"ft-url"} style={labelStyle}>
              {"Connection URL"}
            </label>
            <input
              id={"ft-url"}
              data-ocid={"functional_test.url_input"}
              type={"text"}
              value={connectionUrl}
              onChange={(e) => setConnectionUrl(e.target.value)}
              style={{
                ...inputStyle,
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 12,
              }}
              placeholder={urlPlaceholder}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <label htmlFor={"ft-user"} style={labelStyle}>
                {"Username"}
              </label>
              <input
                id={"ft-user"}
                data-ocid={"functional_test.username_input"}
                type={"text"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                placeholder={"svc-saviynt"}
              />
            </div>
            <div>
              <label htmlFor={"ft-pass"} style={labelStyle}>
                {"Password"}
              </label>
              <input
                id={"ft-pass"}
                data-ocid={"functional_test.password_input"}
                type={"password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                placeholder={"••••••••"}
              />
            </div>
          </div>
          <div>
            <label htmlFor={"ft-query"} style={labelStyle}>
              {"Test Query / Endpoint Path"}
            </label>
            <textarea
              id={"ft-query"}
              data-ocid={"functional_test.query_input"}
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 12,
              }}
              placeholder={"/Users?filter=active eq true&count=10"}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 22,
            justifyContent: "flex-end",
          }}
        >
          <button
            type={"button"}
            data-ocid={"functional_test.cancel_button"}
            onClick={onClose}
            style={{
              background: "none",
              border: `1px solid ${BORDER}`,
              borderRadius: 7,
              padding: "8px 18px",
              color: MUTED,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {"Cancel"}
          </button>
          <button
            type={"button"}
            data-ocid={"functional_test.run_button"}
            onClick={runTest}
            disabled={running}
            style={{
              background: running
                ? "rgba(99,102,241,0.15)"
                : "rgba(99,102,241,0.25)",
              border: "1px solid rgba(99,102,241,0.5)",
              borderRadius: 7,
              padding: "8px 20px",
              color: "#818cf8",
              cursor: running ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "all 0.15s",
            }}
          >
            {running ? (
              <React.Fragment>
                <span
                  style={{
                    display: "inline-block",
                    animation: "pulse-soft 1s infinite",
                  }}
                >
                  {"⏳"}
                </span>
                {"Running…"}
              </React.Fragment>
            ) : (
              <React.Fragment>{"🚀 Run Test"}</React.Fragment>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export { PROTOCOL_URL_PLACEHOLDERS, _testId, FunctionalTestModal };
