import { AIPatternBadge, OOTBBadge, StatusBadge } from "../common/Badges.jsx";
import { CustomIntegrationEndpoints } from "./CustomIntegrationEndpoints.jsx";
import { FormLabel } from "../common/FormLabel.jsx";
import { IntegrationSpecTab } from "./IntegrationSpecTab.jsx";
import { JMLScenario } from "./JMLScenario.jsx";
import {
  SAVIYNT_EIC_CONNECTOR,
  getConnectorCapability,
  getConnectorSchema,
} from "../../data/connectors.js";
import {
  SPEC_STATUS_LABELS,
  downloadSpecTemplate,
  formatBytes,
  jmlShouldPass,
} from "./documentUtils.js";
import { SchemaTab } from "./SchemaTab.jsx";
import {
  buildDefaultParams,
  buildEmptyInputs,
} from "../../utils/applicationDefaults.js";
import { isLocalMode, uploadDocument } from "../../services/api.js";
import * as React from "react";
import {
  runAIAssessment,
  simulateConnectionTest,
} from "../../services/assessment.js";
import { useTheme } from "../../contexts/ThemeContext.jsx";
function ApplicationDetailsModal({
  app,
  initialTab = 0,
  onTabChange,
  onClose,
  onUpdate,
}) {
  var _a2;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1424" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const titleColor = isDark ? "#fff" : "#0f172a";
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const mutedColor = isDark ? "#9ca3af" : "#64748b";
  const dimColor = isDark ? "#4b5563" : "#94a3b8";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const INPUT = {
    width: "100%",
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: 6,
    padding: "8px 12px",
    color: textColor,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: '"DM Sans", sans-serif',
  };
  const schema = getConnectorSchema(app.name);
  const [tab, setTab] = React.useState(initialTab);
  const [instanceType, setInstanceType] = React.useState(app.instanceType);
  const defaultConnectorId = (() => {
    var _a3, _b2;
    if (app.connectorType) return app.connectorType;
    if (
      ((_a3 = app.aiAssessment) == null ? void 0 : _a3.appType) ===
      "OOTB Connector"
    ) {
      return SAVIYNT_EIC_CONNECTOR.id;
    }
    return ((_b2 = schema.connectorTypes[0]) == null ? void 0 : _b2.id) ?? "";
  })();
  const [connectorType, setConnectorType] = React.useState(defaultConnectorId);
  const [paramsPrefilled, setParamsPrefilled] = React.useState(false);
  const [params, setParams] = React.useState(app.connectionParams ?? {});
  const [owner, setOwner] = React.useState(app.owner);
  const [ownerEmail, setOwnerEmail] = React.useState(app.ownerEmail);
  const [businessOwner, setBusinessOwner] = React.useState(app.businessOwner);
  const [businessOwnerEmail, setBusinessOwnerEmail] = React.useState(
    app.businessOwnerEmail,
  );
  const [localAssessment, setLocalAssessment] = React.useState(
    app.aiAssessment,
  );
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState(null);
  const [copyFeedback, setCopyFeedback] = React.useState(false);
  const initCapability =
    ((_a2 = app.aiAssessment) == null ? void 0 : _a2.integrationPattern) ===
    "OOTB"
      ? getConnectorCapability(app.name)
      : null;
  const [editableAttrs, setEditableAttrs] = React.useState(
    () =>
      (initCapability == null
        ? void 0
        : initCapability.schemaAttributes.map((a) => ({
            ...a,
          }))) ?? [],
  );
  const [schemaAdditionalNotes, setSchemaAdditionalNotes] = React.useState("");
  const [jmlTests, setJmlTests] = React.useState(
    app.jmlTests ?? {
      joiner: null,
      mover: null,
      leaver: null,
    },
  );
  const [jmlRunning, setJmlRunning] = React.useState({});
  const [endpointRegistered, setEndpointRegistered] = React.useState(
    app.saviyntEndpointRegistered ?? false,
  );
  const [endpointRegisteredAt, setEndpointRegisteredAt] = React.useState(
    app.saviyntEndpointRegisteredAt,
  );
  const [endpointRegistering, setEndpointRegistering] = React.useState(false);
  const [endpointRegError, setEndpointRegError] = React.useState(null);
  const [joinerInputs, setJoinerInputs] = React.useState(() =>
    buildEmptyInputs(
      (initCapability == null ? void 0 : initCapability.schemaAttributes) ?? [],
    ),
  );
  const [moverInputs, setMoverInputs] = React.useState(() =>
    buildEmptyInputs(
      (initCapability == null ? void 0 : initCapability.schemaAttributes) ?? [],
    ),
  );
  const [leaverInputs, setLeaverInputs] = React.useState(() =>
    buildEmptyInputs(
      (initCapability == null ? void 0 : initCapability.schemaAttributes) ?? [],
    ),
  );
  const fileInputRef = React.useRef(null);
  const [specDoc, setSpecDoc] = React.useState(app.specDocument ?? null);
  const [revisionComment, setRevisionComment] = React.useState("");
  const [showRevisionInput, setShowRevisionInput] = React.useState(false);
  const [revisionError, setRevisionError] = React.useState("");
  const activeConnector =
    connectorType === SAVIYNT_EIC_CONNECTOR.id
      ? SAVIYNT_EIC_CONNECTOR
      : (schema.connectorTypes.find((c) => c.id === connectorType) ??
        schema.connectorTypes[0]);
  const CRIT = {
    critical: "#f87171",
    high: "#f59e0b",
    medium: "#60a5fa",
    low: "#6b7280",
  };
  function handleCopyConfig() {
    const config = {
      connectorName:
        (activeConnector == null ? void 0 : activeConnector.label) ??
        connectorType,
      instanceType,
      parameters: params,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2e3);
    });
  }
  async function handleTestConnection() {
    setIsTesting(true);
    setTestResult(null);
    const result = await simulateConnectionTest(params, activeConnector);
    setTestResult(result);
    setIsTesting(false);
    if (result.success) {
      onUpdate(app.id, {
        connectionTestPassed: true,
        connectionParams: params,
      });
    } else {
      onUpdate(app.id, {
        connectionTestPassed: false,
        connectionParams: params,
      });
    }
  }
  const handleAnalyze = React.useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = runAIAssessment(app);
      onUpdate(app.id, {
        aiAssessment: result,
      });
      setLocalAssessment(result);
      if (result.integrationPattern === "OOTB") {
        const cap = getConnectorCapability(app.name);
        if (cap) {
          const attrs = cap.schemaAttributes.map((a) => ({
            ...a,
          }));
          setEditableAttrs(attrs);
          const empty = buildEmptyInputs(attrs);
          setJoinerInputs({
            ...empty,
          });
          setMoverInputs({
            ...empty,
          });
          setLeaverInputs({
            ...empty,
          });
        }
      }
      setIsAnalyzing(false);
    }, 1500);
  }, [app, onUpdate]);
  function handleSave() {
    onUpdate(app.id, {
      instanceType,
      connectorType,
      connectionParams: params,
      connectionTestPassed:
        testResult != null ? testResult.success : app.connectionTestPassed,
      owner,
      ownerEmail,
      businessOwner,
      businessOwnerEmail,
      jmlTests,
      specDocument: specDoc,
      saviyntEndpointRegistered: endpointRegistered,
      saviyntEndpointRegisteredAt: endpointRegisteredAt,
    });
    onClose();
  }
  async function registerEndpoint() {
    setEndpointRegistering(true);
    setEndpointRegError(null);
    const applicationData = {
      applicationName: app.name,
      displayName: app.name,
      description: `Saviynt IGA onboarding — ${app.department} | ${app.protocol}`,
      connectorType:
        app.connectorType ||
        (activeConnector == null ? void 0 : activeConnector.label) ||
        app.protocol,
      instanceType: app.instanceType,
      department: app.department,
      owner: app.owner,
      ownerEmail: app.ownerEmail,
      connectionParams: params,
    };
    try {
      const regRes = await fetch("/api/saviynt/register-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          environment: "nonprod",
          applicationData,
        }),
      });
      const regCT = regRes.headers.get("content-type") ?? "";
      if (regCT.includes("text/html")) {
        const htmlSnippet = await regRes.text().catch(() => "");
        setEndpointRegError(`Registration failed: Server returned an HTML page — check your Saviynt Non-prod instance URL.

Preview: ${htmlSnippet.slice(0, 200)}`);
        setEndpointRegistering(false);
        return;
      }
      let regJson;
      try {
        regJson = await regRes.json();
      } catch {
        const rawText = await regRes.text().catch(() => "");
        setEndpointRegError(`Registration failed: Could not parse server response.

Raw: ${rawText.slice(0, 300)}`);
        setEndpointRegistering(false);
        return;
      }
      if (
        !regRes.ok ||
        (regJson.errorCode &&
          regJson.errorCode !== "0" &&
          regJson.errorCode !== "")
      ) {
        const reason =
          regJson.error ??
          regJson.errorMessage ??
          regJson.message ??
          `HTTP ${regRes.status} ${regRes.statusText}`;
        setEndpointRegError(`Registration failed: ${reason}

Full response:
${JSON.stringify(regJson, null, 2)}`);
        setEndpointRegistering(false);
        return;
      }
      const registeredAt = new Date().toISOString();
      setEndpointRegistered(true);
      // Auto-setup mandatory Saviynt artifacts for JML
      fetch("/api/saviynt/post-registration-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          environment: "nonprod",
          applicationName: app.name,
          securitySystem: app.name,
        }),
      })
        .then((r) => r.json())
        .then((r) => {
          if (r.success)
            console.log("[post-reg] Mandatory artifacts created:", r.summary);
          else
            console.warn(
              "[post-reg] Some artifacts may need manual creation:",
              r.error,
            );
        })
        .catch((e) => console.warn("[post-reg] Setup call failed:", e.message));
      setEndpointRegisteredAt(registeredAt);
      onUpdate(app.id, {
        saviyntEndpointRegistered: true,
        saviyntEndpointRegisteredAt: registeredAt,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setEndpointRegError(
        msg.toLowerCase().includes("failed to fetch")
          ? "Could not reach local server — is the app running?"
          : `Network error: ${msg}`,
      );
    } finally {
      setEndpointRegistering(false);
    }
  }
  async function runJml(scenario) {
    var _a3, _b2, _c2, _d2, _e2;
    setJmlRunning((p) => ({
      ...p,
      [scenario]: true,
    }));
    const inputs =
      scenario === "joiner"
        ? joinerInputs
        : scenario === "mover"
          ? moverInputs
          : leaverInputs;
    let hasEIC = false;
    try {
      const settingsRes = await fetch("/api/saviynt/settings");
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        hasEIC = !!(
          ((_a3 = s.nonProd) == null ? void 0 : _a3.url) &&
          ((_b2 = s.nonProd) == null ? void 0 : _b2.username) &&
          ((_c2 = s.nonProd) == null ? void 0 : _c2.password)
        );
      }
    } catch {}
    if (!hasEIC) {
      await new Promise((r2) => setTimeout(r2, 900));
      const pass = jmlShouldPass(app.name, scenario);
      const connLabel =
        (activeConnector == null ? void 0 : activeConnector.label) ?? app.name;
      let message = "";
      if (scenario === "joiner") {
        message = pass
          ? `User provisioned successfully in ${connLabel}`
          : "Provisioning failed: account creation blocked by entitlement policy";
      } else if (scenario === "mover") {
        const f = inputs.fromDept ?? inputs["From Dept"] ?? "Source Dept";
        const t = inputs.toDept ?? inputs["To Dept"] ?? "Target Dept";
        message = pass
          ? `Role transferred: ${f} → ${t}`
          : "Transfer failed: insufficient permissions in target department";
      } else {
        const u =
          inputs.username ??
          inputs.user_name ??
          inputs.Username ??
          inputs.login ??
          inputs.UserName ??
          "User";
        message = pass
          ? `User ${u} deprovisioned from ${connLabel}`
          : "Deprovisioning failed: active sessions still detected";
      }
      const result = {
        status: pass ? "pass" : "fail",
        message,
        testedAt: new Date().toISOString(),
        inputs,
        isLiveProvisioning: false,
      };
      setJmlTests((p) => ({
        ...p,
        [scenario]: result,
      }));
      setJmlRunning((p) => ({
        ...p,
        [scenario]: false,
      }));
      return;
    }
    try {
      if (scenario === "joiner") {
        const timestamp = Date.now();
        const baseUsername =
          inputs.username ??
          inputs.user_name ??
          inputs.Username ??
          inputs.login ??
          "testuser";
        const provisionedUsername = `${app.name.replace(/\s+/g, "_").toLowerCase()}_${baseUsername}_${timestamp}`;
        try {
          const res = await fetch("/api/saviynt/jml", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              environment: "nonprod",
              action: "joiner",
              payload: {
                username: provisionedUsername,
                firstname:
                  inputs.firstname ??
                  inputs.first_name ??
                  inputs.FirstName ??
                  inputs["First Name"] ??
                  "Test",
                lastname:
                  inputs.lastname ??
                  inputs.last_name ??
                  inputs.LastName ??
                  inputs["Last Name"] ??
                  "User",
                email:
                  inputs.email ??
                  inputs.Email ??
                  `${provisionedUsername}@test.local`,
                systemUserName: provisionedUsername,
                endpointname: app.name.replace(/\s+/g, "_"),
                securitysystem: app.name.replace(/\s+/g, "_"),
                department: inputs.department ?? inputs.Department ?? "IT",
                manager: inputs.manager ?? inputs.Manager ?? "",
                userAttributes: {
                  ...inputs,
                },
              },
            }),
          });
          const resText = await res.text();
          if (!res.ok) {
            const result = {
              status: "fail",
              message: `Joiner provisioning failed — HTTP ${res.status}`,
              testedAt: new Date().toISOString(),
              inputs,
              isLiveProvisioning: true,
              rawError: `POST /api/saviynt/jml (joiner)
HTTP ${res.status}

${resText}`,
            };
            setJmlTests((p) => ({
              ...p,
              joiner: result,
            }));
          } else {
            const result = {
              status: "pass",
              message: `User provisioned successfully in ${(activeConnector == null ? void 0 : activeConnector.label) ?? app.name}`,
              testedAt: new Date().toISOString(),
              inputs,
              isLiveProvisioning: true,
              provisionedUsername,
            };
            setJmlTests((p) => ({
              ...p,
              joiner: result,
            }));
            setMoverInputs((p) => ({
              ...p,
              username: provisionedUsername,
            }));
            setLeaverInputs((p) => ({
              ...p,
              username: provisionedUsername,
            }));
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const result = {
            status: "fail",
            message: msg.toLowerCase().includes("failed to fetch")
              ? "Could not reach local server — is the app running?"
              : `Joiner provisioning failed — ${msg}`,
            testedAt: new Date().toISOString(),
            inputs,
            isLiveProvisioning: true,
            rawError: `POST /api/saviynt/jml (joiner)
Network error: ${msg}`,
          };
          setJmlTests((p) => ({
            ...p,
            joiner: result,
          }));
        }
      } else if (scenario === "mover") {
        const username =
          inputs.username ??
          inputs.user_name ??
          inputs.Username ??
          ((_d2 = jmlTests.joiner) == null
            ? void 0
            : _d2.provisionedUsername) ??
          "testuser";
        try {
          const res = await fetch("/api/saviynt/jml", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              environment: "nonprod",
              action: "mover",
              payload: {
                username,
                endpointname: app.name.replace(/\s+/g, "_"),
                securitysystem: app.name.replace(/\s+/g, "_"),
                department: inputs.department ?? inputs.Department ?? "IT",
                manager: inputs.manager ?? inputs.Manager ?? "",
                userAttributes: {
                  ...inputs,
                },
              },
            }),
          });
          const resText = await res.text();
          if (!res.ok) {
            const result = {
              status: "fail",
              message: `Mover update failed — HTTP ${res.status}`,
              testedAt: new Date().toISOString(),
              inputs,
              isLiveProvisioning: true,
              rawError: `POST /api/saviynt/jml (mover)
HTTP ${res.status}

${resText}`,
            };
            setJmlTests((p) => ({
              ...p,
              mover: result,
            }));
          } else {
            const f =
              inputs.fromDept ??
              inputs["From Dept"] ??
              inputs.department ??
              "Source Dept";
            const t =
              inputs.toDept ??
              inputs["To Dept"] ??
              inputs.Department ??
              "Target Dept";
            const result = {
              status: "pass",
              message: `Role transferred: ${f} → ${t}`,
              testedAt: new Date().toISOString(),
              inputs,
              isLiveProvisioning: true,
              provisionedUsername: username,
            };
            setJmlTests((p) => ({
              ...p,
              mover: result,
            }));
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const result = {
            status: "fail",
            message: msg.toLowerCase().includes("failed to fetch")
              ? "Could not reach local server — is the app running?"
              : `Mover update failed — ${msg}`,
            testedAt: new Date().toISOString(),
            inputs,
            isLiveProvisioning: true,
            rawError: `POST /api/saviynt/jml (mover)
Network error: ${msg}`,
          };
          setJmlTests((p) => ({
            ...p,
            mover: result,
          }));
        }
      } else {
        const username =
          inputs.username ??
          inputs.user_name ??
          inputs.Username ??
          ((_e2 = jmlTests.joiner) == null
            ? void 0
            : _e2.provisionedUsername) ??
          "testuser";
        try {
          const res = await fetch("/api/saviynt/jml", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              environment: "nonprod",
              action: "leaver",
              payload: {
                username,
                endpointname: app.name.replace(/\s+/g, "_"),
                securitysystem: app.name.replace(/\s+/g, "_"),
              },
            }),
          });
          const resText = await res.text();
          const connLabel =
            (activeConnector == null ? void 0 : activeConnector.label) ??
            app.name;
          if (!res.ok) {
            const result = {
              status: "fail",
              message: `Leaver deprovisioning failed — HTTP ${res.status}`,
              testedAt: new Date().toISOString(),
              inputs,
              isLiveProvisioning: true,
              rawError: `POST /api/saviynt/jml (leaver)
HTTP ${res.status}

${resText}`,
            };
            setJmlTests((p) => ({
              ...p,
              leaver: result,
            }));
          } else {
            const result = {
              status: "pass",
              message: `User ${username} deprovisioned from ${connLabel}`,
              testedAt: new Date().toISOString(),
              inputs,
              isLiveProvisioning: true,
              provisionedUsername: username,
            };
            setJmlTests((p) => ({
              ...p,
              leaver: result,
            }));
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const result = {
            status: "fail",
            message: msg.toLowerCase().includes("failed to fetch")
              ? "Could not reach local server — is the app running?"
              : `Leaver deprovisioning failed — ${msg}`,
            testedAt: new Date().toISOString(),
            inputs,
            isLiveProvisioning: true,
            rawError: `POST /api/saviynt/jml (leaver)
Network error: ${msg}`,
          };
          setJmlTests((p) => ({
            ...p,
            leaver: result,
          }));
        }
      }
    } catch (unexpectedErr) {
      const msg =
        unexpectedErr instanceof Error
          ? unexpectedErr.message
          : String(unexpectedErr);
      const result = {
        status: "fail",
        message: `Unexpected error — ${msg}`,
        testedAt: new Date().toISOString(),
        inputs,
        isLiveProvisioning: true,
        rawError: msg,
      };
      setJmlTests((p) => ({
        ...p,
        [scenario]: result,
      }));
    }
    setJmlRunning((p) => ({
      ...p,
      [scenario]: false,
    }));
  }
  function generateTestData() {
    const sampleValues = {
      // Generic name patterns
      firstname: "John",
      first_name: "John",
      "First Name": "John",
      FirstName: "John",
      lastname: "Doe",
      last_name: "Doe",
      "Last Name": "Doe",
      LastName: "Doe",
      name: "John Doe",
      displayname: "John Doe",
      displayName: "John Doe",
      // Email / username
      email: "john.doe@acme.com",
      Email: "john.doe@acme.com",
      username: "jdoe",
      user_name: "jdoe",
      Username: "jdoe",
      UserName: "jdoe",
      login: "jdoe",
      Login: "jdoe",
      Alias: "jdoe",
      // IDs
      employeeid: "EMP-0042",
      employeeId: "EMP-0042",
      employeeNumber: "EMP-0042",
      "Employee Number": "EMP-0042",
      "User ID": "USR-1042",
      userId: "USR-1042",
      UserId: "USR-1042",
      accountId: "ACCT-77421",
      id: "UID-0042",
      USER_ID: "1042",
      USERNAME: "jdoe",
      // Org / Dept
      department: "Engineering",
      Department: "Engineering",
      dept: "Engineering",
      "Company Code": "ACME",
      companyCode: "ACME",
      CompanyName: "Acme Corp",
      "Org Unit": "ENG-DEPT",
      supervisoryOrg: "Software Engineering",
      division: "Technology",
      Division: "Technology",
      // Job / Role
      title: "Senior Engineer",
      Title: "Senior Engineer",
      jobtitle: "Senior Engineer",
      jobTitle: "Senior Engineer",
      "Job Title": "Senior Engineer",
      businessTitle: "Senior Software Engineer",
      positionId: "POS-1234",
      Position: "Senior Engineer",
      role: "User",
      Role: "User",
      role_name: "Member",
      userType: "Employee",
      UserType: "Standard",
      workerType: "Employee",
      accountType: "atlassian",
      // Manager
      manager: "jane.smith@acme.com",
      Manager: "Jane Smith",
      managerId: "MGR-0009",
      // Cost / Finance
      costcenter: "CC-100",
      costCenter: "CC-100",
      "Cost Center": "CC-100",
      // Dates
      startdate: "2026-01-15",
      startDate: "2026-01-15",
      enddate: "2026-12-31",
      endDate: "2026-12-31",
      terminationDate: "2026-12-31",
      "Termination Date": "2026-12-31",
      // Location
      location: "New York, NY",
      Location: "New York, NY",
      Plant: "US-NY-001",
      // Flags
      active: "true",
      IsActive: "true",
      "Is Active": "true",
      status: "active",
      ACCOUNT_STATUS: "OPEN",
      "Lock Status": "false",
      locked_out: "false",
      // Misc
      phone: "+1-555-0100",
      phone_number: "+1-555-0100",
      MobilePhone: "+1-555-0100",
      mobile_phone: "+1-555-0199",
      timezone: "America/New_York",
      timeZone: "America/New_York",
      TimeZoneSidKey: "America/New_York",
      locale: "en_US",
      LocaleSidKey: "en_US",
      LanguageLocaleKey: "en",
      language: "en-US",
      organization: "Acme Corp",
      company: "Acme Corp",
      Company: "Acme Corp",
      ProfileId: "PROF-STANDARD-001",
      RoleId: "ROLE-USER-001",
      FederationIdentifier: "ACME\\jdoe",
      "Authorization Group": "USR-GRP-01",
      "Communication Type": "A",
      "SNC Name": "p:CN=jdoe,OU=Users,DC=acme,DC=com",
      type: "2",
      ARN: "arn:aws:iam::123456789012:user/jdoe",
      Path: "/",
      UserPrincipalName: "jdoe@acme.com",
      LoginName: "jdoe@acme.com",
      IsSiteAdmin: "false",
      PrincipalType: "User",
      timeType: "Full-time",
      payGroup: "WEEKLY",
      workShift: "DAY",
      // Fallback for lists
      "groups[]": "All Users",
      "roles[]": "User",
      "applicationRoles[]": "software-developer",
      "organizations[]": "acme-corp",
      "teams[]": "engineering",
      "repositories[]": "acme/backend",
    };
    function guessValue(attrName) {
      if (sampleValues[attrName]) return sampleValues[attrName];
      const lower = attrName.toLowerCase().replace(/[\[\]\s_]/g, "");
      for (const [k, v] of Object.entries(sampleValues)) {
        if (k.toLowerCase().replace(/[\[\]\s_]/g, "") === lower) return v;
      }
      if (/email/i.test(attrName)) return "john.doe@acme.com";
      if (/first/i.test(attrName)) return "John";
      if (/last/i.test(attrName)) return "Doe";
      if (/name/i.test(attrName)) return "John Doe";
      if (/user|login|account/i.test(attrName)) return "jdoe";
      if (/dept|department/i.test(attrName)) return "Engineering";
      if (/role|profile/i.test(attrName)) return "User";
      if (/date|time$/i.test(attrName)) return "2026-01-15";
      if (/phone|mobile/i.test(attrName)) return "+1-555-0100";
      if (/id$/i.test(attrName)) return "ID-0042";
      if (/status|active|lock/i.test(attrName)) return "active";
      if (/cost|center/i.test(attrName)) return "CC-100";
      if (/manager|mgr/i.test(attrName)) return "jane.smith@acme.com";
      if (/company|org/i.test(attrName)) return "Acme Corp";
      if (/location|site/i.test(attrName)) return "New York, NY";
      if (/title|position/i.test(attrName)) return "Senior Engineer";
      return "sample-value";
    }
    const attrs =
      editableAttrs.length > 0
        ? editableAttrs
        : [
            {
              name: "username",
              type: "String",
              description: "",
              required: true,
            },
            {
              name: "email",
              type: "String",
              description: "",
              required: true,
            },
            {
              name: "department",
              type: "String",
              description: "",
              required: false,
            },
            {
              name: "role",
              type: "String",
              description: "",
              required: false,
            },
          ];
    const joiner = Object.fromEntries(
      attrs.map((a) => [a.name, guessValue(a.name)]),
    );
    const mover = Object.fromEntries(
      attrs.map((a) => [a.name, guessValue(a.name)]),
    );
    const leaver = Object.fromEntries(
      attrs.map((a) => [a.name, guessValue(a.name)]),
    );
    if ("department" in mover) mover.department = "Product";
    if ("dept" in mover) mover.dept = "Product";
    if ("Department" in mover) mover.Department = "Product";
    if ("role" in mover) mover.role = "Senior User";
    if ("Role" in mover) mover.Role = "Senior User";
    if ("jobTitle" in mover) mover.jobTitle = "Staff Engineer";
    if ("Title" in mover) mover.Title = "Staff Engineer";
    const endDateKey = Object.keys(leaver).find((k) =>
      /end.?date|termination/i.test(k),
    );
    if (endDateKey) leaver[endDateKey] = "2026-06-30";
    if ("status" in leaver) leaver.status = "inactive";
    if ("ACCOUNT_STATUS" in leaver) leaver.ACCOUNT_STATUS = "LOCKED";
    if ("active" in leaver) leaver.active = "false";
    if ("IsActive" in leaver) leaver.IsActive = "false";
    if ("Lock Status" in leaver) leaver["Lock Status"] = "true";
    setJoinerInputs(joiner);
    setMoverInputs(mover);
    setLeaverInputs(leaver);
  }
  async function handleFileUpload(e) {
    var _a3;
    const file = (_a3 = e.target.files) == null ? void 0 : _a3[0];
    if (!file) return;
    let serverPath;
    if (isLocalMode()) {
      const result = await uploadDocument(file);
      if (result) serverPath = result.path;
    }
    const event = {
      action: "uploaded",
      by: app.owner || "App Owner",
      at: new Date().toISOString(),
    };
    setSpecDoc({
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      uploadedBy: app.owner || "App Owner",
      size: file.size,
      status: "pending_review",
      history: [event],
      ...(serverPath
        ? {
            serverPath,
          }
        : {}),
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  function handleApprove() {
    if (!specDoc) return;
    const event = {
      action: "approved",
      by: "IGA Admin",
      at: new Date().toISOString(),
    };
    setSpecDoc((d) =>
      d
        ? {
            ...d,
            status: "approved",
            approvedAt: new Date().toISOString(),
            approvedBy: "IGA Admin",
            history: [...d.history, event],
          }
        : null,
    );
    setShowRevisionInput(false);
  }
  function handleRequestRevisions() {
    if (revisionComment.trim().length < 10) {
      setRevisionError("Comment must be at least 10 characters.");
      return;
    }
    const event = {
      action: "revisions_requested",
      by: "IGA Admin",
      at: new Date().toISOString(),
      comment: revisionComment.trim(),
    };
    setSpecDoc((d) =>
      d
        ? {
            ...d,
            status: "revisions_requested",
            revisionComment: revisionComment.trim(),
            history: [...d.history, event],
          }
        : null,
    );
    setRevisionError("");
    setRevisionComment("");
    setShowRevisionInput(false);
  }
  const jmlPassCount = [
    jmlTests.joiner,
    jmlTests.mover,
    jmlTests.leaver,
  ].filter((t) => (t == null ? void 0 : t.status) === "pass").length;
  const jmlPct = Math.round((jmlPassCount / 3) * 100);
  const TABS = [
    {
      label: "Overview",
      ocid: "details.tab.overview",
    },
    {
      label: "Connection Parameters",
      ocid: "details.tab.connection",
    },
    {
      label: "Schema & Roles",
      ocid: "details.tab.schema",
    },
    {
      label: "Lifecycle",
      ocid: "details.tab.lifecycle",
    },
    {
      label: "Ownership",
      ocid: "details.tab.ownership",
    },
    {
      label: localAssessment ? "AI Assessment" : "AI Assessment",
      ocid: "details.tab.ai",
    },
    {
      label: specDoc ? "Integration Spec" : "Integration Spec",
      ocid: "details.tab.spec",
    },
  ];
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 1e3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role={"presentation"}
    >
      <div
        style={{
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 14,
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: titleColor,
                }}
              >
                {app.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: dimColor,
                  marginTop: 2,
                }}
              >
                {app.department}
                {" · Application Details"}
              </div>
            </div>
            <OOTBBadge
              hasOOTB={schema.hasOOTB}
              integrationPattern={
                localAssessment == null
                  ? void 0
                  : localAssessment.integrationPattern
              }
              isDark={isDark}
            />
          </div>
          <button
            type={"button"}
            data-ocid={"details.close_button"}
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: dimColor,
              cursor: "pointer",
              fontSize: 22,
              lineHeight: 1,
            }}
            aria-label={"Close"}
          >
            {"×"}
          </button>
        </div>
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${border}`,
            padding: "0 24px",
            flexShrink: 0,
            overflowX: "auto",
          }}
        >
          {TABS.map(({ label, ocid }, i) => (
            <button
              type={"button"}
              data-ocid={ocid}
              onClick={() => {
                setTab(i);
                onTabChange?.(i);
              }}
              style={{
                padding: "10px 14px",
                background: "none",
                border: "none",
                borderBottom:
                  tab === i ? "2px solid #6366f1" : "2px solid transparent",
                color: tab === i ? "#818cf8" : isDark ? "#6b7280" : "#94a3b8",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: tab === i ? 600 : 400,
                whiteSpace: "nowrap",
              }}
              key={ocid}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          style={{
            padding: 24,
            overflow: "auto",
            flex: 1,
          }}
        >
          {tab === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  ["Application", app.name],
                  ["Department", app.department],
                  ["Owner", app.owner],
                  ["Owner Email", app.ownerEmail],
                  ["Business Owner", app.businessOwner],
                  ["Protocol", app.protocol],
                ].map(([k, v]) => (
                  <div
                    style={{
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                    key={k}
                  >
                    <FormLabel label={k} muted={dimColor} />
                    <div
                      style={{
                        fontSize: 13,
                        color: textColor,
                        fontWeight: 500,
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
              {specDoc && (
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {""}
                  </span>
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: textColor,
                      }}
                    >
                      {specDoc.fileName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: dimColor,
                      }}
                    >
                      {formatBytes(specDoc.size)}
                      {" ·"} {new Date(specDoc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 9px",
                      borderRadius: 5,
                      background: `${SPEC_STATUS_LABELS[specDoc.status].color}22`,
                      color: SPEC_STATUS_LABELS[specDoc.status].color,
                      fontWeight: 600,
                    }}
                  >
                    {SPEC_STATUS_LABELS[specDoc.status].label}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <StatusBadge status={app.status} />
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 9px",
                    borderRadius: 5,
                    background: `${CRIT[app.criticality]}20`,
                    color: CRIT[app.criticality],
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {app.criticality}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 9px",
                    borderRadius: 5,
                    background: "rgba(99,102,241,0.12)",
                    color: "#818cf8",
                    fontFamily: "IBM Plex Mono, monospace",
                  }}
                >
                  {app.protocol}
                </span>
                <OOTBBadge
                  hasOOTB={schema.hasOOTB}
                  integrationPattern={
                    localAssessment == null
                      ? void 0
                      : localAssessment.integrationPattern
                  }
                  isDark={isDark}
                />
                {localAssessment && (
                  <AIPatternBadge
                    pattern={localAssessment.integrationPattern}
                  />
                )}
              </div>
              {localAssessment && (
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <FormLabel label={"Connector"} muted={dimColor} />
                    <div
                      style={{
                        fontSize: 12,
                        color: textColor,
                        fontWeight: 600,
                      }}
                    >
                      {localAssessment.connectorName}
                    </div>
                  </div>
                  <div>
                    <FormLabel label={"Effort Estimate"} muted={dimColor} />
                    <div
                      style={{
                        fontSize: 12,
                        color: textColor,
                        fontWeight: 600,
                      }}
                    >
                      {localAssessment.effortEstimate}
                    </div>
                  </div>
                  <div>
                    <FormLabel label={"App Type"} muted={dimColor} />
                    <div
                      style={{
                        fontSize: 12,
                        color: textColor,
                      }}
                    >
                      {localAssessment.appType}
                    </div>
                  </div>
                </div>
              )}
              {schema.hasOOTB ? (
                <div
                  style={{
                    background: "rgba(74,222,128,0.06)",
                    border: "1px solid rgba(74,222,128,0.18)",
                    borderRadius: 8,
                    padding: "12px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#4ade80",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {"Saviynt OOTB Connector Available"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: mutedColor,
                    }}
                  >
                    {
                      "This application has a certified OOTB connector in Saviynt Exchange. No custom development is required."
                    }
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: "rgba(107,114,128,0.08)",
                    border: "1px solid rgba(107,114,128,0.18)",
                    borderRadius: 8,
                    padding: "12px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: mutedColor,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {"Custom Connector Required"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: dimColor,
                    }}
                  >
                    {
                      "No OOTB connector available. A custom connector will need to be developed. Use the AI Assessment tab to evaluate complexity."
                    }
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === 1 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: mutedColor,
                    fontWeight: 500,
                  }}
                >
                  {"Environment:"}
                </span>
                <div
                  style={{
                    display: "flex",
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    padding: 3,
                    gap: 2,
                  }}
                >
                  {["non-prod", "prod"].map((env) => (
                    <button
                      type={"button"}
                      data-ocid={`details.env_${env}_toggle`}
                      onClick={() => setInstanceType(env)}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          instanceType === env
                            ? env === "prod"
                              ? "#6366f1"
                              : "rgba(96,165,250,0.25)"
                            : "transparent",
                        color:
                          instanceType === env
                            ? env === "prod"
                              ? "#fff"
                              : "#60a5fa"
                            : mutedColor,
                        transition: "all 0.15s",
                      }}
                      key={env}
                    >
                      {env === "non-prod" ? "Non-Prod" : "Production"}
                    </button>
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 9px",
                    borderRadius: 5,
                    background:
                      instanceType === "prod"
                        ? "rgba(99,102,241,0.15)"
                        : "rgba(96,165,250,0.12)",
                    color: instanceType === "prod" ? "#818cf8" : "#60a5fa",
                    fontWeight: 600,
                  }}
                >
                  {instanceType === "prod" ? "Production" : "Non-Production"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div>
                  <FormLabel
                    label={"Saviynt Connector / Driver"}
                    muted={dimColor}
                  />
                  <select
                    data-ocid={"details.connector_type_select"}
                    value={connectorType}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setConnectorType(newId);
                      setTestResult(null);
                      const newConnector =
                        newId === SAVIYNT_EIC_CONNECTOR.id
                          ? SAVIYNT_EIC_CONNECTOR
                          : (schema.connectorTypes.find(
                              (c) => c.id === newId,
                            ) ?? schema.connectorTypes[0]);
                      if (newConnector) {
                        const defaults = buildDefaultParams(newConnector);
                        setParams(defaults);
                        setParamsPrefilled(Object.keys(defaults).length > 0);
                      } else {
                        setParams({});
                        setParamsPrefilled(false);
                      }
                    }}
                    style={{
                      ...INPUT,
                      cursor: "pointer",
                    }}
                  >
                    {schema.connectorTypes.map((ct) => (
                      <option value={ct.id} key={ct.id}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <button
                    type={"button"}
                    data-ocid={"details.copy_config_button"}
                    onClick={handleCopyConfig}
                    style={{
                      background: copyFeedback
                        ? "rgba(74,222,128,0.15)"
                        : isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.04)",
                      border: `1px solid ${copyFeedback ? "rgba(74,222,128,0.35)" : isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
                      borderRadius: 6,
                      padding: "7px 14px",
                      color: copyFeedback ? "#4ade80" : mutedColor,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {copyFeedback ? "Copied!" : "⍘ Copy Config"}
                  </button>
                  <button
                    type={"button"}
                    data-ocid={"details.test_connection_button"}
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    style={{
                      background: isTesting
                        ? "rgba(99,102,241,0.08)"
                        : "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.35)",
                      borderRadius: 6,
                      padding: "7px 14px",
                      color: isTesting ? mutedColor : "#818cf8",
                      cursor: isTesting ? "not-allowed" : "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {isTesting ? (
                      <React.Fragment>
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            border: "2px solid rgba(99,102,241,0.3)",
                            borderTopColor: "#818cf8",
                            borderRadius: "50%",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        {"Testing..."}
                      </React.Fragment>
                    ) : (
                      "Test Connection"
                    )}
                  </button>
                </div>
                {testResult && (
                  <div
                    data-ocid={
                      testResult.success
                        ? "details.test_success_state"
                        : "details.test_error_state"
                    }
                    style={{
                      background: testResult.success
                        ? "rgba(74,222,128,0.08)"
                        : "rgba(248,113,113,0.08)",
                      border: `1px solid ${testResult.success ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom:
                          testResult.details && testResult.details.length > 0
                            ? 8
                            : 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                        }}
                      >
                        {testResult.success ? "✓" : "✗"}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: testResult.success ? "#4ade80" : "#f87171",
                        }}
                      >
                        {testResult.message}
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          color: dimColor,
                          fontFamily: "IBM Plex Mono, monospace",
                        }}
                      >
                        {testResult.latency}
                        {"ms"}
                      </span>
                    </div>
                    {testResult.details && testResult.details.length > 0 && (
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: 18,
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {testResult.details.map((d) => (
                          <li
                            style={{
                              fontSize: 12,
                              color: "#f87171",
                            }}
                            key={d}
                          >
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              {activeConnector && (
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: mutedColor,
                        fontWeight: 600,
                        marginBottom: paramsPrefilled ? 8 : 0,
                      }}
                    >
                      {activeConnector.label}
                      {"Connection Parameters"}
                      <span
                        style={{
                          fontWeight: 400,
                          color: dimColor,
                          marginLeft: 8,
                        }}
                      >
                        {"("}
                        {instanceType === "prod"
                          ? "Production"
                          : "Non-Production"}{" "}
                        {"placeholders)"}
                      </span>
                    </div>
                    {paramsPrefilled && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 10px",
                          borderRadius: 6,
                          background: "rgba(99,102,241,0.1)",
                          border: "1px solid rgba(99,102,241,0.25)",
                          fontSize: 11,
                          color: "#818cf8",
                          fontWeight: 600,
                        }}
                      >
                        {
                          "Pre-filled with defaults — review and update values before saving"
                        }
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    {activeConnector.params.map((p) => {
                      var _a3;
                      return (
                        <div
                          style={{
                            gridColumn:
                              p.type === "url" ||
                              p.key === "JDBC_URL" ||
                              p.key === "SOAP_ENDPOINT"
                                ? "1 / -1"
                                : void 0,
                          }}
                          key={p.key}
                        >
                          <FormLabel
                            label={`${p.label}${p.optional ? " (optional)" : ""}`}
                            muted={dimColor}
                          />
                          {p.type === "select" ? (
                            <select
                              style={{
                                ...INPUT,
                                cursor: "pointer",
                              }}
                              value={params[p.key] ?? p.defaultValue ?? ""}
                              onChange={(e) =>
                                setParams((prev) => ({
                                  ...prev,
                                  [p.key]: e.target.value,
                                }))
                              }
                            >
                              {(p.options ?? []).map((opt) => (
                                <option value={opt} key={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              data-ocid={`details.param_${p.key.toLowerCase()}_input`}
                              type={p.type === "password" ? "password" : "text"}
                              style={{
                                ...INPUT,
                                fontFamily:
                                  p.type === "url"
                                    ? "IBM Plex Mono, monospace"
                                    : void 0,
                                fontSize: p.type === "url" ? 12 : 13,
                              }}
                              value={params[p.key] ?? ""}
                              onChange={(e) =>
                                setParams((prev) => ({
                                  ...prev,
                                  [p.key]: e.target.value,
                                }))
                              }
                              placeholder={
                                ((_a3 = p.placeholder) == null
                                  ? void 0
                                  : _a3[instanceType]) ?? ""
                              }
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div
                data-ocid={"details.endpoint_registration_section"}
                style={{
                  background: endpointRegistered
                    ? "rgba(74,222,128,0.06)"
                    : cardBg,
                  border: `1px solid ${endpointRegistered ? "rgba(74,222,128,0.28)" : "rgba(99,102,241,0.28)"}`,
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom:
                      endpointRegError || !endpointRegistered ? 12 : 0,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: titleColor,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 16,
                        }}
                      >
                        {""}
                      </span>
                      {"Saviynt Endpoint Registration"}
                      {endpointRegistered && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 10px",
                            borderRadius: 20,
                            background: "rgba(74,222,128,0.15)",
                            color: "#4ade80",
                            border: "1px solid rgba(74,222,128,0.3)",
                          }}
                        >
                          {"Endpoint Registered"}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: mutedColor,
                        marginTop: 3,
                      }}
                    >
                      {endpointRegistered
                        ? `Registered on ${endpointRegisteredAt ? new Date(endpointRegisteredAt).toLocaleString() : "unknown date"} — JML tests are now enabled`
                        : "Register this application as an endpoint in your Non-prod Saviynt instance before running JML tests"}
                    </div>
                  </div>
                  {!endpointRegistered && (
                    <button
                      type={"button"}
                      data-ocid={"details.register_endpoint_button"}
                      onClick={registerEndpoint}
                      disabled={endpointRegistering}
                      style={{
                        background: endpointRegistering
                          ? "rgba(99,102,241,0.08)"
                          : "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(129,140,248,0.18))",
                        border: "1px solid rgba(99,102,241,0.45)",
                        borderRadius: 8,
                        padding: "8px 18px",
                        color: endpointRegistering ? dimColor : "#818cf8",
                        cursor: endpointRegistering ? "not-allowed" : "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        transition: "all 0.15s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {endpointRegistering ? (
                        <React.Fragment>
                          <span
                            style={{
                              display: "inline-block",
                              width: 11,
                              height: 11,
                              border: "2px solid rgba(99,102,241,0.3)",
                              borderTopColor: "#818cf8",
                              borderRadius: "50%",
                              animation: "spin 0.7s linear infinite",
                            }}
                          />
                          {"Registering..."}
                        </React.Fragment>
                      ) : (
                        "Register as Saviynt Endpoint"
                      )}
                    </button>
                  )}
                </div>
                {endpointRegError && (
                  <div
                    data-ocid={"details.endpoint_registration_error_state"}
                    style={{
                      background: "rgba(248,113,113,0.07)",
                      border: "1px solid rgba(248,113,113,0.28)",
                      borderRadius: 7,
                      padding: "10px 14px",
                      fontSize: 11,
                      fontFamily: "IBM Plex Mono, monospace",
                      color: "#f87171",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                      maxHeight: 180,
                      overflowY: "auto",
                    }}
                  >
                    {endpointRegError}
                  </div>
                )}
                {!endpointRegistered &&
                  !endpointRegError &&
                  (() => {
                    var _a3, _b2;
                    const eicUrl =
                      (_a3 = localStorage.getItem("saviynt_eic_nonprod")) ==
                      null
                        ? void 0
                        : _a3.trim();
                    const eicUser =
                      (_b2 = localStorage.getItem(
                        "saviynt_eic_nonprod_username",
                      )) == null
                        ? void 0
                        : _b2.trim();
                    const eicPass = localStorage.getItem(
                      "saviynt_eic_nonprod_password",
                    );
                    if (eicUrl && eicUser && eicPass) return null;
                    return (
                      <div
                        data-ocid={"details.endpoint_no_eic_warning"}
                        style={{
                          fontSize: 11,
                          color: mutedColor,
                          background: "rgba(245,158,11,0.07)",
                          border: "1px solid rgba(245,158,11,0.22)",
                          borderRadius: 6,
                          padding: "8px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <span>{""}</span>
                        <span>
                          {"Non-prod EIC credentials not configured."}{" "}
                          <strong>{"Go to Saviynt Settings"}</strong>
                          {
                            " to set up your Non-prod instance URL, username, and password before registering."
                          }
                        </span>
                      </div>
                    );
                  })()}
              </div>
              {(() => {
                const jmlCap = getConnectorCapability(app.name);
                if (!jmlCap) return null;
                const ops = [
                  {
                    key: "joiner",
                    label: "Joiner",
                    icon: "",
                  },
                  {
                    key: "mover",
                    label: "Mover",
                    icon: "",
                  },
                  {
                    key: "leaver",
                    label: "Leaver",
                    icon: "",
                  },
                ];
                return (
                  <div
                    style={{
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: mutedColor,
                        marginBottom: 10,
                      }}
                    >
                      {jmlCap.connectorName}
                      {"Supported JML Operations"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {ops.map(({ key, label, icon }) => {
                        const op = jmlCap.jmlOperations[key];
                        return (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 10,
                              padding: "8px 12px",
                              borderRadius: 7,
                              background: op.supported
                                ? "rgba(74,222,128,0.06)"
                                : "rgba(107,114,128,0.06)",
                              border: `1px solid ${op.supported ? "rgba(74,222,128,0.18)" : isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
                            }}
                            key={key}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flexShrink: 0,
                                paddingTop: 1,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 11,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  fontWeight: 700,
                                  background: op.supported
                                    ? "rgba(74,222,128,0.15)"
                                    : isDark
                                      ? "rgba(255,255,255,0.06)"
                                      : "rgba(0,0,0,0.04)",
                                  color: op.supported ? "#4ade80" : dimColor,
                                }}
                              >
                                {op.supported ? "Supported" : "– Not Supported"}
                              </span>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: textColor,
                                }}
                              >
                                {icon} {label}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: mutedColor,
                                lineHeight: 1.5,
                              }}
                            >
                              {op.description}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: titleColor,
                    }}
                  >
                    {"JML Test Suite"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type={"button"}
                      data-ocid={"details.jml_generate_test_data_button"}
                      onClick={generateTestData}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))",
                        border: "1px solid rgba(99,102,241,0.4)",
                        borderRadius: 7,
                        padding: "6px 14px",
                        color: "#a78bfa",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        letterSpacing: "0.02em",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {"Generate Test Data"}
                    </button>
                    <span
                      style={{
                        fontSize: 11,
                        color: mutedColor,
                      }}
                    >
                      {"JML Completion:"}
                    </span>
                    <div
                      style={{
                        width: 72,
                        height: 6,
                        background: isDark
                          ? "rgba(255,255,255,0.08)"
                          : "#e2e8f0",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${jmlPct}%`,
                          background:
                            jmlPct === 100
                              ? "#4ade80"
                              : jmlPct > 33
                                ? "#60a5fa"
                                : "#6b7280",
                          transition: "width 0.4s ease",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color:
                          jmlPct === 100
                            ? "#4ade80"
                            : jmlPct > 33
                              ? "#60a5fa"
                              : mutedColor,
                      }}
                    >
                      {jmlPct}
                      {"%"}
                    </span>
                  </div>
                </div>
                {!endpointRegistered && (
                  <div
                    data-ocid={"details.jml_endpoint_prereq_callout"}
                    style={{
                      fontSize: 12,
                      color: "#818cf8",
                      background: "rgba(99,102,241,0.07)",
                      border: "1px solid rgba(99,102,241,0.28)",
                      borderRadius: 7,
                      padding: "10px 14px",
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      {""}
                    </span>
                    <span>
                      <strong>{"Endpoint registration required."}</strong>
                      {
                        " Register this app as a Saviynt endpoint (above) before running JML tests. JML provisions users through the registered endpoint."
                      }
                    </span>
                  </div>
                )}
                {(() => {
                  var _a3, _b2;
                  const eicUrl =
                    (_a3 = localStorage.getItem("saviynt_eic_nonprod")) == null
                      ? void 0
                      : _a3.trim();
                  const eicUser =
                    (_b2 = localStorage.getItem(
                      "saviynt_eic_nonprod_username",
                    )) == null
                      ? void 0
                      : _b2.trim();
                  const eicPass = localStorage.getItem(
                    "saviynt_eic_nonprod_password",
                  );
                  if (eicUrl && eicUser && eicPass) return null;
                  return (
                    <div
                      data-ocid={"details.jml_no_eic_warning"}
                      style={{
                        fontSize: 12,
                        color: mutedColor,
                        background: "rgba(245,158,11,0.07)",
                        border: "1px solid rgba(245,158,11,0.28)",
                        borderRadius: 7,
                        padding: "10px 14px",
                        marginBottom: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          flexShrink: 0,
                        }}
                      >
                        {""}
                      </span>
                      <span>
                        {"Non-prod Saviynt instance not configured. Go to"}{" "}
                        <strong>{"Saviynt Settings"}</strong>
                        {
                          " to set up your Non-prod EIC credentials before running JML tests. Tests will run in simulation mode until credentials are saved."
                        }
                      </span>
                    </div>
                  );
                })()}
                {editableAttrs.length > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#4ade80",
                      background: "rgba(74,222,128,0.06)",
                      border: "1px solid rgba(74,222,128,0.18)",
                      borderRadius: 6,
                      padding: "6px 10px",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {
                      "Test fields populated from AI-discovered connector attributes ("
                    }
                    {editableAttrs.length}
                    {" attributes)"}
                  </div>
                )}
                {["joiner", "mover", "leaver"].map((scenario) => {
                  var _a3, _b2;
                  const icons = {
                    joiner: "",
                    mover: "",
                    leaver: "",
                  };
                  const subtitles = {
                    joiner: "Test new user provisioning",
                    mover: "Test role/department transfer",
                    leaver: "Test user deprovisioning",
                  };
                  const rawInputs =
                    scenario === "joiner"
                      ? joinerInputs
                      : scenario === "mover"
                        ? moverInputs
                        : leaverInputs;
                  const setInputs =
                    scenario === "joiner"
                      ? setJoinerInputs
                      : scenario === "mover"
                        ? setMoverInputs
                        : setLeaverInputs;
                  const joinerProvisioned =
                    (_a3 = jmlTests.joiner) == null
                      ? void 0
                      : _a3.provisionedUsername;
                  const baseDescriptors =
                    editableAttrs.length > 0
                      ? editableAttrs.map((a) => ({
                          key: a.name,
                          label: a.name,
                        }))
                      : scenario === "joiner"
                        ? [
                            {
                              key: "username",
                              label: "Username",
                            },
                            {
                              key: "email",
                              label: "Email",
                            },
                            {
                              key: "department",
                              label: "Department",
                            },
                            {
                              key: "role",
                              label: "Role",
                            },
                          ]
                        : scenario === "mover"
                          ? [
                              {
                                key: "username",
                                label: "Username",
                              },
                              {
                                key: "fromDept",
                                label: "From Dept",
                              },
                              {
                                key: "toDept",
                                label: "To Dept",
                              },
                              {
                                key: "newRole",
                                label: "New Role",
                              },
                            ]
                          : [
                              {
                                key: "username",
                                label: "Username",
                              },
                              {
                                key: "terminationDate",
                                label: "Termination Date",
                              },
                              {
                                key: "manager",
                                label: "Manager",
                              },
                            ];
                  const cleanupHandler =
                    scenario === "joiner" &&
                    ((_b2 = jmlTests.joiner) == null
                      ? void 0
                      : _b2.provisionedUsername) &&
                    !jmlTests.joiner.cleanedUp
                      ? async () => {
                          var _a4, _b3;
                          const url =
                            (_a4 = localStorage.getItem(
                              "saviynt_eic_nonprod",
                            )) == null
                              ? void 0
                              : _a4.trim();
                          const user =
                            (_b3 = localStorage.getItem(
                              "saviynt_eic_nonprod_username",
                            )) == null
                              ? void 0
                              : _b3.trim();
                          const pass = localStorage.getItem(
                            "saviynt_eic_nonprod_password",
                          );
                          const targetUser =
                            jmlTests.joiner.provisionedUsername;
                          if (!url || !user || !pass) {
                            setJmlTests((p) => ({
                              ...p,
                              joiner: p.joiner
                                ? {
                                    ...p.joiner,
                                    cleanedUp: true,
                                  }
                                : null,
                            }));
                            return;
                          }
                          try {
                            const cleanupRes = await fetch(
                              "/api/saviynt/jml-cleanup",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  url,
                                  username: user,
                                  password: pass,
                                  targetUser,
                                }),
                              },
                            );
                            if (cleanupRes.ok) {
                              const _cj = await cleanupRes.json();
                              if (_cj) {
                                /* cleanup routed through server proxy — no direct browser call */
                                void 0;
                              }
                            }
                          } catch {}
                          setJmlTests((p) => ({
                            ...p,
                            joiner: p.joiner
                              ? {
                                  ...p.joiner,
                                  cleanedUp: true,
                                }
                              : null,
                          }));
                        }
                      : void 0;
                  return (
                    <JMLScenario
                      title={
                        scenario.charAt(0).toUpperCase() + scenario.slice(1)
                      }
                      icon={icons[scenario]}
                      subtitle={subtitles[scenario]}
                      result={jmlTests[scenario]}
                      running={!!jmlRunning[scenario]}
                      inputs={baseDescriptors.map((d) => {
                        const isUsernameField =
                          d.key === "username" ||
                          d.key === "user_name" ||
                          d.key === "Username";
                        const lockedByJoiner =
                          scenario === "leaver" &&
                          isUsernameField &&
                          !!joinerProvisioned;
                        const autofillForMover =
                          scenario === "mover" &&
                          isUsernameField &&
                          !!joinerProvisioned &&
                          !rawInputs[d.key];
                        const value = lockedByJoiner
                          ? (joinerProvisioned ?? "")
                          : autofillForMover
                            ? (joinerProvisioned ?? "")
                            : (rawInputs[d.key] ?? "");
                        return {
                          key: d.key,
                          label: d.label,
                          value,
                          readOnly: lockedByJoiner,
                          onChange: lockedByJoiner
                            ? () => {}
                            : (v) =>
                                setInputs((p) => ({
                                  ...p,
                                  [d.key]: v,
                                })),
                        };
                      })}
                      onRun={() => runJml(scenario)}
                      onCleanup={cleanupHandler}
                      disabled={!endpointRegistered}
                      inputStyle={INPUT}
                      isDark={isDark}
                      border={border}
                      dimColor={dimColor}
                      textColor={textColor}
                      mutedColor={mutedColor}
                      key={scenario}
                    />
                  );
                })}
              </div>
            </div>
          )}
          {tab === 2 && (
            <SchemaTab
              app={app}
              localAssessment={localAssessment}
              isDark={isDark}
              border={border}
              cardBg={cardBg}
              textColor={textColor}
              mutedColor={mutedColor}
              dimColor={dimColor}
              INPUT={INPUT}
              editableAttrs={editableAttrs}
              setEditableAttrs={setEditableAttrs}
              schemaAdditionalNotes={schemaAdditionalNotes}
              setSchemaAdditionalNotes={setSchemaAdditionalNotes}
            />
          )}
          {tab === 3 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <FormLabel label={"Provisioning Type"} muted={dimColor} />
                  <select
                    style={{
                      ...INPUT,
                      cursor: "pointer",
                    }}
                  >
                    <option>{"Automatic"}</option>
                    <option>{"Manual"}</option>
                    <option>{"Hybrid"}</option>
                  </select>
                </div>
                <div>
                  <FormLabel
                    label={"Certification Frequency"}
                    muted={dimColor}
                  />
                  <select
                    style={{
                      ...INPUT,
                      cursor: "pointer",
                    }}
                  >
                    <option>{"Quarterly"}</option>
                    <option>{"Semi-Annual"}</option>
                    <option>{"Annual"}</option>
                  </select>
                </div>
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    gap: 20,
                    paddingTop: 4,
                  }}
                >
                  {["Joiner", "Mover", "Leaver"].map((k) => (
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        cursor: "pointer",
                        color: textColor,
                      }}
                      key={k}
                    >
                      <input
                        type={"checkbox"}
                        defaultChecked={true}
                        style={{
                          accentColor: "#6366f1",
                        }}
                      />
                      {k}
                    </label>
                  ))}
                </div>
                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <FormLabel label={"Notes"} muted={dimColor} />
                  <textarea
                    style={{
                      ...INPUT,
                      height: 80,
                      resize: "vertical",
                    }}
                    placeholder={"Additional lifecycle notes..."}
                  />
                </div>
              </div>
              {(localAssessment == null
                ? void 0
                : localAssessment.integrationPattern) !== "OOTB" && (
                <CustomIntegrationEndpoints
                  isDbDriver={/JDBC|MYSQL|POSTGRESQL|ORACLE|DB2|DATABASE/i.test(
                    connectorType.toUpperCase(),
                  )}
                  operations={[
                    {
                      key: "search_user",
                      label: "Search User",
                    },
                    {
                      key: "search_roles",
                      label: "Search Roles",
                    },
                    {
                      key: "search_groups",
                      label: "Search Groups",
                    },
                    {
                      key: "create_user",
                      label: "Create User",
                    },
                    {
                      key: "add_user_to_group",
                      label: "Add User to Group / Role",
                    },
                    {
                      key: "modify_user",
                      label: "Modify User",
                    },
                    {
                      key: "remove_user",
                      label: "Remove User",
                    },
                    {
                      key: "suspend_user",
                      label: "Suspend User",
                    },
                    {
                      key: "restore_user",
                      label: "Restore / Enable User",
                    },
                  ]}
                  httpMethods={["GET", "POST", "PUT", "PATCH", "DELETE"]}
                  params={params}
                  setParams={setParams}
                  isDark={isDark}
                  cardBg={cardBg}
                  border={border}
                  textColor={textColor}
                  mutedColor={mutedColor}
                  dimColor={dimColor}
                />
              )}
            </div>
          )}
          {tab === 4 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <FormLabel label={"Owner"} muted={dimColor} />
                <input
                  data-ocid={"details.owner_input"}
                  type={"text"}
                  style={INPUT}
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </div>
              <div>
                <FormLabel label={"Owner Email"} muted={dimColor} />
                <input
                  data-ocid={"details.owner_email_input"}
                  type={"email"}
                  style={INPUT}
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>
              <div>
                <FormLabel label={"Business Owner"} muted={dimColor} />
                <input
                  data-ocid={"details.business_owner_input"}
                  type={"text"}
                  style={INPUT}
                  value={businessOwner}
                  onChange={(e) => setBusinessOwner(e.target.value)}
                />
              </div>
              <div>
                <FormLabel label={"Business Owner Email"} muted={dimColor} />
                <input
                  data-ocid={"details.business_owner_email_input"}
                  type={"email"}
                  style={INPUT}
                  value={businessOwnerEmail}
                  onChange={(e) => setBusinessOwnerEmail(e.target.value)}
                />
              </div>
            </div>
          )}
          {tab === 5 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                }}
              >
                <FormLabel label={"App Context"} muted={dimColor} />
                <div
                  style={{
                    fontWeight: 600,
                    color: titleColor,
                    marginBottom: 6,
                  }}
                >
                  {app.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: 11,
                      background: "rgba(99,102,241,0.15)",
                      color: "#818cf8",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {app.protocol}
                  </span>
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: 11,
                      background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                      color: mutedColor,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {app.integration}
                  </span>
                  <OOTBBadge
                    hasOOTB={schema.hasOOTB}
                    integrationPattern={
                      localAssessment == null
                        ? void 0
                        : localAssessment.integrationPattern
                    }
                    isDark={isDark}
                  />
                </div>
              </div>
              {!localAssessment && !isAnalyzing && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                  }}
                >
                  <button
                    type={"button"}
                    data-ocid={"details.ai_analyze_button"}
                    onClick={handleAnalyze}
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(129,140,248,0.2))",
                      border: "1px solid rgba(99,102,241,0.5)",
                      borderRadius: 8,
                      padding: "12px 28px",
                      color: "#818cf8",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {"Run AI Assessment"}
                  </button>
                  <div
                    style={{
                      color: dimColor,
                      fontSize: 12,
                      marginTop: 8,
                    }}
                  >
                    {
                      "Deterministic integration pattern analysis based on app name, protocol, and connector availability"
                    }
                  </div>
                </div>
              )}
              {isAnalyzing && (
                <div
                  data-ocid={"details.ai_loading_state"}
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    animation: "pulse-soft 1.5s ease-in-out infinite",
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      marginBottom: 8,
                    }}
                  >
                    {""}
                  </div>
                  <div
                    style={{
                      color: "#818cf8",
                      fontWeight: 600,
                    }}
                  >
                    {"Analyzing integration pattern..."}
                  </div>
                  <div
                    style={{
                      color: dimColor,
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {"Evaluating "}
                    {app.name}
                  </div>
                </div>
              )}
              {localAssessment && !isAnalyzing && (
                <div
                  data-ocid={"details.ai_result"}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <AIPatternBadge
                        pattern={localAssessment.integrationPattern}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color: dimColor,
                        }}
                      >
                        {"Assessed"}{" "}
                        {new Date(
                          localAssessment.assessedAt,
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <FormLabel label={"Connector"} muted={dimColor} />
                        <div
                          style={{
                            fontSize: 13,
                            color: textColor,
                          }}
                        >
                          {localAssessment.connectorName}
                        </div>
                      </div>
                      <div>
                        <FormLabel label={"Effort"} muted={dimColor} />
                        <div
                          style={{
                            fontSize: 13,
                            color: textColor,
                            fontWeight: 600,
                          }}
                        >
                          {localAssessment.effortEstimate}
                        </div>
                      </div>
                      <div>
                        <FormLabel label={"App Type"} muted={dimColor} />
                        <div
                          style={{
                            fontSize: 13,
                            color: textColor,
                          }}
                        >
                          {localAssessment.appType}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        marginBottom: 12,
                      }}
                    >
                      <FormLabel
                        label={"Complexity Factors"}
                        muted={dimColor}
                      />
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: 16,
                        }}
                      >
                        {localAssessment.complexityFactors.map((f) => (
                          <li
                            style={{
                              fontSize: 12,
                              color: mutedColor,
                              marginBottom: 3,
                            }}
                            key={f}
                          >
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <FormLabel label={"Next Steps"} muted={dimColor} />
                      <ol
                        style={{
                          margin: 0,
                          paddingLeft: 16,
                        }}
                      >
                        {localAssessment.nextSteps.map((s) => (
                          <li
                            style={{
                              fontSize: 12,
                              color: mutedColor,
                              marginBottom: 4,
                            }}
                            key={s}
                          >
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <button
                      type={"button"}
                      data-ocid={"details.ai_reanalyze_button"}
                      onClick={handleAnalyze}
                      style={{
                        background: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.05)",
                        border: `1px solid ${border}`,
                        borderRadius: 6,
                        padding: "8px 14px",
                        color: mutedColor,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      {"Re-analyze"}
                    </button>
                    <button
                      type={"button"}
                      data-ocid={"details.ai_apply_button"}
                      onClick={() => {
                        onUpdate(app.id, {
                          aiAssessment: localAssessment,
                        });
                        onClose();
                      }}
                      style={{
                        flex: 1,
                        background: "rgba(74,222,128,0.15)",
                        border: "1px solid rgba(74,222,128,0.3)",
                        borderRadius: 6,
                        padding: "8px 14px",
                        color: "#4ade80",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {"Apply Assessment to App Record"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === 6 && (
            <IntegrationSpecTab
              app={app}
              specDoc={specDoc}
              isDark={isDark}
              border={border}
              cardBg={cardBg}
              titleColor={titleColor}
              textColor={textColor}
              mutedColor={mutedColor}
              dimColor={dimColor}
              inputStyle={INPUT}
              fileInputRef={fileInputRef}
              revisionComment={revisionComment}
              setRevisionComment={setRevisionComment}
              showRevisionInput={showRevisionInput}
              setShowRevisionInput={setShowRevisionInput}
              revisionError={revisionError}
              setRevisionError={setRevisionError}
              onDownloadTemplate={() => downloadSpecTemplate(app)}
              onFileUpload={handleFileUpload}
              onApprove={handleApprove}
              onRequestRevisions={handleRequestRevisions}
            />
          )}
        </div>
        {tab !== 5 && (
          <div
            style={{
              padding: "14px 24px",
              borderTop: `1px solid ${border}`,
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <button
              type={"button"}
              data-ocid={"details.cancel_button"}
              onClick={onClose}
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
                border: `1px solid ${border}`,
                borderRadius: 6,
                padding: "8px 16px",
                color: mutedColor,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {"Cancel"}
            </button>
            <button
              type={"button"}
              data-ocid={"details.save_button"}
              onClick={handleSave}
              style={{
                background: "#6366f1",
                border: "none",
                borderRadius: 6,
                padding: "8px 20px",
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {"Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export { ApplicationDetailsModal };
