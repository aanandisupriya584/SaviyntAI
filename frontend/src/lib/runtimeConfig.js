import * as React from "react";
var define_process_env_default = {};
const DEFAULT_STORAGE_GATEWAY_URL = "https://blob.caffeine.ai";
const DEFAULT_BUCKET_NAME = "default-bucket";
const DEFAULT_PROJECT_ID = "0000000-0000-0000-0000-00000000000";
let configCache = null;
async function loadConfig() {
  if (configCache) {
    return configCache;
  }
  const backendCanisterId = define_process_env_default.CANISTER_ID_BACKEND;
  const envBaseUrl = define_process_env_default.BASE_URL || "/";
  const baseUrl = envBaseUrl.endsWith("/") ? envBaseUrl : `${envBaseUrl}/`;
  try {
    const response = await fetch(`${baseUrl}env.json`);
    const config = await response.json();
    if (!backendCanisterId && config.backend_canister_id === "undefined") {
      console.error("CANISTER_ID_BACKEND is not set");
      throw new Error("CANISTER_ID_BACKEND is not set");
    }
    const runtimeStorageGatewayUrl =
      config.storage_gateway_url && config.storage_gateway_url !== "undefined"
        ? config.storage_gateway_url
        : void 0;
    const fullConfig = {
      backend_host:
        config.backend_host === "undefined" ? void 0 : config.backend_host,
      backend_canister_id:
        config.backend_canister_id === "undefined"
          ? backendCanisterId
          : config.backend_canister_id,
      storage_gateway_url:
        runtimeStorageGatewayUrl ?? "https://blob.caffeine.ai" ?? "nogateway",
      bucket_name: DEFAULT_BUCKET_NAME,
      project_id:
        config.project_id !== "undefined"
          ? config.project_id
          : DEFAULT_PROJECT_ID,
      ii_derivation_origin:
        config.ii_derivation_origin === "undefined"
          ? void 0
          : config.ii_derivation_origin,
    };
    configCache = fullConfig;
    return fullConfig;
  } catch {
    if (!backendCanisterId) {
      console.error("CANISTER_ID_BACKEND is not set");
      throw new Error("CANISTER_ID_BACKEND is not set");
    }
    const fallbackConfig = {
      backend_host: void 0,
      backend_canister_id: backendCanisterId,
      storage_gateway_url: DEFAULT_STORAGE_GATEWAY_URL,
      bucket_name: DEFAULT_BUCKET_NAME,
      project_id: DEFAULT_PROJECT_ID,
      ii_derivation_origin: void 0,
    };
    return fallbackConfig;
  }
}
export {
  define_process_env_default,
  DEFAULT_STORAGE_GATEWAY_URL,
  DEFAULT_BUCKET_NAME,
  DEFAULT_PROJECT_ID,
  configCache,
  loadConfig,
};
