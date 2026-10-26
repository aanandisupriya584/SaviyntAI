import * as React from "react";
function CustomIntegrationEndpoints({
  isDbDriver,
  operations,
  httpMethods,
  params,
  setParams,
  isDark,
  cardBg,
  border: _border,
  textColor,
  mutedColor,
  dimColor,
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [testResults, setTestResults] = React.useState({});
  const [testingAll, setTestingAll] = React.useState(false);
  const [testProgress, setTestProgress] = React.useState(null);
  const READ_OPS = ["search_user", "search_roles", "search_groups"];
  const readOps = operations.filter((op) => READ_OPS.includes(op.key));
  const writeOps = operations.filter((op) => !READ_OPS.includes(op.key));
  async function testEndpoint(op) {
    var _a2;
    const url =
      (_a2 = params[`endpoint_${op.key}`]) == null ? void 0 : _a2.trim();
    const method = params[`method_${op.key}`] ?? "GET";
    if (!url)
      return {
        status: "error",
        code: "No URL",
      };
    try {
      const res = await fetch("/api/saviynt/test-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          method,
        }),
      });
      if (!res.ok) {
        return {
          status: "error",
          code: `Server ${res.status}`,
        };
      }
      const json = await res.json();
      if (json.success) {
        const code = json.status ? String(json.status) : "OK";
        return {
          status: "ok",
          code,
        };
      }
      return {
        status: "error",
        code: json.status
          ? `${json.status} ${json.statusText ?? ""}`.trim()
          : "Error",
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        status: "error",
        code: msg.toLowerCase().includes("failed to fetch")
          ? "Server offline"
          : "Network Error",
      };
    }
  }
  async function handleTestAll() {
    const apiOps = operations.filter((op) => {
      var _a2;
      return !!((_a2 = params[`endpoint_${op.key}`]) == null
        ? void 0
        : _a2.trim());
    });
    if (apiOps.length === 0) return;
    setTestingAll(true);
    setTestProgress({
      done: 0,
      total: apiOps.length,
    });
    const next = {};
    for (const op of apiOps) {
      next[op.key] = {
        status: "testing",
      };
      setTestResults((prev) => ({
        ...prev,
        [op.key]: {
          status: "testing",
        },
      }));
    }
    let done = 0;
    for (const op of apiOps) {
      const result = await testEndpoint(op);
      done++;
      setTestProgress({
        done,
        total: apiOps.length,
      });
      setTestResults((prev) => ({
        ...prev,
        [op.key]: {
          status: result.status,
          code: result.code,
        },
      }));
    }
    setTestingAll(false);
    setTestProgress(null);
  }
  const INPUT_BASE = {
    width: "100%",
    padding: "7px 10px",
    borderRadius: 6,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}`,
    background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
    color: textColor,
    fontSize: 12,
    fontFamily: "IBM Plex Mono, monospace",
    outline: "none",
    boxSizing: "border-box",
  };
  const SELECT_BASE = {
    ...INPUT_BASE,
    cursor: "pointer",
    minWidth: 90,
    padding: "7px 8px",
  };
  function GroupHeader({ icon, label, color }) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 0 4px",
          marginBottom: 6,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
        }}
      >
        <span
          style={{
            fontSize: 13,
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {label}
        </span>
      </div>
    );
  }
  function renderApiGroup(ops) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "160px 1fr 110px",
          gap: "6px 10px",
          alignItems: "center",
        }}
      >
        {["Operation", "Endpoint URL", "HTTP Method"].map((h) => (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: dimColor,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
            key={h}
          >
            {h}
          </span>
        ))}
        <div
          style={{
            gridColumn: "1 / -1",
            height: 1,
            background: isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0",
            marginBottom: 2,
          }}
        />
        {ops.map((op, idx) => {
          const urlKey = `endpoint_${op.key}`;
          const methodKey = `method_${op.key}`;
          const tr = testResults[op.key];
          const rowBg =
            idx % 2 === 0
              ? isDark
                ? "rgba(255,255,255,0.015)"
                : "rgba(0,0,0,0.015)"
              : "transparent";
          return (
            <React.Fragment>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: textColor,
                  padding: "6px 8px",
                  borderRadius: "6px 0 0 6px",
                  background: rowBg,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                key={`label-${op.key}`}
              >
                {op.label}
                {tr && (
                  <span
                    title={tr.code}
                    style={{
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 4,
                      fontWeight: 700,
                      background:
                        tr.status === "testing"
                          ? "rgba(99,102,241,0.12)"
                          : tr.status === "ok"
                            ? "rgba(74,222,128,0.13)"
                            : "rgba(248,113,113,0.13)",
                      color:
                        tr.status === "testing"
                          ? "#818cf8"
                          : tr.status === "ok"
                            ? "#4ade80"
                            : "#f87171",
                      border: `1px solid ${tr.status === "testing" ? "rgba(99,102,241,0.3)" : tr.status === "ok" ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
                      flexShrink: 0,
                    }}
                  >
                    {tr.status === "testing"
                      ? "⏳"
                      : tr.status === "ok"
                        ? `✓ ${tr.code}`
                        : `✗ ${tr.code}`}
                  </span>
                )}
              </div>
              <div
                data-ocid={`details.endpoint_${op.key}_input`}
                style={{
                  background: rowBg,
                  borderRadius: 0,
                  padding: "4px 0",
                }}
                key={`url-${op.key}`}
              >
                <input
                  type={"text"}
                  style={INPUT_BASE}
                  value={params[urlKey] ?? ""}
                  placeholder={"https://api.example.com/..."}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      [urlKey]: e.target.value,
                    }))
                  }
                />
              </div>
              <div
                data-ocid={`details.method_${op.key}_select`}
                style={{
                  background: rowBg,
                  borderRadius: "0 6px 6px 0",
                  padding: "4px 0",
                }}
                key={`method-${op.key}`}
              >
                <select
                  style={SELECT_BASE}
                  value={params[methodKey] ?? "GET"}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      [methodKey]: e.target.value,
                    }))
                  }
                >
                  {httpMethods.map((m) => (
                    <option value={m} key={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }
  function renderSpGroup(ops) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {ops.map((op) => {
          const spKey = `sp_${op.key}`;
          return (
            <div
              data-ocid={`details.sp_${op.key}_input`}
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 7,
                background: isDark
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.02)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e2e8f0"}`,
              }}
              key={op.key}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: textColor,
                }}
              >
                {op.label}
              </span>
              <input
                type={"text"}
                style={INPUT_BASE}
                value={params[spKey] ?? ""}
                placeholder={`sp_${op.key
                  .split("_")
                  .map((w) => w[0].toUpperCase() + w.slice(1))
                  .join("")}`}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    [spKey]: e.target.value,
                  }))
                }
              />
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div
      data-ocid={"details.custom_endpoints_section"}
      style={{
        background: cardBg,
        border: `1px solid ${isDark ? "rgba(245,158,11,0.22)" : "rgba(245,158,11,0.35)"}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <button
        type={"button"}
        data-ocid={"details.custom_endpoints_toggle"}
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: isDark
            ? "rgba(245,158,11,0.06)"
            : "rgba(245,158,11,0.04)",
          border: "none",
          borderBottom: collapsed
            ? "none"
            : `1px solid ${isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.2)"}`,
          cursor: "pointer",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#000000",
            }}
          >
            {"Custom Integration"}{" "}
            {isDbDriver ? "Stored Procedures" : "API Endpoints"}
          </span>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 4,
              background: isDark
                ? "rgba(245,158,11,0.12)"
                : "rgba(245,158,11,0.1)",
              color: isDark ? "#fbbf24" : "#b45309",
              fontWeight: 600,
              border: `1px solid ${isDark ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.25)"}`,
            }}
          >
            {isDbDriver ? "STORED PROCEDURES" : "API"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: mutedColor,
            }}
          >
            {isDbDriver
              ? "Define stored procedures for each provisioning operation"
              : "Define endpoints and HTTP methods for each provisioning operation"}
          </span>
          <span
            style={{
              fontSize: 12,
              color: isDark ? "#fbbf24" : "#b45309",
              flexShrink: 0,
            }}
          >
            {collapsed ? "▸" : "▾"}
          </span>
        </div>
      </button>
      {!collapsed && (
        <div
          style={{
            padding: 16,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: dimColor,
              marginBottom: 14,
              marginTop: 0,
            }}
          >
            {"Define the "}
            {isDbDriver ? "stored procedures" : "API endpoints"}
            {
              " for each provisioning operation this connector will use. These values are saved with the application's connection configuration."
            }
          </p>
          {!isDbDriver && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
                padding: "8px 12px",
                borderRadius: 8,
                background: isDark
                  ? "rgba(99,102,241,0.06)"
                  : "rgba(99,102,241,0.04)",
                border: `1px solid ${isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`,
              }}
            >
              <button
                type={"button"}
                data-ocid={"details.test_all_endpoints_button"}
                disabled={testingAll}
                onClick={handleTestAll}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: `1px solid ${isDark ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.35)"}`,
                  background: testingAll
                    ? isDark
                      ? "rgba(99,102,241,0.08)"
                      : "rgba(99,102,241,0.05)"
                    : isDark
                      ? "rgba(99,102,241,0.18)"
                      : "rgba(99,102,241,0.1)",
                  color: testingAll ? mutedColor : "#818cf8",
                  cursor: testingAll ? "not-allowed" : "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {testingAll ? (
                  <React.Fragment>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        border: "2px solid rgba(99,102,241,0.25)",
                        borderTopColor: "#818cf8",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    {"Testing... ("}
                    {(testProgress == null ? void 0 : testProgress.done) ?? 0}
                    {"/"}
                    {(testProgress == null ? void 0 : testProgress.total) ?? 0}
                    {")"}
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <span
                      style={{
                        fontSize: 14,
                      }}
                    >
                      {"▶"}
                    </span>
                    {"Test All Endpoints"}
                  </React.Fragment>
                )}
              </button>
              <span
                style={{
                  fontSize: 10,
                  color: dimColor,
                  fontStyle: "italic",
                }}
              >
                {"✓ Routed through local server proxy — CORS-free"}
              </span>
            </div>
          )}
          {isDbDriver ? (
            // ── MODE 2: Stored Procedures ────────────────────────────────────────
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div>
                <GroupHeader
                  icon={""}
                  label={"Read Operations"}
                  color={isDark ? "#60a5fa" : "#2563eb"}
                />
                {renderSpGroup(readOps)}
              </div>
              <div>
                <GroupHeader
                  icon={""}
                  label={"Write Operations"}
                  color={isDark ? "#60a5fa" : "#2563eb"}
                />
                {renderSpGroup(writeOps)}
              </div>
            </div>
          ) : (
            // ── MODE 1: API Endpoints ─────────────────────────────────────────────
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div>
                <GroupHeader
                  icon={""}
                  label={"Read Operations"}
                  color={isDark ? "#60a5fa" : "#2563eb"}
                />
                {renderApiGroup(readOps)}
              </div>
              <div>
                <GroupHeader
                  icon={""}
                  label={"Write Operations"}
                  color={isDark ? "#60a5fa" : "#2563eb"}
                />
                {renderApiGroup(writeOps)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export { CustomIntegrationEndpoints };
