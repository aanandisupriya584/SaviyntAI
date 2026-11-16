import * as React from "react";
import { useTheme } from "../../contexts/ThemeContext.jsx";
function Toast({ id, message, type, onDismiss }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  React.useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 3500);
    return () => clearTimeout(t);
  }, [id, onDismiss]);
  const colors = {
    success: {
      bg: isDark ? "rgba(16,185,129,0.12)" : "#dcfce7",
      border: isDark ? "#10b981" : "#16a34a",
      text: isDark ? "#4ade80" : "#166534",
    },
    info: {
      bg: isDark ? "rgba(96,165,250,0.12)" : "#dbeafe",
      border: isDark ? "#3b82f6" : "#2563eb",
      text: isDark ? "#60a5fa" : "#1e40af",
    },
    warning: {
      bg: isDark ? "rgba(245,158,11,0.12)" : "#fef3c7",
      border: isDark ? "#f59e0b" : "#d97706",
      text: isDark ? "#fcd34d" : "#92400e",
    },
    error: {
      bg: isDark ? "rgba(248,113,113,0.12)" : "#fee2e2",
      border: isDark ? "#ef4444" : "#dc2626",
      text: isDark ? "#f87171" : "#991b1b",
    },
  };
  const c = colors[type];
  return (
    <div
      data-ocid={"toast"}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 280,
        maxWidth: 380,
        animation: "slideInToast 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: c.text,
          flex: 1,
        }}
      >
        {message}
      </span>
      <button
        type={"button"}
        data-ocid={"toast.close_button"}
        onClick={() => onDismiss(id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: c.text,
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
        }}
        aria-label={"Dismiss notification"}
      >
        {"×"}
      </button>
    </div>
  );
}
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <Toast {...t} onDismiss={onDismiss} key={t.id} />
      ))}
    </div>
  );
}
export { Toast, ToastContainer };
