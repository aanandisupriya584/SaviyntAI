import * as React from "react";
function FormLabel({ label, muted }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: muted,
        marginBottom: 4,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </div>
  );
}
export { FormLabel };
