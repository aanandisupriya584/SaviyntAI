import { Button } from "../components/ui/Button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Label } from "../components/ui/Label.jsx";
import { Switch } from "../components/ui/Switch.jsx";
import * as React from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
function IDPSettings() {
  const { idpConfig, updateIDPConfig } = useAuth();
  const [form, setForm] = React.useState(idpConfig);
  const [saveStatus, setSaveStatus] = React.useState("idle");
  const [testStatus, setTestStatus] = React.useState("idle");
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    setForm(idpConfig);
  }, [idpConfig]);
  const redirectUri = `${window.location.origin}/auth/callback`;
  function handleSave() {
    updateIDPConfig(form);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 3500);
  }
  async function handleTestConnection() {
    if (!form.enabled || !form.metadataUrl) return;
    setTestStatus("connecting");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6e3);
      await fetch(form.metadataUrl, {
        signal: controller.signal,
        mode: "no-cors",
      });
      clearTimeout(timeout);
      setTestStatus("ok");
    } catch {
      setTestStatus("fail");
    }
    setTimeout(() => setTestStatus("idle"), 5e3);
  }
  async function handleCopyUri() {
    await navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  }
  const fieldsDisabled = !form.enabled;
  return (
    <div className={"w-full space-y-6 idp-page settings-page"}>
      <div>
        <h1 className={"text-2xl font-bold text-foreground"}>
          {"Enterprise IDP Configuration"}
        </h1>
        <p className={"mt-1 text-sm text-muted-foreground"}>
          {
            "Configure your organization's identity provider for single sign-on."
          }
        </p>
      </div>
      <Card className={"rounded-xl border border-border bg-card"}>
        <CardHeader className={"pb-4"}>
          <CardTitle className={"text-base font-semibold"}>
            {"Identity Provider Settings"}
          </CardTitle>
          <CardDescription>
            {
              "These settings apply globally to all users with IDP login enabled."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className={"space-y-5"}>
          <div
            className={
              "flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
            }
          >
            <div>
              <p className={"text-sm font-medium text-foreground"}>
                {"Enable Enterprise IDP"}
              </p>
              <p className={"text-xs text-muted-foreground mt-0.5"}>
                {
                  "Allow users to sign in via your organization's identity provider."
                }
              </p>
            </div>
            <Switch
              data-ocid={"idp.enabled_toggle"}
              checked={form.enabled}
              onCheckedChange={(val) =>
                setForm((f) => ({
                  ...f,
                  enabled: val,
                }))
              }
            />
          </div>
          {fieldsDisabled && (
            <div
              style={{
                color: "#2563eb",
              }}
              className={
                "rounded-lg border border-border bg-card px-4 py-3 text-xs"
              }
            >
              {"Enable enterprise IDP to configure these settings."}
            </div>
          )}
          <div className={"space-y-1.5"}>
            <Label
              htmlFor={"issuerUrl"}
              className={"text-sm font-medium text-foreground"}
            >
              {"Issuer URL"}
            </Label>
            <Input
              id={"issuerUrl"}
              data-ocid={"idp.issuer_url_input"}
              disabled={fieldsDisabled}
              placeholder={"https://your-idp.example.com/"}
              value={form.issuerUrl}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  issuerUrl: e.target.value,
                }))
              }
              className={"font-mono text-sm"}
            />
          </div>
          <div className={"space-y-1.5"}>
            <Label
              htmlFor={"clientId"}
              className={"text-sm font-medium text-foreground"}
            >
              {"Client ID"}
            </Label>
            <Input
              id={"clientId"}
              data-ocid={"idp.client_id_input"}
              disabled={fieldsDisabled}
              placeholder={"your-client-id"}
              value={form.clientId}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  clientId: e.target.value,
                }))
              }
              className={"font-mono text-sm"}
            />
          </div>
          <div className={"space-y-1.5"}>
            <Label
              htmlFor={"metadataUrl"}
              className={"text-sm font-medium text-foreground"}
            >
              {"Metadata URL"}
            </Label>
            <Input
              id={"metadataUrl"}
              data-ocid={"idp.metadata_url_input"}
              disabled={fieldsDisabled}
              placeholder={
                "https://your-idp.example.com/.well-known/openid-configuration"
              }
              value={form.metadataUrl}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  metadataUrl: e.target.value,
                }))
              }
              className={"font-mono text-sm"}
            />
          </div>
          <div className={"flex items-center gap-3 pt-2"}>
            <Button
              type={"button"}
              data-ocid={"idp.save_button"}
              onClick={handleSave}
              className={
                "bg-primary text-primary-foreground hover:bg-primary/90"
              }
            >
              {"Save Configuration"}
            </Button>
            <Button
              type={"button"}
              data-ocid={"idp.test_connection_button"}
              variant={"outline"}
              disabled={
                !form.enabled ||
                !form.metadataUrl ||
                testStatus === "connecting"
              }
              onClick={handleTestConnection}
            >
              {testStatus === "connecting" ? (
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
                  {"Connecting..."}
                </span>
              ) : (
                "Test Connection"
              )}
            </Button>
            {testStatus === "ok" && (
              <span
                data-ocid={"idp.test_success_state"}
                className={"flex items-center gap-1.5 text-sm text-[#4ade80]"}
              >
                <svg
                  viewBox={"0 0 20 20"}
                  fill={"currentColor"}
                  className={"w-4 h-4"}
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
                {"Connection successful"}
              </span>
            )}
            {testStatus === "fail" && (
              <span
                data-ocid={"idp.test_error_state"}
                className={"flex items-center gap-1.5 text-sm text-[#f87171]"}
              >
                <svg
                  viewBox={"0 0 20 20"}
                  fill={"currentColor"}
                  className={"w-4 h-4"}
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
                {"Could not reach metadata URL"}
              </span>
            )}
          </div>
          {saveStatus === "saved" && (
            <div
              data-ocid={"idp.success_state"}
              className={
                "flex items-center gap-2 rounded-lg border border-[#4ade80]/30 bg-[#4ade80]/10 px-4 py-3 text-sm text-[#4ade80]"
              }
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
              {"IDP configuration saved successfully."}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className={"rounded-xl border border-[#6366f1]/30 bg-[#6366f1]/5"}>
        <CardContent className={"pt-5 space-y-4"}>
          <div className={"flex gap-3"}>
            <svg
              viewBox={"0 0 20 20"}
              fill={"currentColor"}
              className={"w-5 h-5 shrink-0 text-[#818cf8] mt-0.5"}
              aria-hidden={"true"}
            >
              <path
                fillRule={"evenodd"}
                d={
                  "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                }
                clipRule={"evenodd"}
              />
            </svg>
            <div className={"space-y-2"}>
              <p className={"text-sm text-foreground font-medium"}>
                {"How IDP login works"}
              </p>
              <p className={"text-sm text-muted-foreground"}>
                {
                  "When IDP login is enabled for a user, they will be prompted to sign in using their organizational email through your configured identity provider."
                }
              </p>
              <p className={"text-sm text-muted-foreground"}>
                {"Ensure the redirect URI in your IDP is set to:"}
              </p>
              <div
                className={
                  "flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2"
                }
              >
                <code
                  className={
                    "flex-1 text-xs font-mono text-[#60a5fa] break-all"
                  }
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {redirectUri}
                </code>
                <button
                  type={"button"}
                  data-ocid={"idp.copy_redirect_uri_button"}
                  onClick={handleCopyUri}
                  className={
                    "shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  }
                  aria-label={"Copy redirect URI"}
                >
                  {copied ? (
                    <svg
                      viewBox={"0 0 20 20"}
                      fill={"currentColor"}
                      className={"w-4 h-4 text-[#4ade80]"}
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
                  ) : (
                    <svg
                      viewBox={"0 0 20 20"}
                      fill={"currentColor"}
                      className={"w-4 h-4"}
                      aria-hidden={"true"}
                    >
                      <path
                        d={"M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"}
                      />
                      <path
                        d={
                          "M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
                        }
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export { IDPSettings };
