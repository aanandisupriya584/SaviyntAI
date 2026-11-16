import * as React from "react";
function AdditionalNotesSection({
  value,
  onChange,
  INPUT,
  isDark,
  border,
  textColor: _textColor,
  mutedColor,
  dimColor,
}) {
  return (
    <div
      style={{
        marginTop: 8,
        padding: "14px 16px",
        background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${border}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: mutedColor,
            marginBottom: 3,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {"Additional Notes"}
        </div>
        <div
          style={{
            fontSize: 11,
            color: dimColor,
            lineHeight: 1.5,
          }}
        >
          {
            "Provide any rules, business logic, or requirements for user account management and onboarding (e.g. “Accounts created only after HR update”, “Leaver requires 24-hour notice”)."
          }
        </div>
      </div>
      <textarea
        data-ocid={"details.schema_additional_notes_textarea"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          "Enter any additional notes, business rules, or special requirements for user account management..."
        }
        style={{
          ...INPUT,
          height: 100,
          resize: "vertical",
          lineHeight: 1.6,
          fontSize: 12,
        }}
      />
    </div>
  );
}
export { AdditionalNotesSection };
