import {
  API_BASE,
  apiLogin,
  apiPost,
  isLocalMode,
  loadUsers,
  saveUsers,
} from "../services/api.js";
import * as React from "react";
const USERS_KEY = "saviynt-users";
const IDP_KEY = "saviynt-idp-config";
const DEFAULT_IDP = {
  issuerUrl: "",
  clientId: "",
  metadataUrl: "",
  enabled: false,
};
function loadUsersSync() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}
function saveUsersSync(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}
function loadIDPConfig() {
  try {
    const raw = localStorage.getItem(IDP_KEY);
    if (raw)
      return {
        ...DEFAULT_IDP,
        ...JSON.parse(raw),
      };
  } catch {}
  return DEFAULT_IDP;
}
function saveIDPConfig(config) {
  try {
    localStorage.setItem(IDP_KEY, JSON.stringify(config));
  } catch {}
}
function generateId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
const AuthContext = React.createContext(null);
function AuthProvider({ children }) {
  const [users, setUsers] = React.useState(loadUsersSync);
  const [idpConfig, setIDPConfig] = React.useState(loadIDPConfig);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [sessionLoaded, setSessionLoaded] = React.useState(false);
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (isLocalMode()) {
          const response = await fetch(`${API_BASE}/session`, {
            cache: "no-store",
          });
          if (response.ok) {
            const session = await response.json();
            if (active && session.success && session.user)
              setCurrentUser(session.user);
          }
        }
      } catch {
        // Leave the login available when the server cannot be reached.
      } finally {
        if (active) setSessionLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [usersLoaded, setUsersLoaded] = React.useState(false);
  React.useEffect(() => {
    loadUsers().then((serverUsers) => {
      if (serverUsers && serverUsers.length > 0) {
        setUsers(serverUsers);
        if (!isLocalMode()) saveUsersSync(serverUsers);
      }
      setUsersLoaded(true);
    });
  }, []);
  const persistUsers = React.useCallback((next) => {
    setUsers(next);
    saveUsers(next);
    if (!isLocalMode()) saveUsersSync(next);
  }, []);
  const login = React.useCallback(
    async (credentials) => {
      const result = await apiLogin(
        credentials.username,
        credentials.password,
        users,
      );
      if (!result.success) {
        return {
          success: false,
          error: result.message ?? "Invalid username or password.",
        };
      }
      const found =
        result.user ??
        users.find(
          (u) =>
            u.username.toLowerCase() === credentials.username.toLowerCase(),
        );
      if (!found)
        return {
          success: false,
          error: "Invalid username or password.",
        };
      if (found.useIDP) {
        return {
          success: false,
          error:
            "This account uses enterprise IDP login. Click ‘Sign in with IDP’ to continue.",
        };
      }
      const updated = {
        ...found,
        lastLogin: new Date().toISOString(),
      };
      if (!isLocalMode())
        persistUsers(users.map((u) => (u.id === found.id ? updated : u)));
      setCurrentUser(updated);
      return {
        success: true,
      };
    },
    [users, persistUsers],
  );
  const loginWithIDP = React.useCallback(
    async (email) => {
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (!found) {
        return {
          success: false,
          error:
            "No account found for this email. Please contact your admin to set up your account.",
        };
      }
      if (!found.useIDP) {
        return {
          success: false,
          error: "This account does not use IDP login.",
        };
      }
      const updated = {
        ...found,
        lastLogin: new Date().toISOString(),
      };
      persistUsers(users.map((u) => (u.id === found.id ? updated : u)));
      setCurrentUser(updated);
      return {
        success: true,
      };
    },
    [users, persistUsers],
  );
  const logout = React.useCallback(async () => {
    if (isLocalMode() && !(await apiPost("logout", {}))) {
      window.alert("Could not sign out. Please try again.");
      return;
    }
    setCurrentUser(null);
  }, []);
  const createUser = React.useCallback(
    (user) => {
      const newUser = {
        ...user,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      persistUsers([...users, newUser]);
      return newUser;
    },
    [users, persistUsers],
  );
  const updateUser = React.useCallback(
    (id, updates) => {
      const next = users.map((u) =>
        u.id === id
          ? {
              ...u,
              ...updates,
            }
          : u,
      );
      persistUsers(next);
      if ((currentUser == null ? void 0 : currentUser.id) === id)
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                ...updates,
              }
            : null,
        );
    },
    [users, currentUser, persistUsers],
  );
  const deleteUser = React.useCallback(
    (id) => {
      persistUsers(users.filter((u) => u.id !== id));
    },
    [users, persistUsers],
  );
  const updateIDPConfig = React.useCallback((config) => {
    setIDPConfig(config);
    saveIDPConfig(config);
  }, []);
  const getUsersForApp = React.useCallback(
    (appId) => {
      return users.filter(
        (u) =>
          u.role === "application_owner" && u.assignedAppIds.includes(appId),
      );
    },
    [users],
  );
  const value = {
    currentUser,
    isAuthenticated: currentUser !== null,
    users,
    idpConfig,
    login,
    loginWithIDP,
    logout,
    createUser,
    updateUser,
    deleteUser,
    updateIDPConfig,
    getUsersForApp,
  };
  return (
    <AuthContext.Provider value={value}>
      {sessionLoaded ? children : null}
    </AuthContext.Provider>
  );
}
function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
export {
  USERS_KEY,
  IDP_KEY,
  DEFAULT_IDP,
  loadUsersSync,
  saveUsersSync,
  loadIDPConfig,
  saveIDPConfig,
  generateId,
  AuthContext,
  AuthProvider,
  useAuth,
};
