import { ApplicationDetailsModal } from "./components/application-details/ApplicationDetailsModal.jsx";
import { Applications } from "./pages/Applications.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { EmailLog } from "./pages/EmailLog.jsx";
import { IDPSettings } from "./pages/IDPSettings.jsx";
import { INITIAL_APPS } from "./data/initialApps.js";
import { ImportPage } from "./pages/Import.jsx";
import { LoginPage } from "./pages/Login.jsx";
import { RoleGuard } from "./components/common/RoleGuard.jsx";
import { SaviyntSettings } from "./pages/EICSettings.jsx";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext.jsx";
import { ToastContainer } from "./components/common/Toast.jsx";
import { UserManagement } from "./pages/Users.jsx";
import {
  changePassword,
  loadApps,
  loadEmails,
  saveApps,
  saveEmails,
} from "./services/api.js";
import { getAppProgress } from "./utils/progress.js";
import * as React from "react";
import { useAuth } from "./contexts/AuthContext.jsx";
let _toastId = 0;
let _emailId = 0;
let _appId = 100;
function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
function AppInner() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const sidebarPages = {
    import: [
      "Import Applications",
      "Add applications using CSV upload, CMDB sync, or manual entry.",
      "M12 15V3m-5 5 5-5 5 5 M4 16v5h16v-5",
    ],
    dashboard: [
      "Dashboard",
      "Overview of application onboarding and integration progress.",
      "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    ],
    applications: [
      "Applications",
      "Manage applications and track their onboarding progress.",
      "M4 4h16v16H4z M4 9h16 M9 9v11",
    ],
    email: [
      "Email Log",
      "Review onboarding communications and reminders.",
      "M3 5h18v14H3z M3 5l9 7 9-7",
    ],
    user_management: [
      "Users",
      "Manage user accounts, roles, and application access.",
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    ],
    idp_settings: [
      "IDP Settings",
      "Configure enterprise identity provider settings.",
      "M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3",
    ],
    saviynt_settings: [
      "EIC Settings",
      "Manage your Saviynt EIC connection settings.",
      "M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01 M12 10v4",
    ],
  };
  const sidebarIcon = (view) => (
    <svg
      viewBox={"0 0 24 24"}
      width={19}
      height={19}
      fill={"none"}
      stroke={"currentColor"}
      strokeWidth={1.6}
      strokeLinecap={"round"}
      strokeLinejoin={"round"}
      aria-hidden={true}
      className={"sidebar-page-icon"}
    >
      <path d={sidebarPages[view][2]} />
    </svg>
  );
  const { theme, toggleTheme } = useTheme();
  const {
    currentUser,
    isAuthenticated,
    logout,
    users,
    createUser,
    updateUser,
  } = useAuth();
  const [apps, setApps] = React.useState(INITIAL_APPS);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const viewStorageKey = `onboarder-page:${currentUser?.id || "guest"}`;
  const restoredViewKey = React.useRef(null);
  const [currentView, setCurrentView] = React.useState(() => {
    try {
      const savedView = sessionStorage.getItem(viewStorageKey);
      const adminPage = [
        "user_management",
        "idp_settings",
        "saviynt_settings",
        "import",
      ].includes(savedView);
      return Object.hasOwn(sidebarPages, savedView) &&
        (!adminPage || currentUser?.role === "admin")
        ? savedView
        : "dashboard";
    } catch {
      return "dashboard";
    }
  });
  React.useEffect(() => {
    if (!currentUser) return;
    try {
      if (restoredViewKey.current !== viewStorageKey) {
        restoredViewKey.current = viewStorageKey;
        const savedView = sessionStorage.getItem(viewStorageKey);
        const adminPage = [
          "user_management",
          "idp_settings",
          "saviynt_settings",
          "import",
        ].includes(savedView);
        if (
          Object.hasOwn(sidebarPages, savedView) &&
          (!adminPage || currentUser.role === "admin")
        ) {
          setCurrentView(savedView);
          return;
        }
      }
      sessionStorage.setItem(viewStorageKey, currentView);
    } catch {}
  }, [currentView, viewStorageKey, currentUser]);
  const [toasts, setToasts] = React.useState([]);
  const [editingApp, setEditingApp] = React.useState(null);
  const [editingTab, setEditingTab] = React.useState(0);
  const restoredDetailsKey = React.useRef(null);
  React.useEffect(() => {
    if (!currentUser || !dataLoaded) return;
    const key = `${viewStorageKey}:details`;
    try {
      if (restoredDetailsKey.current !== key) {
        restoredDetailsKey.current = key;
        const saved = JSON.parse(sessionStorage.getItem(key) || "null");
        const app = saved && apps.find((item) => item.id === saved.id);
        if (
          app &&
          (currentUser.role !== "application_owner" ||
            currentUser.assignedAppIds?.includes(app.id) ||
            app.ownerEmail?.toLowerCase() === currentUser.email?.toLowerCase())
        ) {
          setEditingTab(
            Number.isInteger(saved.tab) && saved.tab >= 0 && saved.tab <= 4
              ? saved.tab
              : 0,
          );
          setEditingApp(app);
          return;
        }
      }
      if (editingApp)
        sessionStorage.setItem(
          key,
          JSON.stringify({
            id: editingApp.id,
            tab: editingTab,
          }),
        );
      else sessionStorage.removeItem(key);
    } catch {}
  }, [currentUser, dataLoaded, viewStorageKey, apps, editingApp, editingTab]);
  const [emails, setEmails] = React.useState([]);
  const [showChangePw, setShowChangePw] = React.useState(false);
  const [cpCurrentPw, setCpCurrentPw] = React.useState("");
  const [cpNewPw, setCpNewPw] = React.useState("");
  const [cpConfirmPw, setCpConfirmPw] = React.useState("");
  const [cpLoading, setCpLoading] = React.useState(false);
  const [cpError, setCpError] = React.useState(null);
  const [cpSuccess, setCpSuccess] = React.useState(false);
  const saveAppsTimer = React.useRef(null);
  const saveEmailsTimer = React.useRef(null);
  React.useEffect(() => {
    async function init() {
      const [savedApps, savedEmails] = await Promise.all([
        loadApps(),
        loadEmails(),
      ]);
      if (savedApps && savedApps.length > 0) {
        setApps(savedApps);
      } else {
        await saveApps(INITIAL_APPS);
      }
      if (savedEmails && savedEmails.length > 0) {
        setEmails(savedEmails);
      }
      setDataLoaded(true);
    }
    init();
  }, []);
  React.useEffect(() => {
    if (!dataLoaded) return;
    if (saveAppsTimer.current) clearTimeout(saveAppsTimer.current);
    saveAppsTimer.current = setTimeout(() => {
      saveApps(apps);
    }, 800);
    return () => {
      if (saveAppsTimer.current) clearTimeout(saveAppsTimer.current);
    };
  }, [apps, dataLoaded]);
  React.useEffect(() => {
    if (!dataLoaded) return;
    if (saveEmailsTimer.current) clearTimeout(saveEmailsTimer.current);
    saveEmailsTimer.current = setTimeout(() => {
      saveEmails(emails);
    }, 800);
    return () => {
      if (saveEmailsTimer.current) clearTimeout(saveEmailsTimer.current);
    };
  }, [emails, dataLoaded]);
  const addToast = React.useCallback((message, type) => {
    const id = String(++_toastId);
    setToasts((p) => [
      ...p,
      {
        id,
        message,
        type,
      },
    ]);
  }, []);
  const dismissToast = React.useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);
  const updateApp = React.useCallback((id, updates) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...updates,
            }
          : a,
      ),
    );
  }, []);
  const handleModalUpdate = React.useCallback(
    (id, updates) => {
      var _a2;
      const isOOTB =
        ((_a2 = updates.aiAssessment) == null
          ? void 0
          : _a2.integrationPattern) === "OOTB";
      const baseUpdates = isOOTB
        ? {
            ...updates,
            status: "onboarded",
          }
        : updates;
      setApps((prev) => {
        const updated = prev.map((a) => {
          if (a.id !== id) return a;
          const merged = {
            ...a,
            ...baseUpdates,
          };
          return {
            ...merged,
            progress: getAppProgress(merged),
          };
        });
        return updated;
      });
      setEditingApp((prev) => {
        if (!prev) return null;
        const merged = {
          ...prev,
          ...baseUpdates,
        };
        return {
          ...merged,
          progress: getAppProgress(merged),
        };
      });
      if (updates.aiAssessment) {
        if (isOOTB) {
          addToast(
            "✓ OOTB Connector detected — status updated to Onboarded",
            "success",
          );
        } else {
          addToast("✓ AI Assessment applied to app record", "success");
        }
      }
    },
    [addToast],
  );
  const sendReminder = React.useCallback(
    (app) => {
      const newCount = app.reminders + 1;
      updateApp(app.id, {
        reminders: newCount,
      });
      const record = {
        id: String(++_emailId),
        appId: app.id,
        appName: app.name,
        recipient: app.owner,
        recipientEmail: app.ownerEmail,
        emailType: "reminder",
        reminderNumber: newCount,
        sentAt: new Date().toISOString(),
      };
      setEmails((p) => [...p, record]);
      addToast(`✉ Reminder sent to ${app.owner} for ${app.name}`, "info");
    },
    [updateApp, addToast],
  );
  const escalateToCISO = React.useCallback(
    (app) => {
      const record = {
        id: String(++_emailId),
        appId: app.id,
        appName: app.name,
        recipient: "CISO",
        recipientEmail: "ciso@company.com",
        emailType: "escalation",
        reminderNumber: app.reminders,
        sentAt: new Date().toISOString(),
      };
      setEmails((p) => [...p, record]);
      addToast(`🚨 Escalated ${app.name} to CISO`, "warning");
    },
    [addToast],
  );
  const remindAllOwners = React.useCallback(() => {
    const nonOnboarded = apps.filter((a) => a.status !== "onboarded");
    for (const app of nonOnboarded) sendReminder(app);
    addToast(
      `✉ Sent reminders for ${nonOnboarded.length} applications`,
      "success",
    );
  }, [apps, sendReminder, addToast]);
  const sendBulkReminders = React.useCallback(
    (ids) => {
      const targets = apps.filter((a) => ids.includes(a.id));
      for (const app of targets) sendReminder(app);
      addToast(`✉ Sent ${targets.length} bulk reminders`, "success");
    },
    [apps, sendReminder, addToast],
  );
  const openAppModal = React.useCallback((app, tab = 0) => {
    setEditingApp(app);
    setEditingTab(tab);
  }, []);
  const handleRunFunctionalTest = React.useCallback(
    (appId, result) => {
      setApps((prev) =>
        prev.map((a) => {
          if (a.id !== appId) return a;
          const merged = {
            ...a,
            functionalTests: [...a.functionalTests, result],
          };
          return {
            ...merged,
            progress: getAppProgress(merged),
          };
        }),
      );
      const status = result.status === "pass" ? "✓ PASSED" : "✗ FAILED";
      addToast(
        `${status}: ${result.testName}`,
        result.status === "pass" ? "success" : "warning",
      );
    },
    [addToast],
  );
  const submitToSaviynt = React.useCallback(
    (app) => {
      if (getAppProgress(app) === 100 || app.status === "onboarded") {
        updateApp(app.id, {
          status: "onboarded",
          progress: 100,
        });
        addToast(`⚡ ${app.name} submitted to Saviynt successfully`, "success");
      }
    },
    [updateApp, addToast],
  );
  function handleExportJSON() {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      theme,
      apps,
      emails,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `saviynt-onboarder-export-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("↓ Full data exported as JSON", "success");
  }
  const handleImport = React.useCallback(
    (partial) => {
      const newApp = {
        id: String(++_appId),
        name: partial.name ?? "New App",
        department: partial.department ?? "Unknown",
        owner: partial.owner ?? "",
        ownerEmail: partial.ownerEmail ?? "",
        businessOwner: partial.businessOwner ?? "",
        businessOwnerEmail: partial.businessOwnerEmail ?? "",
        status: "not_started",
        reminders: 0,
        protocol: partial.protocol ?? "REST API",
        integration: partial.integration ?? "OAuth 2.0",
        lastUpdated: new Date().toISOString().split("T")[0],
        progress: 0,
        criticality: partial.criticality ?? "medium",
        aiAssessment: null,
        functionalTests: [],
        instanceType: "non-prod",
        connectorType: "",
        connectionParams: {},
      };
      setApps((p) => [...p, newApp]);
      addToast(`✓ ${newApp.name} imported successfully`, "success");
    },
    [addToast],
  );
  const handleImportWithOwner = React.useCallback(
    (partial) => {
      handleImport(partial);
      if (partial.ownerEmail) {
        const existingUser = users.find(
          (u) => u.email.toLowerCase() === partial.ownerEmail.toLowerCase(),
        );
        const nextAppId = String(_appId);
        if (!existingUser) {
          createUser({
            username: partial.ownerEmail.split("@")[0],
            email: partial.ownerEmail,
            name: partial.ownerEmail.split("@")[0],
            role: "application_owner",
            useIDP: false,
            passwordHash: "changeme123",
            assignedAppIds: [nextAppId],
          });
        } else if (!existingUser.assignedAppIds.includes(nextAppId)) {
          updateUser(existingUser.id, {
            assignedAppIds: [...existingUser.assignedAppIds, nextAppId],
          });
        }
      }
    },
    [handleImport, users, createUser, updateUser],
  );
  const onboardedCount = apps.filter((a) => a.status === "onboarded").length;
  const emailCountBadge = emails.length;
  const isDark = theme === "dark";
  const rootBg = isDark ? "#060d1a" : "#f1f5f9";
  const rootColor = isDark ? "#e5e7eb" : "#0f172a";
  const navBg = isDark ? "rgba(6,13,26,0.92)" : "rgba(248,250,252,0.92)";
  const navBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const navActiveText = isDark ? "#818cf8" : "#6366f1";
  const navActiveBg = isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.12)";
  const navActiveBorder = isDark
    ? "rgba(99,102,241,0.4)"
    : "rgba(99,102,241,0.3)";
  const navInactiveText = isDark ? "#9ca3af" : "#64748b";
  const onboardedColor = isDark ? "#4ade80" : "#16a34a";
  const countDivider = isDark ? "#4b5563" : "#94a3b8";
  const countMuted = isDark ? "#6b7280" : "#64748b";
  const NAV_BTN = (view, label, badge) => (
    <button
      type={"button"}
      data-ocid={`nav.${view}_button`}
      title={sidebarPages[view][0]}
      aria-label={sidebarPages[view][0]}
      aria-current={currentView === view ? "page" : void 0}
      onClick={() => setCurrentView(view)}
      style={{
        background: currentView === view ? navActiveBg : "none",
        border:
          currentView === view
            ? `1px solid ${navActiveBorder}`
            : "1px solid transparent",
        borderRadius: 7,
        padding: "7px 16px",
        color: currentView === view ? navActiveText : navInactiveText,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: currentView === view ? 600 : 400,
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.15s ease",
      }}
    >
      {sidebarIcon(view)}
      <span className={"sidebar-page-label"}>{sidebarPages[view][0]}</span>
      {badge !== void 0 && badge > 0 && (
        <span
          style={{
            background: "#6366f1",
            color: "#fff",
            fontSize: 10,
            padding: "1px 5px",
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
  return !isAuthenticated || !currentUser ? (
    <LoginPage />
  ) : (
    <div
      className={`onboarder-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}
      data-page={currentView}
      style={{
        minHeight: "100vh",
        background: rootBg,
        fontFamily: '"DM Sans", sans-serif',
        color: rootColor,
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <nav
        className={"onboarder-sidebar"}
        id={"onboarder-sidebar"}
        aria-label={"Main navigation"}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: navBg,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${navBorder}`,
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.2,
            marginRight: 8,
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          <button
            type={"button"}
            className={"sidebar-collapse-toggle"}
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            aria-expanded={!sidebarCollapsed}
            aria-controls={"onboarder-sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? ">" : "<"}
          </button>
          <img
            className={"sidebar-kpmg-logo"}
            src={"/assets/kpmg-logo.svg"}
            alt={"KPMG"}
            width={56}
            height={24}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: isDark ? "#fff" : "#0f172a",
            }}
          >
            {"IGA Onboarding Hub"}
          </span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.12em",
              color: "#818cf8",
              textTransform: "uppercase",
            }}
          >
            {"Powered by Saviynt"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            alignItems: "center",
            height: "100%",
          }}
        >
          {NAV_BTN("dashboard", "Dashboard")}
          {NAV_BTN("applications", "Applications")}
          {NAV_BTN("email", "Email Log", emailCountBadge)}
          {currentUser.role === "admin" &&
            NAV_BTN("user_management", "👥 Users")}
          {currentUser.role === "admin" &&
            NAV_BTN("idp_settings", "🔐 IDP Settings")}
          {currentUser.role === "admin" &&
            NAV_BTN("saviynt_settings", "⚙️ EIC Settings")}
          <button
            type={"button"}
            className={"sidebar-action"}
            data-ocid={"nav.export_json_button"}
            title={"Export"}
            aria-label={"Export"}
            onClick={handleExportJSON}
          >
            <svg
              className={"sidebar-page-icon"}
              width={18}
              height={18}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"currentColor"}
              strokeWidth={1.7}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
              aria-hidden={true}
            >
              <path d={"M12 3v12m-5-5 5 5 5-5 M4 16v5h16v-5"} />
            </svg>
            <span className={"sidebar-page-label"}>{"Export"}</span>
          </button>
          {currentUser.role === "admin" && (
            <button
              type={"button"}
              className={"sidebar-action"}
              data-ocid={"nav.import_button"}
              title={"Import"}
              aria-label={"Import"}
              aria-current={currentView === "import" ? "page" : void 0}
              onClick={() => setCurrentView("import")}
            >
              <svg
                className={"sidebar-page-icon"}
                width={18}
                height={18}
                viewBox={"0 0 24 24"}
                fill={"none"}
                stroke={"currentColor"}
                strokeWidth={1.7}
                strokeLinecap={"round"}
                strokeLinejoin={"round"}
                aria-hidden={true}
              >
                <path d={"M12 15V3m-5 5 5-5 5 5 M4 16v5h16v-5"} />
              </svg>
              <span className={"sidebar-page-label"}>{"Import"}</span>
            </button>
          )}
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <button
              type={"button"}
              className={"sidebar-profile"}
              aria-expanded={accountMenuOpen}
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              <span className={"sidebar-profile-avatar"} aria-hidden={true}>
                {currentUser.role === "admin"
                  ? "A"
                  : (currentUser.name || currentUser.username || "U")
                      .charAt(0)
                      .toUpperCase()}
              </span>
              <span className={"sidebar-profile-details"}>
                <span className={"sidebar-profile-name"}>
                  {currentUser.role === "admin"
                    ? "Admin"
                    : currentUser.name || currentUser.username}
                </span>
                <span className={"sidebar-profile-role"}>
                  {currentUser.role === "admin"
                    ? "Admin"
                    : currentUser.role === "executive"
                      ? "Read Only"
                      : "App Owner"}
                </span>
              </span>
            </button>
            {accountMenuOpen && !currentUser.useIDP && (
              <button
                type={"button"}
                data-ocid={"nav.change_password_button"}
                title={"Change Password"}
                aria-label={"Change Password"}
                onClick={() => {
                  setCpCurrentPw("");
                  setCpNewPw("");
                  setCpConfirmPw("");
                  setCpError(null);
                  setCpSuccess(false);
                  setShowChangePw(true);
                }}
                style={{
                  background: "rgba(129,140,248,0.12)",
                  border: "1px solid rgba(129,140,248,0.3)",
                  borderRadius: 7,
                  padding: "5px 10px",
                  color: "#818cf8",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {"Change Password"}
              </button>
            )}
            {currentUser.role === "admin" && accountMenuOpen && (
              <button
                type={"button"}
                data-ocid={"nav.theme_toggle"}
                onClick={toggleTheme}
                aria-label={
                  theme === "dark"
                    ? "Switch to light theme"
                    : "Switch to dark theme"
                }
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#dce9f9",
                  padding: "5px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {"Change Theme"}
              </button>
            )}
            <button
              type={"button"}
              data-ocid={"nav.logout_button"}
              hidden={!accountMenuOpen}
              title={"Sign Out"}
              aria-label={"Sign Out"}
              onClick={logout}
              style={{
                background: "rgba(248,113,113,0.12)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 7,
                padding: "5px 10px",
                color: "#f87171",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {"Sign Out"}
            </button>
          </div>
        </div>
      </nav>
      <header className={"onboarder-page-header"}>
        <div className={"onboarder-page-banner"}>
          <span className={"onboarder-page-symbol"}>
            {sidebarIcon(sidebarPages[currentView] ? currentView : "dashboard")}
          </span>
          <div>
            <h1>{sidebarPages[currentView]?.[0] || "IGA Onboarding Hub"}</h1>
            <p>{sidebarPages[currentView]?.[1] || ""}</p>
          </div>
        </div>
      </header>
      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px 24px",
        }}
      >
        {currentView === "dashboard" && (
          <Dashboard
            apps={apps}
            emails={emails}
            onSendReminder={sendReminder}
            onOpenModal={openAppModal}
            readOnly={currentUser.role === "executive"}
          />
        )}
        {currentView === "applications" &&
          (() => {
            const visibleApps =
              currentUser.role === "application_owner"
                ? apps.filter(
                    (app) =>
                      currentUser.assignedAppIds.includes(app.id) ||
                      (app.ownerEmail &&
                        app.ownerEmail.toLowerCase() ===
                          currentUser.email.toLowerCase()),
                  )
                : apps;
            return (
              <Applications
                apps={visibleApps}
                onSendReminder={sendReminder}
                onOpenModal={openAppModal}
                onSubmitToSaviynt={submitToSaviynt}
                onBulkRemind={sendBulkReminders}
                onRunFunctionalTest={handleRunFunctionalTest}
                onUpdateApp={updateApp}
                onAddToast={addToast}
                readOnly={currentUser.role === "executive"}
              />
            );
          })()}
        {currentView === "email" && (
          <EmailLog
            apps={apps}
            emails={emails}
            onSendReminder={sendReminder}
            onEscalateCISO={escalateToCISO}
            onRemindAll={remindAllOwners}
            readOnly={currentUser.role === "executive"}
          />
        )}
        {currentView === "import" && (
          <RoleGuard allowedRoles={["admin"]}>
            <ImportPage
              onClose={() => setCurrentView("applications")}
              onImport={handleImportWithOwner}
            />
          </RoleGuard>
        )}
        {currentView === "user_management" && (
          <RoleGuard allowedRoles={["admin"]}>
            <UserManagement apps={apps} />
          </RoleGuard>
        )}
        {currentView === "idp_settings" && (
          <RoleGuard allowedRoles={["admin"]}>
            <IDPSettings />
          </RoleGuard>
        )}
        {currentView === "saviynt_settings" && (
          <RoleGuard allowedRoles={["admin"]}>
            <SaviyntSettings />
          </RoleGuard>
        )}
      </main>
      {editingApp && (
        <ApplicationDetailsModal
          app={editingApp}
          initialTab={editingTab}
          onTabChange={setEditingTab}
          onClose={() => setEditingApp(null)}
          onUpdate={handleModalUpdate}
        />
      )}
      {showChangePw && currentUser && (
        <div
          className={
            "fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          }
          data-ocid={"change_password.dialog"}
        >
          <div
            className={
              "w-full max-w-sm mx-4 rounded-xl p-6 space-y-5 shadow-2xl"
            }
            style={{
              background: "rgba(15,23,42,0.97)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <div className={"flex items-center justify-between"}>
              <h3
                className={"font-semibold text-base"}
                style={{
                  color: "#e2e8f0",
                }}
              >
                {"🔑 Change Password"}
              </h3>
              <button
                type={"button"}
                data-ocid={"change_password.close_button"}
                onClick={() => setShowChangePw(false)}
                style={{
                  padding: 4,
                  borderRadius: 6,
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                }}
                aria-label={"Close"}
              >
                {"✕"}
              </button>
            </div>
            {cpSuccess ? (
              <div
                className={"rounded-lg px-4 py-3 text-sm"}
                style={{
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  color: "#4ade80",
                }}
                data-ocid={"change_password.success_state"}
              >
                {
                  "✓ Password updated successfully. You may now close this window."
                }
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setCpError(null);
                  if (!cpCurrentPw.trim()) {
                    setCpError("Current password is required.");
                    return;
                  }
                  if (!cpNewPw.trim()) {
                    setCpError("New password is required.");
                    return;
                  }
                  if (cpNewPw.length < 6) {
                    setCpError("New password must be at least 6 characters.");
                    return;
                  }
                  if (cpNewPw !== cpConfirmPw) {
                    setCpError("Passwords do not match.");
                    return;
                  }
                  setCpLoading(true);
                  const result = await changePassword(
                    currentUser.username,
                    cpCurrentPw,
                    cpNewPw,
                  );
                  setCpLoading(false);
                  if (result.success) {
                    setCpSuccess(true);
                  } else {
                    setCpError(result.message ?? "Password change failed.");
                  }
                }}
                className={"space-y-4"}
              >
                {[
                  [
                    "cp-current",
                    "Current Password",
                    cpCurrentPw,
                    setCpCurrentPw,
                    "current-password",
                    "change_password.current_input",
                  ],
                  [
                    "cp-new",
                    "New Password",
                    cpNewPw,
                    setCpNewPw,
                    "new-password",
                    "change_password.new_input",
                  ],
                  [
                    "cp-confirm",
                    "Confirm New Password",
                    cpConfirmPw,
                    setCpConfirmPw,
                    "new-password",
                    "change_password.confirm_input",
                  ],
                ].map(([id, label, val, setter, autoComplete, ocid]) => (
                  <div className={"space-y-1.5"} key={id}>
                    <label
                      htmlFor={id}
                      style={{
                        display: "block",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {label}
                    </label>
                    <input
                      id={id}
                      type={"password"}
                      data-ocid={ocid}
                      value={val}
                      onChange={(ev) => setter(ev.target.value)}
                      autoComplete={autoComplete}
                      placeholder={label}
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "#0f172a",
                        padding: "10px 12px",
                        fontSize: 14,
                        color: "#e2e8f0",
                        outline: "none",
                      }}
                    />
                  </div>
                ))}
                {cpError && (
                  <p
                    data-ocid={"change_password.error_state"}
                    style={{
                      fontSize: 12,
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: "#f87171",
                      background: "rgba(248,113,113,0.08)",
                      border: "1px solid rgba(248,113,113,0.2)",
                    }}
                  >
                    {cpError}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    paddingTop: 4,
                  }}
                >
                  <button
                    type={"button"}
                    data-ocid={"change_password.cancel_button"}
                    onClick={() => setShowChangePw(false)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 7,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "#94a3b8",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {"Cancel"}
                  </button>
                  <button
                    type={"submit"}
                    data-ocid={"change_password.submit_button"}
                    disabled={cpLoading}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 7,
                      border: "none",
                      background: cpLoading ? "#4338ca" : "#4f46e5",
                      color: "#fff",
                      cursor: cpLoading ? "not-allowed" : "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {cpLoading ? "Saving…" : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
export { _toastId, _emailId, _appId, App, AppInner };
