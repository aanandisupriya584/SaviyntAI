import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  Spinner,
} from "../components/common/LoginIcons.jsx";
import * as React from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
function LoginPage() {
  const { login, loginWithIDP, idpConfig } = useAuth();
  const [mode, setMode] = React.useState("password");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [idpEmail, setIdpEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [shake, setShake] = React.useState(false);
  const triggerShake = React.useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);
  const handlePasswordSubmit = React.useCallback(
    async (e) => {
      e.preventDefault();
      if (!username.trim() || !password.trim()) {
        setError("Please enter your username and password.");
        triggerShake();
        return;
      }
      setLoading(true);
      setError(null);
      const result = await login({
        username: username.trim(),
        password,
      });
      setLoading(false);
      if (!result.success) {
        setError(result.error ?? "Login failed. Please try again.");
        triggerShake();
      }
    },
    [username, password, login, triggerShake],
  );
  const handleIDPSubmit = React.useCallback(
    async (e) => {
      e.preventDefault();
      if (!idpEmail.trim()) {
        setError("Please enter your email address.");
        triggerShake();
        return;
      }
      setLoading(true);
      setError(null);
      const result = await loginWithIDP(idpEmail.trim());
      setLoading(false);
      if (!result.success) {
        setError(result.error ?? "IDP login failed.");
        triggerShake();
      }
    },
    [idpEmail, loginWithIDP, triggerShake],
  );
  const switchMode = React.useCallback((next) => {
    setMode(next);
    setError(null);
    setLoading(false);
  }, []);
  return (
    <React.Fragment>
      <div
        className={
          "apex-login relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        }
        style={{
          background: "#060d1a",
        }}
      >
        <section
          className={"login-app-story"}
          aria-label={"Application onboarding features"}
        >
          <p className={"login-story-eyebrow"}>{"IGA ONBOARDING HUB"}</p>
          <h2>{"Assess. Integrate. Onboard."}</h2>
          <p className={"login-story-description"}>
            {
              "Bring application assessment, integration planning, and onboarding progress into one workspace."
            }
          </p>
          <div className={"login-feature-cards"}>
            {[
              [
                "AI Assessment",
                "Identify OOTB and custom integration patterns.",
              ],
              [
                "Lifecycle Testing",
                "Validate Joiner, Mover, and Leaver operations.",
              ],
              [
                "Integration Specs",
                "Upload specifications for review and approval.",
              ],
              [
                "Onboarding Tracking",
                "Track application progress, reminders, and escalations.",
              ],
            ].map(([title, description]) => (
              <div className={"login-feature-card"} key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <footer className={"apex-login-footer"}>
          {
            "\u00A9 2026 KPMG Assurance and Consulting Services LLP, an Indian Limited Liability Partnership and a member firm of the KPMG global organization of independent member firms affiliated with KPMG International Limited, a private English company limited by guarantee. All rights reserved."
          }
        </footer>
        <header className={"apex-login-header"}>
          <div className={"apex-login-brand"}>
            <img
              src={"/assets/kpmg-logo.svg"}
              alt={"KPMG"}
              width={76}
              height={31}
            />
            <span className={"apex-login-brand-divider"} aria-hidden={true} />
            <span className={"apex-login-name"}>{"Saviynt"}</span>
            <span className={"apex-login-slash"} aria-hidden={true}>
              {"/"}
            </span>
            <span className={"apex-login-platform"}>
              {"IGA Application Onboarding Platform"}
            </span>
          </div>
          <div className={"apex-login-status"}>
            <span className={"apex-login-secure"}>
              <span aria-hidden={true} />
              {"Secure"}
            </span>
            <span className={"apex-login-restricted"}>
              <LockIcon />
              {"Restricted access"}
            </span>
          </div>
        </header>
        <div
          className={"login-glow pointer-events-none absolute inset-0"}
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.22) 0%, transparent 70%)",
          }}
        />
        <div
          className={"pointer-events-none absolute inset-0 opacity-[0.04]"}
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className={`login-card-anim relative z-10 w-full max-w-md mx-4 ${shake ? "login-shake" : ""}`}
        >
          <div
            className={"rounded-2xl border p-8"}
            style={{
              background: "rgba(15,23,42,0.92)",
              borderColor: "rgba(99,102,241,0.2)",
              boxShadow:
                "0 0 0 1px rgba(99,102,241,0.08), 0 24px 64px rgba(0,0,0,0.5), 0 4px 16px rgba(99,102,241,0.1)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className={"text-center mb-8"}>
              <div
                className={
                  "login-workspace-badge inline-flex items-center justify-center mb-4"
                }
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                {"IGA WORKSPACE"}
              </div>
              <h1
                className={"text-2xl font-semibold tracking-tight mb-1"}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: "#e2e8f0",
                }}
              >
                {"Sign In"}
              </h1>
              <p
                className={"text-sm"}
                style={{
                  color: "#94a3b8",
                }}
              >
                {
                  "Access your application onboarding workspace. Authorised users only."
                }
              </p>
            </div>
            {mode === "password" && (
              <form onSubmit={handlePasswordSubmit} noValidate={true}>
                <div className={"space-y-4"}>
                  <div>
                    <label
                      htmlFor={"lp-username"}
                      className={"block text-xs font-medium mb-1.5"}
                      style={{
                        color: "#94a3b8",
                      }}
                    >
                      {"Username"}
                    </label>
                    <input
                      id={"lp-username"}
                      type={"text"}
                      autoComplete={"username"}
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError(null);
                      }}
                      placeholder={"Enter your username"}
                      className={
                        "w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                      }
                      style={{
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#e2e8f0",
                      }}
                      data-ocid={"login.username.input"}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#6366f1";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={"lp-password"}
                      className={"block text-xs font-medium mb-1.5"}
                      style={{
                        color: "#94a3b8",
                      }}
                    >
                      {"Password"}
                    </label>
                    <div className={"relative"}>
                      <input
                        id={"lp-password"}
                        type={showPassword ? "text" : "password"}
                        autoComplete={"current-password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                        }}
                        placeholder={"Enter your password"}
                        className={
                          "w-full rounded-lg px-4 py-3 pr-11 text-sm outline-none transition-all"
                        }
                        style={{
                          background: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0",
                        }}
                        data-ocid={"login.password.input"}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#6366f1";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.1)";
                        }}
                      />
                      <button
                        type={"button"}
                        className={
                          "absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        }
                        style={{
                          color: "#64748b",
                        }}
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        data-ocid={"login.password_toggle.button"}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#818cf8";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#64748b";
                        }}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <p
                      className={"text-xs rounded-lg px-3 py-2"}
                      style={{
                        color: "#f87171",
                        background: "rgba(248,113,113,0.08)",
                        border: "1px solid rgba(248,113,113,0.2)",
                      }}
                      data-ocid={"login.error_state"}
                    >
                      {error}
                    </p>
                  )}
                  <button
                    type={"submit"}
                    disabled={loading}
                    className={
                      "w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all"
                    }
                    style={{
                      background: loading ? "#4338ca" : "#4f46e5",
                      color: "#ffffff",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading)
                        e.currentTarget.style.background = "#4338ca";
                    }}
                    onMouseLeave={(e) => {
                      if (!loading)
                        e.currentTarget.style.background = "#4f46e5";
                    }}
                    data-ocid={"login.submit_button"}
                  >
                    {loading ? (
                      <React.Fragment>
                        <Spinner />
                        {" Signing in…"}
                      </React.Fragment>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
              </form>
            )}
            {mode === "idp" && (
              <form onSubmit={handleIDPSubmit} noValidate={true}>
                <div className={"space-y-4"}>
                  {!idpConfig.enabled && (
                    <div
                      className={"rounded-lg px-4 py-3 text-xs"}
                      style={{
                        background: "rgba(251,191,36,0.07)",
                        border: "1px solid rgba(251,191,36,0.25)",
                        color: "#fbbf24",
                      }}
                      data-ocid={"login.idp_not_configured.error_state"}
                    >
                      {
                        "Enterprise IDP is not configured. Contact your administrator."
                      }
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor={"lp-idp-email"}
                      className={"block text-xs font-medium mb-1.5"}
                      style={{
                        color: "#94a3b8",
                      }}
                    >
                      {"Work Email"}
                    </label>
                    <input
                      id={"lp-idp-email"}
                      type={"email"}
                      autoComplete={"email"}
                      value={idpEmail}
                      onChange={(e) => {
                        setIdpEmail(e.target.value);
                        setError(null);
                      }}
                      placeholder={"you@company.com"}
                      className={
                        "w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                      }
                      style={{
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#e2e8f0",
                      }}
                      data-ocid={"login.idp_email.input"}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#6366f1";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                      }}
                    />
                  </div>
                  {error && (
                    <p
                      className={"text-xs rounded-lg px-3 py-2"}
                      style={{
                        color: "#f87171",
                        background: "rgba(248,113,113,0.08)",
                        border: "1px solid rgba(248,113,113,0.2)",
                      }}
                      data-ocid={"login.idp_error_state"}
                    >
                      {error}
                    </p>
                  )}
                  <button
                    type={"submit"}
                    disabled={loading || !idpConfig.enabled}
                    className={
                      "w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all"
                    }
                    style={{
                      background: !idpConfig.enabled
                        ? "#1e293b"
                        : loading
                          ? "#4338ca"
                          : "#4f46e5",
                      color: !idpConfig.enabled ? "#475569" : "#ffffff",
                      cursor:
                        !idpConfig.enabled || loading
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && idpConfig.enabled)
                        e.currentTarget.style.background = "#4338ca";
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && idpConfig.enabled)
                        e.currentTarget.style.background = "#4f46e5";
                    }}
                    data-ocid={"login.idp_submit_button"}
                  >
                    {loading ? (
                      <React.Fragment>
                        <Spinner />
                        {" Authenticating…"}
                      </React.Fragment>
                    ) : (
                      "Continue with IDP"
                    )}
                  </button>
                  <button
                    type={"button"}
                    className={
                      "w-full text-center text-xs transition-colors py-1"
                    }
                    style={{
                      color: "#64748b",
                    }}
                    onClick={() => switchMode("password")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#818cf8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#64748b";
                    }}
                    data-ocid={"login.back_to_password.button"}
                  >
                    {"← Back to password login"}
                  </button>
                </div>
              </form>
            )}
            {mode === "password" && (
              <div className={"mt-6 text-center"}>
                <div className={"flex items-center gap-3 mb-4"}>
                  <div
                    className={"flex-1 h-px"}
                    style={{
                      background: "rgba(255,255,255,0.07)",
                    }}
                  />
                  <span
                    className={"text-xs"}
                    style={{
                      color: "#475569",
                    }}
                  >
                    {"or"}
                  </span>
                  <div
                    className={"flex-1 h-px"}
                    style={{
                      background: "rgba(255,255,255,0.07)",
                    }}
                  />
                </div>
                <button
                  type={"button"}
                  className={"text-sm transition-colors font-medium"}
                  style={{
                    color: "#818cf8",
                  }}
                  onClick={() => switchMode("idp")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#a5b4fc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#818cf8";
                  }}
                  data-ocid={"login.use_idp.button"}
                >
                  {"Sign in with enterprise IDP →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
export { LoginPage };
