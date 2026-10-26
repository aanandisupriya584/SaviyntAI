import * as React from "react";
async function testEICConnectionViaProxy(environment) {
  const start = Date.now();
  try {
    const res = await fetch("/api/saviynt/test-connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        environment,
      }),
    });
    const latency = Date.now() - start;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        latency,
        message: "Could not reach local server — is the app running?",
        details: [`HTTP ${res.status}`, text].filter(Boolean),
      };
    }
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("text/html")) {
      const html = await res.text().catch(() => "");
      return {
        success: false,
        latency,
        message:
          "Server returned an unexpected HTML page — check that your Saviynt instance URL is correct and reachable.",
        details: [html.slice(0, 200)].filter(Boolean),
      };
    }
    let json;
    try {
      json = await res.json();
    } catch {
      const rawText = await res.text().catch(() => "");
      return {
        success: false,
        latency,
        message: "Could not parse server response as JSON.",
        details: [rawText.slice(0, 200)].filter(Boolean),
      };
    }
    return {
      success: json.success,
      latency,
      message: json.message,
      details: json.detail ? [json.detail] : [],
      tokenObtained: json.tokenObtained,
      loginEndpoint: json.loginEndpoint,
    };
  } catch (err) {
    const latency = Date.now() - start;
    return {
      success: false,
      latency,
      message: "Could not reach local server — is the app running?",
      details: [err instanceof Error ? err.message : String(err)],
    };
  }
}
export { testEICConnectionViaProxy };
