import * as React from "react";
function ProgressBar({ value, compact = false, steps }) {
  let color = "#f87171";
  if (value >= 100) color = "#4ade80";
  else if (value >= 50) color = "#60a5fa";
  else if (value >= 20) color = "#f59e0b";
  const tooltipContent = steps ? (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1e293b",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "8px 12px",
        pointerEvents: "none",
        zIndex: 100,
        whiteSpace: "nowrap",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        minWidth: 190,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#94a3b8",
          marginBottom: 6,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {"Onboarding Steps"}
      </div>
      {steps.map((s) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 3,
          }}
          key={s.label}
        >
          <span
            style={{
              fontSize: 12,
              color: s.done ? "#4ade80" : "#6b7280",
              flexShrink: 0,
            }}
          >
            {s.done ? "✓" : "○"}
          </span>
          <span
            style={{
              fontSize: 11,
              color: s.done ? "#e5e7eb" : "#6b7280",
            }}
          >
            {s.label}
          </span>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          bottom: -5,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: 8,
          height: 8,
          background: "#1e293b",
          borderRight: "1px solid rgba(255,255,255,0.12)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      />
    </div>
  ) : null;
  if (compact) {
    return (
      <div
        className={"progress-bar-host"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          minWidth: 80,
          position: "relative",
        }}
        title={
          steps
            ? steps.map((s) => `${s.done ? "✓" : "○"} ${s.label}`).join(" | ")
            : void 0
        }
      >
        {steps && (
          <div
            className={"progress-bar-tooltip"}
            style={{
              position: "absolute",
              opacity: 0,
              transition: "opacity 0.15s",
              pointerEvents: "none",
            }}
          >
            {tooltipContent}
          </div>
        )}
        <div
          style={{
            flex: 1,
            height: 4,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${value}%`,
              height: "100%",
              background: color,
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 11,
            color: "#9ca3af",
            fontVariantNumeric: "tabular-nums",
            minWidth: 26,
            textAlign: "right",
          }}
        >
          {value}
          {"%"}
        </span>
      </div>
    );
  }
  return (
    <div
      className={"progress-bar-host"}
      style={{
        width: "100%",
        position: "relative",
      }}
      title={
        steps
          ? steps.map((s) => `${s.done ? "✓" : "○"} ${s.label}`).join(" | ")
          : void 0
      }
    >
      {steps && (
        <div
          className={"progress-bar-tooltip"}
          style={{
            position: "absolute",
            opacity: 0,
            transition: "opacity 0.15s",
            pointerEvents: "none",
          }}
        >
          {tooltipContent}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            height: 6,
            flex: 1,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 3,
            overflow: "hidden",
            marginRight: 8,
          }}
        >
          <div
            style={{
              width: `${value}%`,
              height: "100%",
              background: color,
              borderRadius: 3,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            color: "#9ca3af",
            minWidth: 32,
            textAlign: "right",
          }}
        >
          {value}
          {"%"}
        </span>
      </div>
    </div>
  );
}
export { ProgressBar };
