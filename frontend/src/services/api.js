import * as React from "react";
function isLocalMode() {
  // The Express API is served on the same origin in local and Docker deployments.
  // Retain the existing browser-only fallback as an explicit opt-in mode.
  return import.meta.env.VITE_STORAGE_MODE !== "browser";
}
const API_BASE = "/api";
const DEFAULT_SETTINGS = {
  nonProd: {
    url: "",
    username: "",
    password: "",
    verified: false,
  },
  prod: {
    url: "",
    username: "",
    password: "",
    verified: false,
  },
  idp: {
    enabled: false,
    issuerUrl: "",
    clientId: "",
    metadataUrl: "",
  },
};
const LS_KEYS = {
  apps: "saviynt_apps",
  users: "saviynt_users",
  settings: "saviynt_settings",
  emails: "saviynt_emails",
};
function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
async function apiFetch(endpoint) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
async function apiPost(endpoint, data) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}
async function loadApps() {
  if (isLocalMode()) {
    const data = await apiFetch("apps");
    if (data && data.length > 0) return data;
    return null;
  }
  return lsGet(LS_KEYS.apps, null);
}
async function saveApps(apps) {
  if (isLocalMode()) {
    await apiPost("apps", apps);
    return;
  }
  lsSet(LS_KEYS.apps, apps);
}
async function loadUsers() {
  if (isLocalMode()) {
    const data = await apiFetch("users");
    if (data && data.length > 0) return data;
    return null;
  }
  return lsGet(LS_KEYS.users, null);
}
async function saveUsers(users) {
  if (isLocalMode()) {
    await apiPost("users", users);
    return;
  }
  lsSet(LS_KEYS.users, users);
}
async function apiLogin(username, password, localUsers) {
  if (isLocalMode()) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const data = await res.json();
      return data;
    } catch {
      return {
        success: false,
        message: "Network error — cannot reach local server.",
      };
    }
  }
  const found = (localUsers ?? []).find(
    (u) => u.username.toLowerCase() === username.toLowerCase(),
  );
  if (!found)
    return {
      success: false,
      message: "Invalid username or password.",
    };
  if (found.useIDP)
    return {
      success: false,
      message:
        "This account uses enterprise IDP login. Click ‘Sign in with IDP’ to continue.",
    };
  if (found.passwordHash !== password)
    return {
      success: false,
      message: "Invalid username or password.",
    };
  return {
    success: true,
    user: found,
  };
}
async function changePassword(username, currentPassword, newPassword) {
  if (isLocalMode()) {
    try {
      const res = await fetch(`${API_BASE}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      return data;
    } catch {
      return {
        success: false,
        message: "Network error — cannot reach local server.",
      };
    }
  }
  return {
    success: false,
    message:
      "Password change requires the app to be running locally (start.bat). In cloud preview mode, ask your admin to reset your password.",
  };
}
async function adminResetPassword(targetUsername, newPassword) {
  if (isLocalMode()) {
    try {
      const res = await fetch(`${API_BASE}/admin-reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUsername,
          newPassword,
        }),
      });
      const data = await res.json();
      return data;
    } catch {
      return {
        success: false,
        message: "Network error — cannot reach local server.",
      };
    }
  }
  return {
    success: false,
    message:
      "Admin password reset requires the app to be running locally (start.bat).",
  };
}
async function loadSettings() {
  if (isLocalMode()) {
    const data = await apiFetch("settings");
    if (data)
      return {
        ...DEFAULT_SETTINGS,
        ...data,
      };
    return DEFAULT_SETTINGS;
  }
  return lsGet(LS_KEYS.settings, DEFAULT_SETTINGS);
}
async function saveSettings(settings) {
  if (isLocalMode()) {
    await apiPost("settings", settings);
    return;
  }
  lsSet(LS_KEYS.settings, settings);
}
async function loadEmails() {
  if (isLocalMode()) {
    const data = await apiFetch("emails");
    return data ?? [];
  }
  return lsGet(LS_KEYS.emails, []);
}
async function saveEmails(emails) {
  if (isLocalMode()) {
    await apiPost("emails", emails);
    return;
  }
  lsSet(LS_KEYS.emails, emails);
}
async function uploadDocument(file) {
  if (!isLocalMode()) return null;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
export {
  isLocalMode,
  API_BASE,
  DEFAULT_SETTINGS,
  LS_KEYS,
  lsGet,
  lsSet,
  apiFetch,
  apiPost,
  loadApps,
  saveApps,
  loadUsers,
  saveUsers,
  apiLogin,
  changePassword,
  adminResetPassword,
  loadSettings,
  saveSettings,
  loadEmails,
  saveEmails,
  uploadDocument,
};
