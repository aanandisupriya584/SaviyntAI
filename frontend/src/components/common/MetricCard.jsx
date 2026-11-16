import * as React from "react";
function MetricCard({ label, value, icon, subtitle, color, isDark = true }) {
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const valueColor = isDark ? "#fff" : "#0f172a";
  const labelColor = isDark ? "#6b7280" : "#64748b";
  return (
    <div
      data-ocid={"metric.card"}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 12,
        padding: "20px 24px",
        borderTop: color ? `3px solid ${color}` : void 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: labelColor,
              marginBottom: 4,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: valueColor,
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontSize: 12,
              color: labelColor,
              marginTop: 6,
            }}
          >
            {subtitle}
          </div>
        </div>
        <div
          style={{
            fontSize: 22,
            opacity: 0.6,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
export { MetricCard };
