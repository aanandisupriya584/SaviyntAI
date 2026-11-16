import * as React from "react";
import { useTheme } from "../../contexts/ThemeContext.jsx";
function AIPatternBadge({ pattern }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  if (!pattern) {
    return (
      <span
        style={{
          color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8",
          fontSize: "12px",
        }}
      >
        {"—"}
      </span>
    );
  }
  const baseStyle = {
    padding: "2px 8px",
    borderRadius: "4px",
    fontWeight: 600,
    fontSize: "12px",
    display: "inline-block",
  };
  const config = {
    OOTB: {
      label: "✓ OOTB",
      style: {
        ...baseStyle,
        background: "rgba(74,222,128,0.15)",
        color: "#4ade80",
        border: "1px solid rgba(74,222,128,0.3)",
      },
    },
    "Custom-Simple": {
      label: "◈ Custom-S",
      style: {
        ...baseStyle,
        background: "rgba(96,165,250,0.15)",
        color: "#60a5fa",
        border: "1px solid rgba(96,165,250,0.3)",
      },
    },
    "Custom-Medium": {
      label: "◆ Custom-M",
      style: {
        ...baseStyle,
        background: "rgba(245,158,11,0.15)",
        color: "#f59e0b",
        border: "1px solid rgba(245,158,11,0.3)",
      },
    },
    "Custom-Complex": {
      label: "⬡ Custom-C",
      style: {
        ...baseStyle,
        background: "rgba(248,113,113,0.15)",
        color: "#f87171",
        border: "1px solid rgba(248,113,113,0.3)",
      },
    },
  };
  const { label, style: style2 } = config[pattern];
  return <span style={style2}>{label}</span>;
}
function OOTBBadge({ hasOOTB, integrationPattern, isDark }) {
  const pattern = integrationPattern ?? (hasOOTB ? "OOTB" : "Custom");
  if (pattern === "OOTB") {
    return (
      <span
        style={{
          fontSize: 11,
          padding: "3px 9px",
          borderRadius: 5,
          background: "rgba(74,222,128,0.12)",
          color: "#4ade80",
          fontWeight: 700,
          border: "1px solid rgba(74,222,128,0.25)",
          whiteSpace: "nowrap",
        }}
      >
        {"✓ OOTB"}
      </span>
    );
  }
  if (pattern === "Custom-Simple") {
    return (
      <span
        style={{
          fontSize: 11,
          padding: "3px 9px",
          borderRadius: 5,
          background: "rgba(96,165,250,0.12)",
          color: "#60a5fa",
          fontWeight: 600,
          border: "1px solid rgba(96,165,250,0.25)",
          whiteSpace: "nowrap",
        }}
      >
        {"◈ Custom · Simple"}
      </span>
    );
  }
  if (pattern === "Custom-Medium") {
    return (
      <span
        style={{
          fontSize: 11,
          padding: "3px 9px",
          borderRadius: 5,
          background: "rgba(245,158,11,0.12)",
          color: "#f59e0b",
          fontWeight: 600,
          border: "1px solid rgba(245,158,11,0.25)",
          whiteSpace: "nowrap",
        }}
      >
        {"◆ Custom · Medium"}
      </span>
    );
  }
  if (pattern === "Custom-Complex") {
    return (
      <span
        style={{
          fontSize: 11,
          padding: "3px 9px",
          borderRadius: 5,
          background: "rgba(248,113,113,0.12)",
          color: "#f87171",
          fontWeight: 600,
          border: "1px solid rgba(248,113,113,0.25)",
          whiteSpace: "nowrap",
        }}
      >
        {"⬡ Custom · Complex"}
      </span>
    );
  }
  return (
    <span
      style={{
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 5,
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        color: isDark ? "#6b7280" : "#94a3b8",
        fontWeight: 600,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
        whiteSpace: "nowrap",
      }}
    >
      {"— Custom"}
    </span>
  );
}
function StatusBadge({ status }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const baseStyle = {
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500,
    display: "inline-block",
  };
  const config = {
    onboarded: {
      label: "● Onboarded",
      style: {
        ...baseStyle,
        background: "rgba(74,222,128,0.15)",
        color: "#4ade80",
        border: "1px solid rgba(74,222,128,0.3)",
      },
    },
    in_progress: {
      label: "◐ In Progress",
      style: {
        ...baseStyle,
        background: "rgba(96,165,250,0.15)",
        color: "#60a5fa",
        border: "1px solid rgba(96,165,250,0.3)",
      },
    },
    pending: {
      label: "○ Pending",
      style: {
        ...baseStyle,
        background: "rgba(245,158,11,0.15)",
        color: "#f59e0b",
        border: "1px solid rgba(245,158,11,0.3)",
      },
    },
    not_started: {
      label: "— Not Started",
      style: {
        ...baseStyle,
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
        border: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid #cbd5e1",
      },
    },
  };
  const { label, style: style2 } = config[status];
  return <span style={style2}>{label}</span>;
}
export { AIPatternBadge, OOTBBadge, StatusBadge };
