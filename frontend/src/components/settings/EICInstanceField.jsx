import { Button } from "../ui/Button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card.jsx";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/Input.jsx";
import { Label } from "../ui/Label.jsx";
import * as React from "react";
import { testEICConnectionViaProxy } from "../../services/eic.js";
function EICInstanceField({
  instanceType,
  label,
  description,
  placeholder,
  accentColor,
  accentBg,
  accentBorder,
  dataOcidPrefix,
  onSaved,
  authHeaders,
}) {
  const [saved, setSaved] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [savedUsername, setSavedUsername] = React.useState("");
  const [draftUsername, setDraftUsername] = React.useState("");
  const [savedPassword, setSavedPassword] = React.useState("");
  const [draftPassword, setDraftPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [check, setCheck] = React.useState("idle");
  const [saveStatus, setSaveStatus] = React.useState("idle");
  const [testState, setTestState] = React.useState("idle");
  const [testResult, setTestResult] = React.useState(null);
  const [connectionVerified, setConnectionVerified] = React.useState(false);
  const credentialsSaved = !!(saved && savedUsername && savedPassword);
  React.useEffect(() => {
    fetch("/api/saviynt/settings", {
      headers: authHeaders,
    })
      .then(async (r2) => {
        if (!r2.ok) {
          const errData = await r2.json().catch(() => ({
            error: `HTTP ${r2.status}`,
          }));
          console.warn(
            "[SaviyntSettings] load failed:",
            errData.error ?? r2.status,
          );
          return null;
        }
        return r2.json();
      })
      .then((data) => {
        if (!data) return;
        const section = instanceType === "nonprod" ? data.nonProd : data.prod;
        if (section == null ? void 0 : section.url) {
          setSaved(section.url);
          setDraft(section.url);
        }
        if (section == null ? void 0 : section.username) {
          setSavedUsername(section.username);
          setDraftUsername(section.username);
        }
        if (section == null ? void 0 : section.password) {
          setSavedPassword(section.password);
        }
      })
      .catch(() => {});
  }, [instanceType, authHeaders]);
  async function handleSave() {
    const url = draft.trim();
    if (!url) {
      setError("Please enter a URL before saving.");
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        setError("URL must start with https://");
        return;
      }
    } catch {
      setError(
        "URL format is invalid — example: https://yourcompany.saviyntcloud.com",
      );
      return;
    }
    if (!url.startsWith("https://")) {
      setError("URL must start with https:// for security");
      return;
    }
    setError("");
    setCheck("checking");
    try {
      const res = await fetch("/api/saviynt/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          environment: instanceType,
          url,
          username: draftUsername.trim(),
          password: draftPassword,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({
          error: `HTTP ${res.status}`,
        }));
        setCheck("fail");
        setError(
          errData.error ?? "Could not reach local server — is the app running?",
        );
        setTimeout(() => setCheck("idle"), 4e3);
        return;
      }
      setSaved(url);
      setSavedUsername(draftUsername.trim());
      setSavedPassword(draftPassword || savedPassword);
      setCheck("ok");
      setSaveStatus("saved");
      setConnectionVerified(false);
      setTestResult(null);
      setTestState("idle");
      onSaved == null
        ? void 0
        : onSaved(url, draftUsername.trim(), draftPassword);
      setTimeout(() => {
        setCheck("idle");
        setSaveStatus("idle");
      }, 4e3);
    } catch {
      setCheck("fail");
      setError("Could not reach local server — is the app running?");
      setTimeout(() => setCheck("idle"), 4e3);
    }
  }
  async function handleTestConnection() {
    if (!saved || !savedUsername || !savedPassword) return;
    setTestState("testing");
    setTestResult(null);
    const result = await testEICConnectionViaProxy(instanceType);
    setTestResult(result);
    if (result.success) {
      setTestState("passed");
      setConnectionVerified(true);
    } else {
      setTestState("failed");
      setConnectionVerified(false);
    }
  }
  async function handleClear() {
    setSaved("");
    setDraft("");
    setSavedUsername("");
    setDraftUsername("");
    setSavedPassword("");
    setDraftPassword("");
    setError("");
    setCheck("idle");
    setSaveStatus("idle");
    setTestState("idle");
    setTestResult(null);
    setConnectionVerified(false);
    await fetch("/api/saviynt/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        environment: instanceType,
        url: "",
        username: "",
        password: "",
      }),
    }).catch(() => {});
  }
  const checking = check === "checking";
  const testing = testState === "testing";
  const canTest =
    !!(saved && savedUsername && savedPassword) && !checking && !testing;
  return (
    <Card
      className={"rounded-xl border"}
      style={{
        borderColor: accentBorder,
        background: accentBg,
      }}
    >
      <CardHeader className={"pb-3"}>
        <div className={"flex items-center gap-2"}>
          <span
            className={"inline-block w-2.5 h-2.5 rounded-full"}
            style={{
              background: accentColor,
            }}
          />
          <CardTitle className={"text-base font-semibold"}>{label}</CardTitle>
        </div>
        <CardDescription className={"mt-1"}>{description}</CardDescription>
      </CardHeader>
      <CardContent className={"space-y-4"}>
        {credentialsSaved && (
          <div
            className={
              "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium"
            }
            style={{
              background: connectionVerified
                ? "rgba(74,222,128,0.10)"
                : "rgba(37,99,235,0.10)",
              border: connectionVerified
                ? "1px solid rgba(74,222,128,0.30)"
                : "1px solid rgba(37,99,235,0.30)",
              color: connectionVerified ? "#4ade80" : "#2563eb",
            }}
          >
            {connectionVerified ? (
              <React.Fragment>
                <svg
                  viewBox={"0 0 20 20"}
                  fill={"currentColor"}
                  className={"w-3.5 h-3.5 shrink-0"}
                  aria-hidden={"true"}
                >
                  <path
                    fillRule={"evenodd"}
                    d={
                      "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    }
                    clipRule={"evenodd"}
                  />
                </svg>
                {"Connection verified"}
              </React.Fragment>
            ) : (
              <React.Fragment>
                <svg
                  viewBox={"0 0 20 20"}
                  fill={"currentColor"}
                  className={"w-3.5 h-3.5 shrink-0"}
                  aria-hidden={"true"}
                >
                  <path
                    fillRule={"evenodd"}
                    d={
                      "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    }
                    clipRule={"evenodd"}
                  />
                </svg>
                {
                  "Connection not tested — run Test Connection to verify credentials"
                }
              </React.Fragment>
            )}
          </div>
        )}
        <div className={"space-y-1.5"}>
          <Label
            htmlFor={`${instanceType}-url`}
            className={"text-sm font-medium text-foreground"}
          >
            {"Instance URL"}
          </Label>
          <Input
            id={`${instanceType}-url`}
            data-ocid={`${dataOcidPrefix}.url_input`}
            type={"url"}
            placeholder={placeholder}
            value={draft}
            disabled={checking}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            className={"font-mono text-sm"}
          />
          {error && (
            <p
              data-ocid={`${dataOcidPrefix}.error_state`}
              className={"text-xs text-[#f87171] mt-1"}
            >
              {"⚠ "}
              {error}
            </p>
          )}
        </div>
        {saved && (
          <p
            className={"text-xs font-mono text-muted-foreground mt-1 break-all"}
          >
            {"Auth endpoint:"}{" "}
            <span
              style={{
                color: accentColor,
                opacity: 0.85,
              }}
            >
              {saved}
              {"/ECM/api/login"}
            </span>
          </p>
        )}
        <div className={"space-y-1.5"}>
          <Label
            htmlFor={`${instanceType}-username`}
            className={"text-sm font-medium text-foreground"}
          >
            {"Username"}
          </Label>
          <Input
            id={`${instanceType}-username`}
            data-ocid={`${dataOcidPrefix}.username_input`}
            type={"text"}
            placeholder={"Enter service account username"}
            value={draftUsername}
            disabled={checking}
            onChange={(e) => setDraftUsername(e.target.value)}
            className={"text-sm"}
            autoComplete={"username"}
          />
        </div>
        <div className={"space-y-1.5"}>
          <Label
            htmlFor={`${instanceType}-password`}
            className={"text-sm font-medium text-foreground"}
          >
            {"Password"}
          </Label>
          <div className={"relative"}>
            <Input
              id={`${instanceType}-password`}
              data-ocid={`${dataOcidPrefix}.password_input`}
              type={showPassword ? "text" : "password"}
              placeholder={"Enter password or secret"}
              value={draftPassword}
              disabled={checking}
              onChange={(e) => setDraftPassword(e.target.value)}
              className={"text-sm pr-10"}
              autoComplete={"current-password"}
            />
            <button
              type={"button"}
              aria-label={showPassword ? "Hide password" : "Show password"}
              data-ocid={`${dataOcidPrefix}.password_toggle`}
              onClick={() => setShowPassword((v) => !v)}
              className={
                "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              }
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className={"w-4 h-4"} aria-hidden={"true"} />
              ) : (
                <Eye className={"w-4 h-4"} aria-hidden={"true"} />
              )}
            </button>
          </div>
        </div>
        {(saved || savedUsername || savedPassword) && (
          <div
            className={"rounded-lg border bg-muted/30 px-3 py-3 space-y-1.5"}
            style={{
              borderColor: accentBorder,
            }}
          >
            {saved && (
              <div className={"flex items-center gap-2"}>
                <span
                  className={"text-xs font-medium w-20 shrink-0"}
                  style={{
                    color: accentColor,
                  }}
                >
                  {"URL:"}
                </span>
                <a
                  href={saved}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                  data-ocid={`${dataOcidPrefix}.saved_link`}
                  className={
                    "flex-1 text-xs font-mono break-all hover:underline"
                  }
                  style={{
                    color: accentColor,
                  }}
                >
                  {saved}
                </a>
                <span
                  className={"text-xs shrink-0"}
                  style={{
                    color: accentColor,
                  }}
                >
                  {"↗"}
                </span>
              </div>
            )}
            {savedUsername && (
              <div className={"flex items-center gap-2"}>
                <span
                  className={"text-xs font-medium w-20 shrink-0"}
                  style={{
                    color: accentColor,
                  }}
                >
                  {"Username:"}
                </span>
                <span className={"text-xs font-mono text-muted-foreground"}>
                  {savedUsername}
                </span>
              </div>
            )}
            {savedPassword && (
              <div className={"flex items-center gap-2"}>
                <span
                  className={"text-xs font-medium w-20 shrink-0"}
                  style={{
                    color: accentColor,
                  }}
                >
                  {"Password:"}
                </span>
                <span
                  className={
                    "text-xs font-mono text-muted-foreground tracking-widest"
                  }
                >
                  {"••••••••"}
                </span>
              </div>
            )}
          </div>
        )}
        <div className={"flex items-center gap-3 flex-wrap"}>
          <Button
            type={"button"}
            data-ocid={`${dataOcidPrefix}.save_button`}
            disabled={checking || testing}
            onClick={handleSave}
            className={"text-primary-foreground"}
            style={{
              background: "#0d263e",
              color: "#ffffff",
            }}
          >
            {checking ? (
              <span className={"flex items-center gap-2"}>
                <svg
                  className={"animate-spin h-4 w-4"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  aria-hidden={"true"}
                >
                  <circle
                    className={"opacity-25"}
                    cx={"12"}
                    cy={"12"}
                    r={"10"}
                    stroke={"currentColor"}
                    strokeWidth={"4"}
                  />
                  <path
                    className={"opacity-75"}
                    fill={"currentColor"}
                    d={"M4 12a8 8 0 018-8v8z"}
                  />
                </svg>
                {"Saving..."}
              </span>
            ) : (
              "Save & Verify"
            )}
          </Button>
          {credentialsSaved && (
            <Button
              type={"button"}
              data-ocid={`${dataOcidPrefix}.test_connection_button`}
              disabled={!canTest}
              onClick={handleTestConnection}
              variant={"outline"}
              className={"font-medium"}
              style={{
                borderColor: canTest ? accentColor : void 0,
                color: canTest ? accentColor : void 0,
                opacity: canTest ? 1 : 0.5,
              }}
            >
              {testing ? (
                <span className={"flex items-center gap-2"}>
                  <svg
                    className={"animate-spin h-4 w-4"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    aria-hidden={"true"}
                  >
                    <circle
                      className={"opacity-25"}
                      cx={"12"}
                      cy={"12"}
                      r={"10"}
                      stroke={"currentColor"}
                      strokeWidth={"4"}
                    />
                    <path
                      className={"opacity-75"}
                      fill={"currentColor"}
                      d={"M4 12a8 8 0 018-8v8z"}
                    />
                  </svg>
                  {"Testing..."}
                </span>
              ) : (
                "Test Connection"
              )}
            </Button>
          )}
          {(saved || savedUsername || savedPassword) && (
            <Button
              type={"button"}
              data-ocid={`${dataOcidPrefix}.clear_button`}
              variant={"outline"}
              onClick={handleClear}
              disabled={checking || testing}
              className={"text-muted-foreground"}
            >
              {"Clear"}
            </Button>
          )}
          {check === "ok" && saveStatus === "saved" && (
            <span
              data-ocid={`${dataOcidPrefix}.success_state`}
              className={"flex items-center gap-1.5 text-sm text-[#4ade80]"}
            >
              <svg
                viewBox={"0 0 20 20"}
                fill={"currentColor"}
                className={"w-4 h-4 shrink-0"}
                aria-hidden={"true"}
              >
                <path
                  fillRule={"evenodd"}
                  d={
                    "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  }
                  clipRule={"evenodd"}
                />
              </svg>
              {"Saved ✓"}
            </span>
          )}
          {check === "fail" && (
            <span
              data-ocid={`${dataOcidPrefix}.error_state`}
              className={"flex items-center gap-1.5 text-sm text-[#f87171]"}
            >
              <svg
                viewBox={"0 0 20 20"}
                fill={"currentColor"}
                className={"w-4 h-4 shrink-0"}
                aria-hidden={"true"}
              >
                <path
                  fillRule={"evenodd"}
                  d={
                    "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  }
                  clipRule={"evenodd"}
                />
              </svg>
              {"Could not save"}
            </span>
          )}
        </div>
        {(testResult == null ? void 0 : testResult.success) &&
          testResult.tokenObtained && (
            <div
              className={"rounded-lg border px-4 py-3 space-y-1"}
              style={{
                background: "rgba(99,102,241,0.07)",
                borderColor: "rgba(99,102,241,0.28)",
              }}
            >
              <p
                className={"text-xs font-semibold"}
                style={{
                  color: "#818cf8",
                }}
              >
                {"🔑 Bearer Token Authentication"}
              </p>
              <p className={"text-xs text-muted-foreground leading-relaxed"}>
                {
                  "Saviynt uses bearer tokens for API access. Your credentials authenticate against"
                }{" "}
                <code
                  className={"font-mono text-[11px] break-all"}
                  style={{
                    color: "#818cf8",
                  }}
                >
                  {testResult.loginEndpoint ?? `${saved}/ECM/api/login`}
                </code>{" "}
                {
                  "and a short-lived bearer token is returned. All subsequent calls (endpoint registration, JML tests, Queue submissions) use this token \\u2014 your password is never sent to individual APIs."
                }
              </p>
            </div>
          )}
        {testResult && (
          <div
            data-ocid={
              testResult.success
                ? `${dataOcidPrefix}.test_success_state`
                : `${dataOcidPrefix}.test_error_state`
            }
            className={"rounded-lg border px-4 py-3 space-y-2"}
            style={{
              background: testResult.success
                ? "rgba(74,222,128,0.08)"
                : "rgba(248,113,113,0.08)",
              borderColor: testResult.success
                ? "rgba(74,222,128,0.30)"
                : "rgba(248,113,113,0.30)",
            }}
          >
            <div className={"flex items-center gap-2"}>
              <span
                className={"text-sm font-semibold"}
                style={{
                  color: testResult.success ? "#4ade80" : "#f87171",
                }}
              >
                {testResult.success ? "✓" : "✗"} {testResult.message}
              </span>
              <span
                className={"text-xs ml-auto"}
                style={{
                  color: testResult.success ? "#4ade80" : "#f87171",
                  opacity: 0.7,
                }}
              >
                {testResult.latency}
                {"ms"}
              </span>
            </div>
            {testResult.details && testResult.details.length > 0 && (
              <ul className={"space-y-0.5"}>
                {testResult.details.map((d) => (
                  <li
                    className={"text-xs text-muted-foreground font-mono"}
                    key={d}
                  >
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── InstanceBadge: shows the active Saviynt instance in the nav bar ──────────
// Fetches /api/saviynt/primary-instance and renders a compact status pill.
// Clicking it navigates to saviynt_settings (if admin).
export { EICInstanceField };
