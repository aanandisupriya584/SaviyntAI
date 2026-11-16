import * as React from "react";
function DonutChart({ apps, isDark }) {
  const counts = {
    onboarded: apps.filter((a) => a.status === "onboarded").length,
    in_progress: apps.filter((a) => a.status === "in_progress").length,
    pending: apps.filter((a) => a.status === "pending").length,
    not_started: apps.filter((a) => a.status === "not_started").length,
  };
  const total = apps.length;
  const colors = {
    onboarded: "#4ade80",
    in_progress: "#60a5fa",
    pending: "#f59e0b",
    not_started: "#6b7280",
  };
  const labels = {
    onboarded: "● Onboarded",
    in_progress: "◐ In Progress",
    pending: "○ Pending",
    not_started: "— Not Started",
  };
  const r2 = 54;
  const cx2 = 70;
  const cy = 70;
  let offset = 0;
  const segments = Object.entries(counts).map(([key, count]) => {
    const pct = total > 0 ? count / total : 0;
    const len = pct * 2 * Math.PI * r2;
    const seg = {
      key,
      count,
      color: colors[key],
      offset,
      len,
    };
    offset += len;
    return seg;
  });
  const centerTextColor = isDark ? "#fff" : "#0f172a";
  const mutedTextColor = isDark ? "#6b7280" : "#94a3b8";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      <svg
        width={140}
        height={140}
        style={{
          flexShrink: 0,
        }}
        role={"img"}
        aria-label={"Application status donut chart"}
      >
        {segments.map(({ key, color, offset: off, len }) => (
          <circle
            cx={cx2}
            cy={cy}
            r={r2}
            fill={"none"}
            stroke={color}
            strokeWidth={16}
            strokeDasharray={`${len} ${2 * Math.PI * r2 - len}`}
            strokeDashoffset={-off + (Math.PI * r2) / 2}
            transform={`rotate(-90 ${cx2} ${cy})`}
            style={{
              transition: "all 0.4s ease",
            }}
            key={key}
          />
        ))}
        <text
          x={cx2}
          y={cy - 6}
          textAnchor={"middle"}
          fill={centerTextColor}
          fontSize={20}
          fontWeight={700}
        >
          {total}
        </text>
        <text
          x={cx2}
          y={cy + 12}
          textAnchor={"middle"}
          fill={mutedTextColor}
          fontSize={10}
        >
          {"TOTAL"}
        </text>
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {Object.entries(counts).map(([key, count]) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            key={key}
          >
            <span
              style={{
                color: colors[key],
                fontSize: 13,
              }}
            >
              {labels[key]}
            </span>
            <span
              style={{
                color: mutedTextColor,
                fontSize: 13,
              }}
            >
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export { DonutChart };
