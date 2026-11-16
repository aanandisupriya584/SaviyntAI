import { AuthClient } from "@dfinity/auth-client";
import { DelegationIdentity, isDelegationValid } from "@dfinity/identity";
import { loadConfig } from "../lib/runtimeConfig.js";
import * as React from "react";
const ONE_HOUR_IN_NANOSECONDS = BigInt(36e11);
const DEFAULT_IDENTITY_PROVIDER = "https://id.ai";
const InternetIdentityReactContext = React.createContext(void 0);
async function createAuthClient(createOptions) {
  const config = await loadConfig();
  const options = {
    idleOptions: {
      // Default behaviour of this hook is not to logout and reload window on identity expiration
      disableDefaultIdleCallback: true,
      disableIdle: true,
      ...(createOptions == null ? void 0 : createOptions.idleOptions),
    },
    loginOptions: {
      derivationOrigin: config.ii_derivation_origin,
    },
    ...createOptions,
  };
  const authClient = await AuthClient.create(options);
  return authClient;
}
function InternetIdentityProvider({ children, createOptions }) {
  const [authClient, setAuthClient] = React.useState(void 0);
  const [identity, setIdentity] = React.useState(void 0);
  const [loginStatus, setStatus] = React.useState("initializing");
  const [loginError, setError] = React.useState(void 0);
  const setErrorMessage = React.useCallback((message) => {
    setStatus("loginError");
    setError(new Error(message));
  }, []);
  const handleLoginSuccess = React.useCallback(() => {
    const latestIdentity =
      authClient == null ? void 0 : authClient.getIdentity();
    if (!latestIdentity) {
      setErrorMessage("Identity not found after successful login");
      return;
    }
    setIdentity(latestIdentity);
    setStatus("success");
  }, [authClient, setErrorMessage]);
  const handleLoginError = React.useCallback(
    (maybeError) => {
      setErrorMessage(maybeError ?? "Login failed");
    },
    [setErrorMessage],
  );
  const login = React.useCallback(() => {
    if (!authClient) {
      setErrorMessage(
        "AuthClient is not initialized yet, make sure to call `login` on user interaction e.g. click.",
      );
      return;
    }
    const currentIdentity = authClient.getIdentity();
    if (
      !currentIdentity.getPrincipal().isAnonymous() &&
      currentIdentity instanceof DelegationIdentity &&
      isDelegationValid(currentIdentity.getDelegation())
    ) {
      setErrorMessage("User is already authenticated");
      return;
    }
    const options = {
      identityProvider: DEFAULT_IDENTITY_PROVIDER,
      onSuccess: handleLoginSuccess,
      onError: handleLoginError,
      maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt(24 * 30),
      // 30 days
    };
    setStatus("logging-in");
    void authClient.login(options);
  }, [authClient, handleLoginError, handleLoginSuccess, setErrorMessage]);
  const clear = React.useCallback(() => {
    if (!authClient) {
      setErrorMessage("Auth client not initialized");
      return;
    }
    void authClient
      .logout()
      .then(() => {
        setIdentity(void 0);
        setAuthClient(void 0);
        setStatus("idle");
        setError(void 0);
      })
      .catch((unknownError) => {
        setStatus("loginError");
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Logout failed"),
        );
      });
  }, [authClient, setErrorMessage]);
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setStatus("initializing");
        let existingClient = authClient;
        if (!existingClient) {
          existingClient = await createAuthClient(createOptions);
          if (cancelled) return;
          setAuthClient(existingClient);
        }
        const isAuthenticated = await existingClient.isAuthenticated();
        if (cancelled) return;
        if (isAuthenticated) {
          const loadedIdentity = existingClient.getIdentity();
          setIdentity(loadedIdentity);
          setStatus("success");
        } else {
          setIdentity(void 0);
          setStatus("idle");
        }
      } catch (unknownError) {
        if (cancelled) return;
        setIdentity(void 0);
        setStatus("loginError");
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Initialization failed"),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [createOptions, authClient]);
  const value = React.useMemo(
    () => ({
      identity,
      login,
      clear,
      loginStatus,
      isInitializing: loginStatus === "initializing",
      isLoginIdle: loginStatus === "idle",
      isLoggingIn: loginStatus === "logging-in",
      isLoginSuccess: loginStatus === "success",
      isLoginError: loginStatus === "loginError",
      isAuthenticated: !!identity && !identity.getPrincipal().isAnonymous(),
      loginError,
    }),
    [identity, login, clear, loginStatus, loginError],
  );
  return React.createElement(InternetIdentityReactContext.Provider, {
    value,
    children,
  });
}
export {
  ONE_HOUR_IN_NANOSECONDS,
  DEFAULT_IDENTITY_PROVIDER,
  InternetIdentityReactContext,
  createAuthClient,
  InternetIdentityProvider,
};
