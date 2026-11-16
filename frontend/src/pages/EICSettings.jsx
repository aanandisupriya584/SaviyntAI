import { Card, CardContent } from "../components/ui/Card.jsx";
import { EICInstanceField } from "../components/settings/EICInstanceField.jsx";
import { loadSettings, saveSettings } from "../services/api.js";
import * as React from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
function SaviyntSettings() {
  const { currentUser } = useAuth();
  const authHeaders = React.useMemo(() => {
    if (!currentUser) return {};
    return {
      "X-Username": currentUser.username,
      "X-User-Role": currentUser.role,
    };
  }, [currentUser]);
  async function handleSaveSettings(instanceType, url, username, password) {
    const current = await loadSettings();
    const updated = {
      ...current,
      [instanceType]: {
        url,
        username,
        password,
        verified: true,
      },
    };
    await saveSettings(updated);
  }
  return (
    <div className={"w-full space-y-6 eic-page settings-page"}>
      <div className={"flex items-start justify-between gap-4"}>
        <div>
          <h1 className={"text-2xl font-bold text-foreground"}>
            {"Saviynt EIC Instance Configuration"}
          </h1>
          <p className={"mt-1 text-sm text-muted-foreground"}>
            {
              "Configure the Saviynt Enterprise Identity Cloud (EIC) instance connection. These settings are used globally for all endpoint registrations, JML operations, and onboarding workflows."
            }
          </p>
        </div>
        {null}
      </div>
      <EICInstanceField
        instanceType={"nonprod"}
        label={"Primary EIC Instance (Non-Production)"}
        description={
          "Your primary Saviynt EIC instance. Used for all endpoint registrations, entitlement creation, and JML (Joiner/Mover/Leaver) test cases throughout the application."
        }
        placeholder={"https://<yourcompany>-nonprod.saviyntcloud.com"}
        accentColor={"#2563eb"}
        accentBg={"rgba(37,99,235,0.04)"}
        accentBorder={"rgba(37,99,235,0.25)"}
        dataOcidPrefix={"saviynt_settings.nonprod"}
        authHeaders={authHeaders}
        onSaved={(url, username, password) =>
          handleSaveSettings("nonProd", url, username, password)
        }
      />
      <EICInstanceField
        instanceType={"prod"}
        label={"Secondary EIC Instance (Production)"}
        description={
          "Optional secondary instance. If configured, this instance can be used for production promotions. If not set, the Primary instance handles all operations."
        }
        placeholder={"https://<yourcompany>.saviyntcloud.com"}
        accentColor={"#4ade80"}
        accentBg={"rgba(74,222,128,0.04)"}
        accentBorder={"rgba(74,222,128,0.25)"}
        dataOcidPrefix={"saviynt_settings.prod"}
        authHeaders={authHeaders}
        onSaved={(url, username, password) =>
          handleSaveSettings("prod", url, username, password)
        }
      />
      <Card className={"rounded-xl border border-[#6366f1]/30 bg-[#6366f1]/5"}>
        <CardContent className={"pt-5 space-y-3"}>
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
                {"How EIC instances are used"}
              </p>
              <p className={"text-sm text-muted-foreground"}>
                {
                  "The primary instance is used for endpoint registration, entitlement creation, and Joiner, Mover, and Leaver testing. The optional secondary instance is used for production promotions."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export { SaviyntSettings };
