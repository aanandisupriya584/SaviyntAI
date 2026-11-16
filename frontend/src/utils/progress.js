import * as React from "react";
function getAppProgress(app) {
  var _a2;
  let score = 0;
  if (app.aiAssessment != null) score += 20;
  if (app.connectionTestPassed === true) score += 20;
  if (((_a2 = app.specDocument) == null ? void 0 : _a2.status) === "approved")
    score += 20;
  const hasFunctionalPass = (app.functionalTests ?? []).some(
    (t) => t.status === "pass",
  );
  if (hasFunctionalPass) score += 20;
  if (app.saviyntEndpointRegistered === true) score += 20;
  return score;
}
export { getAppProgress };
