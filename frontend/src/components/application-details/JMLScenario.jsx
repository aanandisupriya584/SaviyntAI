import * as React from "react";
function JMLScenario({
  title,
  icon,
  subtitle,
  result,
  running,
  disabled = false,
  inputs,
  onRun,
  onCleanup,
  inputStyle,
  border,
  dimColor,
  textColor,
  mutedColor,
}) {
  const [showRawError, setShowRawError] = React.useState(false);
  const [cleaningUp, setCleaningUp] = React.useState(false);
  const resultColor =
    (result == null ? void 0 : result.status) === "pass"
      ? "#4ade80"
      : (result == null ? void 0 : result.status) === "fail"
        ? "#f87171"
        : mutedColor;
  const resultBg =
    (result == null ? void 0 : result.status) === "pass"
      ? "rgba(74,222,128,0.06)"
      : "rgba(248,113,113,0.06)";
  async function handleCleanup() {
    if (!onCleanup) return;
    setCleaningUp(true);
    await onCleanup();
    setCleaningUp(false);
  }
  return (
    <div
      style={{
        marginBottom: 14,
        paddingBottom: 14,
        borderBottom: `1px solid ${border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: textColor,
            }}
          >
            {icon} {title}
          </span>
          <span
            style={{
              fontSize: 11,
              color: mutedColor,
              marginLeft: 8,
            }}
          >
            {subtitle}
          </span>
        </div>
        <button
          type={"button"}
          data-ocid={`details.jml_${title.toLowerCase()}_run_button`}
          onClick={onRun}
          disabled={running || disabled}
          title={
            disabled
              ? "Register this app as a Saviynt endpoint first before running JML tests"
              : void 0
          }
          style={{
            background:
              running || disabled
                ? "rgba(99,102,241,0.06)"
                : "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 6,
            padding: "5px 12px",
            color: running || disabled ? mutedColor : "#818cf8",
            cursor: running || disabled ? "not-allowed" : "pointer",
            fontSize: 11,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 5,
            opacity: disabled ? 0.55 : 1,
          }}
        >
          {running ? (
            <React.Fragment>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  border: "2px solid rgba(99,102,241,0.3)",
                  borderTopColor: "#818cf8",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              {"Running..."}
            </React.Fragment>
          ) : result ? (
            "↺ Re-run"
          ) : (
            "▶ Run"
          )}
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {inputs.map((inp) => (
          <div key={inp.key}>
            <div
              style={{
                fontSize: 10,
                color: dimColor,
                marginBottom: 3,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {inp.label}
            </div>
            <input
              type={"text"}
              style={{
                ...inputStyle,
                padding: "6px 10px",
                fontSize: 12,
                opacity: inp.readOnly ? 0.65 : 1,
                cursor: inp.readOnly ? "not-allowed" : void 0,
              }}
              value={inp.value}
              readOnly={inp.readOnly}
              onChange={(e) => inp.onChange(e.target.value)}
            />
          </div>
        ))}
      </div>
      {result && (
        <div
          style={{
            background: resultBg,
            border: `1px solid ${result.status === "pass" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
            borderRadius: 6,
            padding: "7px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: resultColor,
                flexShrink: 0,
              }}
            >
              {result.status === "pass" ? "✓" : "✗"}
            </span>
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: resultColor,
                }}
              >
                {result.message}
              </div>
              {result.isLiveProvisioning && result.provisionedUsername && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#4ade80",
                    marginTop: 3,
                    fontFamily: "IBM Plex Mono, monospace",
                  }}
                >
                  {"User created: "}
                  {result.provisionedUsername}
                </div>
              )}
              {result.isLiveProvisioning && (
                <div
                  style={{
                    fontSize: 10,
                    color: result.status === "pass" ? "#4ade80" : "#f87171",
                    marginTop: 2,
                    opacity: 0.7,
                  }}
                >
                  {result.status === "pass"
                    ? "Live provisioning — Non-prod EIC"
                    : "Live provisioning attempt — Non-prod EIC"}
                </div>
              )}
              {!result.isLiveProvisioning && (
                <div
                  style={{
                    fontSize: 10,
                    color: dimColor,
                    marginTop: 2,
                    fontStyle: "italic",
                  }}
                >
                  {"Simulated (no EIC configured)"}
                </div>
              )}
              <div
                style={{
                  fontSize: 10,
                  color: dimColor,
                  marginTop: 2,
                }}
              >
                {new Date(result.testedAt).toLocaleString()}
              </div>
              {result.cleanedUp && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 6,
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "rgba(107,114,128,0.12)",
                    color: "#6b7280",
                    fontWeight: 600,
                  }}
                >
                  {"🗑 Cleaned Up"}
                </div>
              )}
            </div>
          </div>
          {result.rawError && (
            <div
              style={{
                marginTop: 8,
              }}
            >
              <button
                type={"button"}
                onClick={() => setShowRawError((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  color: "#f87171",
                  padding: 0,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {showRawError ? "▾" : "▸"}
                {" Full API Error Response"}
              </button>
              {showRawError && (
                <pre
                  style={{
                    marginTop: 6,
                    padding: "8px 10px",
                    borderRadius: 5,
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    fontSize: 11,
                    fontFamily: "IBM Plex Mono, monospace",
                    color: "#f87171",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {result.rawError}
                </pre>
              )}
            </div>
          )}
          {result.status === "pass" &&
            result.isLiveProvisioning &&
            result.provisionedUsername &&
            !result.cleanedUp &&
            onCleanup && (
              <div
                style={{
                  marginTop: 8,
                }}
              >
                <button
                  type={"button"}
                  data-ocid={`details.jml_${title.toLowerCase()}_cleanup_button`}
                  onClick={handleCleanup}
                  disabled={cleaningUp}
                  style={{
                    background: cleaningUp
                      ? "rgba(107,114,128,0.06)"
                      : "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.25)",
                    borderRadius: 5,
                    padding: "4px 12px",
                    color: cleaningUp ? "#6b7280" : "#f87171",
                    cursor: cleaningUp ? "not-allowed" : "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {cleaningUp ? (
                    <React.Fragment>
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          border: "2px solid rgba(248,113,113,0.3)",
                          borderTopColor: "#f87171",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                      {"Cleaning up..."}
                    </React.Fragment>
                  ) : (
                    "🗑 Clean Up Test User"
                  )}
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
export { JMLScenario };
