import * as React from "react";

const QUESTIONS = [
  {
    title: "Where is the application API?",
    help: "Enter the HTTPS base URL for the REST API. Do not include a username, password, token, or API key.",
    key: "baseUrl",
    placeholder: "https://api.example.com/v1",
    type: "url",
  },
  {
    title: "How does the API authenticate?",
    help: "Tell us the authentication pattern only. Credentials are configured later in the approved secrets store.",
    key: "authType",
    options: ["OAuth 2.0 client credentials", "API key", "Basic authentication", "No authentication", "Other / not sure"],
  },
  {
    title: "Where can we read users and access?",
    help: "Provide relative API paths from the base URL. Leave a path blank if the API does not expose it.",
    key: "endpoints",
    fields: [
      ["users", "Users / accounts path", "/users"],
      ["groups", "Groups / entitlements path", "/groups"],
    ],
  },
  {
    title: "How are results returned?",
    help: "These answers help the draft describe pagination and supported lifecycle actions.",
    key: "behavior",
    fields: [
      ["pagination", "Pagination style", "Select one", ["Page number", "Offset and limit", "Cursor / next link", "No pagination", "Not sure"]],
      ["provisioning", "Supported actions", "Select one", ["Read accounts only", "Read accounts and groups", "Create, update, disable accounts", "Not sure"]],
    ],
  },
  {
    title: "Who can confirm the connection details?",
    help: "Name the application contact who can resolve open questions. Never enter a password or secret here.",
    key: "owner",
    fields: [["contact", "Technical contact email", "name@company.com"]],
  },
  {
    title: "Can you share API evidence?",
    help: "Optional: paste an OpenAPI JSON document and a sample response. The server removes secret-like fields, email addresses, and phone numbers before agents analyze it. Avoid production data.",
    key: "evidence",
    fields: [["apiSpec", "OpenAPI JSON", "Paste JSON (optional)"], ["sampleData", "Sample account response JSON", "Paste sanitized JSON (optional)" ]],
  },
];

function isValidHttpUrl(value) {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function ConnectorIntakeAgent({ app, currentUser, onUpdate, isDark, border, cardBg, titleColor, textColor, mutedColor }) {
  const [saved, setSaved] = React.useState(null);
  const [versionCounter, setVersionCounter] = React.useState(0);
  const [loadingSaved, setLoadingSaved] = React.useState(true);
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState(() => ({
    baseUrl: "", authType: "OAuth 2.0 client credentials", users: "/users", groups: "/groups",
    pagination: "Not sure", provisioning: "Not sure", contact: app.ownerEmail || "",
  }));
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const question = QUESTIONS[step];
  const updateAnswer = (key, value) => setAnswers((current) => ({ ...current, [key]: value }));
  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 7,
    border: `1px solid ${border}`, background: isDark ? "rgba(255,255,255,.04)" : "#fff",
    color: textColor, fontSize: 13,
  };
  React.useEffect(() => {
    let active = true;
    fetch(`/api/connector-agents/${encodeURIComponent(app.id)}/latest`)
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!active || !result) return;
        setSaved({ ...result, config: result.connectorConfig });
        setVersionCounter(result.version || 0);
        setAnswers((current) => ({ ...current, ...result.safeAnswers }));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [app.id]);
  React.useEffect(() => {
    const timeout = setTimeout(() => setLoadingSaved(false), 250);
    return () => clearTimeout(timeout);
  }, []);
  async function next() {
    setError("");
    if (step === 0 && !isValidHttpUrl(answers.baseUrl || "")) {
      setError("Enter a valid HTTPS base URL. Use a non-production endpoint for the pilot.");
      return;
    }
    if (step === 2 && ["users", "groups"].some((key) => answers[key] && !answers[key].startsWith("/"))) {
      setError("Endpoint paths must be relative paths that start with /. Do not include credentials or query-string secrets.");
      return;
    }
    if (step < QUESTIONS.length - 1) setStep((value) => value + 1);
    else await generateDraft();
  }
  async function generateDraft() {
    const version = versionCounter + 1;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/connector-agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: app.id, applicationName: app.name, version, answers }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Agent workflow failed.");
      setSaved({ ...result, config: result.connectorConfig });
      setVersionCounter(version);
      setAnswers((current) => ({ ...current, ...result.safeAnswers }));
      onUpdate(app.id, { connectionTestPassed: false, saviyntEndpointRegistered: false });
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Could not run the connector agents.");
    } finally {
      setBusy(false);
    }
  }
  async function approveDraft() {
    setError("");
    try {
      const response = await fetch(`/api/connector-agents/${encodeURIComponent(app.id)}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: saved.version }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Approval failed.");
    setSaved((current) => ({
      ...current,
      status: "approved",
      approval: result.approval,
      history: (current?.history || []).map((entry) => entry.version === saved.version
        ? { ...entry, status: "approved", approval: result.approval }
        : entry),
    }));
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Approval failed.");
    }
  }

  return (
    <section data-ocid="connector_agent.panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 9, padding: 16 }}>
        <div style={{ color: titleColor, fontWeight: 700, fontSize: 15 }}>Guided Connector Setup Agent</div>
        <p style={{ color: mutedColor, fontSize: 12, lineHeight: 1.6, margin: "7px 0 0" }}>
          Answer a few questions and the agent will prepare a REST connector draft for review. It does not connect to the target or Saviynt, and it never asks for credentials.
        </p>
      </div>
      {loadingSaved && <div role="status" style={{ color: mutedColor, fontSize: 12 }}>Loading saved agent run from Docker PostgreSQL…</div>}
      {!saved?.config || saved.status !== "approved" ? (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 9, padding: 18 }}>
          <div style={{ color: mutedColor, fontSize: 11, marginBottom: 7 }}>QUESTION {step + 1} OF {QUESTIONS.length}</div>
          <div style={{ color: titleColor, fontSize: 16, fontWeight: 650, marginBottom: 6 }}>{question.title}</div>
          <div style={{ color: mutedColor, fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>{question.help}</div>
          {question.key === "evidence" ? question.fields.map(([key, label, placeholder]) => (
            <label key={key} style={{ display: "block", color: mutedColor, fontSize: 12, margin: "10px 0" }}>
              {label}
              <textarea value={answers[key] || ""} placeholder={placeholder} onChange={(e) => updateAnswer(key, e.target.value)} rows={key === "apiSpec" ? 5 : 4} style={{ ...inputStyle, marginTop: 5, resize: "vertical", fontFamily: "monospace" }} />
            </label>
          )) : question.key === "baseUrl" || question.key === "authType" ? (
            question.key === "authType" ? (
              <select data-ocid="connector_agent.auth_select" value={answers.authType} onChange={(e) => updateAnswer("authType", e.target.value)} style={inputStyle}>
                {question.options.map((option) => <option key={option}>{option}</option>)}
              </select>
            ) : <input data-ocid="connector_agent.base_url_input" type="url" value={answers.baseUrl} placeholder={question.placeholder} onChange={(e) => updateAnswer("baseUrl", e.target.value)} style={inputStyle} />
          ) : question.fields.map(([key, label, placeholder, options]) => (
            <label key={key} style={{ display: "block", color: mutedColor, fontSize: 12, margin: "10px 0" }}>
              {label}
              {options ? <select value={answers[key]} onChange={(e) => updateAnswer(key, e.target.value)} style={{ ...inputStyle, marginTop: 5 }}>{options.map((option) => <option key={option}>{option}</option>)}</select>
                : <input type={key === "contact" ? "email" : "text"} value={answers[key]} placeholder={placeholder} onChange={(e) => updateAnswer(key, e.target.value)} style={{ ...inputStyle, marginTop: 5 }} />}
            </label>
          ))}
          {error && <div role="alert" style={{ color: "#f87171", fontSize: 12, marginTop: 10 }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} style={{ ...inputStyle, width: "auto", cursor: step ? "pointer" : "default", opacity: step ? 1 : .5 }}>Back</button>
            <button type="button" data-ocid="connector_agent.next_button" onClick={next} disabled={busy} style={{ ...inputStyle, width: "auto", background: "#4f46e5", borderColor: "#4f46e5", color: "white", cursor: busy ? "wait" : "pointer" }}>{busy ? "Running agents…" : step === QUESTIONS.length - 1 ? "Run four agents and build draft" : "Next question"}</button>
          </div>
        </div>
      ) : null}
      {saved?.config && (
        <div data-ocid="connector_agent.draft" style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 9, padding: 16 }}>
          {error && <div role="alert" style={{ color: "#f87171", fontSize: 12, marginBottom: 10 }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ color: titleColor, fontWeight: 650 }}>Connector draft · v{saved.version}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: saved.status === "approved" ? "#22c55e" : "#f59e0b" }}>{saved.status === "approved" ? "APPROVED VERSION" : "SME REVIEW REQUIRED"}</span>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: textColor, background: isDark ? "rgba(0,0,0,.2)" : "#f1f5f9", borderRadius: 7, padding: 12, fontSize: 11, lineHeight: 1.55 }}>{JSON.stringify(saved.config, null, 2)}</pre>
          {saved.validation?.status === "failed" && <div role="alert" style={{ color: "#f87171", fontSize: 12 }}>Validation blocks approval: {saved.validation.errors.join("; ")}</div>}
          {saved.agents && <div data-ocid="connector_agent.results" style={{ display: "grid", gap: 8, margin: "12px 0" }}>
            <div style={{ color: titleColor, fontSize: 13, fontWeight: 650 }}>Agent results · run {saved.runId}</div>
            {["intake", "analysis", "mapping", "documentation"].map((name) => {
              const result = saved.agents?.[name];
              return result && <details key={name} style={{ border: `1px solid ${border}`, borderRadius: 7, padding: 9 }}>
                <summary style={{ color: titleColor, cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{name} agent · {result.status}</summary>
                <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: mutedColor, fontSize: 11 }}>{name === "documentation" ? result.runbook : JSON.stringify(result, null, 2)}</pre>
              </details>;
            })}
          </div>}
          <div style={{ color: mutedColor, fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>
            <strong>Before sandbox execution:</strong> provide a sanitized sample response, confirm stable account IDs and entitlement fields, configure credentials in the secrets store, and test the endpoints with a least-privilege service account.
          </div>
          {saved.status !== "approved" ? (saved.validation?.status === "failed" ? <div role="status" style={{ color: mutedColor, fontSize: 12 }}>Fix the blocking checks and generate a new version before approval.</div> : currentUser?.role === "admin" ? <button type="button" data-ocid="connector_agent.approve_button" onClick={approveDraft} style={{ ...inputStyle, background: "#15803d", color: "white", borderColor: "#15803d", cursor: "pointer" }}>SME approves version {saved.version}</button> : <div role="status" style={{ color: mutedColor, fontSize: 12 }}>An administrator must review and approve version {saved.version}.</div>) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: mutedColor, fontSize: 11 }}>Approved by {saved.approval?.approvedBy} · {new Date(saved.approval?.approvedAt).toLocaleString()}</span>
              <button type="button" data-ocid="connector_agent.revise_button" onClick={() => { setStep(0); setAnswers((current) => ({ ...current, ...saved.safeAnswers })); setSaved(null); }} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>Create a new version</button>
            </div>
          )}
          {!!saved.history?.length && <div style={{ color: mutedColor, fontSize: 11, marginTop: 10 }}>Version history: {saved.history.map((item) => `v${item.version} ${item.status}`).join(" · ")}</div>}
        </div>
      )}
    </section>
  );
}
