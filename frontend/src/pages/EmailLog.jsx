import { MetricCard } from "../components/common/MetricCard.jsx";
import * as React from "react";
import { useTheme } from "../contexts/ThemeContext.jsx";
const TYPE_COLORS = {
  reminder: {
    bg: "rgba(96,165,250,0.15)",
    color: "#60a5fa",
  },
  escalation: {
    bg: "rgba(248,113,113,0.15)",
    color: "#f87171",
  },
  welcome: {
    bg: "rgba(74,222,128,0.15)",
    color: "#4ade80",
  },
};
function EmailLog({
  apps,
  emails,
  onSendReminder,
  onEscalateCISO,
  onRemindAll,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const emailsSent = emails.length;
  const appsReminded = new Set(emails.map((e) => e.appId)).size;
  const avgReminders =
    apps.length > 0
      ? (apps.reduce((s, a) => s + a.reminders, 0) / apps.length).toFixed(1)
      : "0.0";
  const escalations = emails.filter((e) => e.emailType === "escalation").length;
  const headingColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "#6b7280" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const sectionBorder = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const rowBorder = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const thColor = isDark ? "#a5b4c8" : "#52637b";
  const tdPrimaryColor = isDark ? "#e5e7eb" : "#374151";
  const tdSecondary = isDark ? "#9ca3af" : "#64748b";
  const tdMuted = isDark ? "#a5b4c8" : "#52637b";
  const trackerName = isDark ? "#e5e7eb" : "#374151";
  const trackerDept = isDark ? "#a5b4c8" : "#52637b";
  return (
    <div
      className={"email-page"}
      style={{
        animation: "fadeUp 0.4s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: headingColor,
            }}
          >
            {"Communications Overview"}
          </div>
          <div
            style={{
              fontSize: 13,
              color: subColor,
            }}
          >
            {"Reminder tracking and escalation management"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <button
            type={"button"}
            data-ocid={"email.remind_all_button"}
            onClick={onRemindAll}
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 7,
              padding: "8px 16px",
              color: "#818cf8",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                width={18}
                height={18}
                viewBox={"0 0 24 24"}
                fill={"none"}
                stroke={"currentColor"}
                strokeWidth={1.8}
                strokeLinecap={"round"}
                strokeLinejoin={"round"}
                aria-hidden={true}
                style={{
                  flexShrink: 0,
                }}
              >
                <path d={"M3 5h18v14H3z M3 6l9 7 9-7"} />
              </svg>
              {"Remind All Owners"}
            </span>
          </button>
          <button
            type={"button"}
            data-ocid={"email.escalate_ciso_button"}
            onClick={() => {
              for (const a of apps.filter(
                (a2) =>
                  a2.criticality === "critical" && a2.status !== "onboarded",
              )) {
                onEscalateCISO(a);
              }
            }}
            style={{
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 7,
              padding: "8px 16px",
              color: "#f87171",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                width={18}
                height={18}
                viewBox={"0 0 24 24"}
                fill={"none"}
                stroke={"currentColor"}
                strokeWidth={1.8}
                strokeLinecap={"round"}
                strokeLinejoin={"round"}
                aria-hidden={true}
                style={{
                  flexShrink: 0,
                }}
              >
                <path
                  d={
                    "M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M12 15V8 M9 11l3-3 3 3"
                  }
                />
              </svg>
              {"Escalate to CISO"}
            </span>
          </button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricCard
          label={"Emails Sent"}
          icon={
            <svg
              width={24}
              height={24}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"#6366f1"}
              strokeWidth={1.8}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
              aria-hidden={true}
            >
              <path d={"M3 5h18v14H3z M3 6l9 7 9-7"} />
            </svg>
          }
          value={emailsSent}
          subtitle={"Total notifications dispatched"}
          color={"#6366f1"}
          isDark={isDark}
        />
        <MetricCard
          label={"Apps Reminded"}
          icon={
            <svg
              width={24}
              height={24}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"#60a5fa"}
              strokeWidth={1.8}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
              aria-hidden={true}
            >
              <path
                d={"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4"}
              />
            </svg>
          }
          value={appsReminded}
          subtitle={"Unique applications"}
          color={"#60a5fa"}
          isDark={isDark}
        />
        <MetricCard
          label={"Avg Reminders"}
          icon={
            <svg
              width={24}
              height={24}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"#d97706"}
              strokeWidth={1.8}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
              aria-hidden={true}
            >
              <path d={"M4 3v17h17 M8 16v-5 M13 16V7 M18 16v-8"} />
            </svg>
          }
          value={avgReminders}
          subtitle={"Per application"}
          color={"#f59e0b"}
          isDark={isDark}
        />
        <MetricCard
          label={"CISO Escalations"}
          icon={
            <svg
              width={24}
              height={24}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"#ef4444"}
              strokeWidth={1.8}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
              aria-hidden={true}
            >
              <path
                d={"M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M12 8v5 M12 16h.01"}
              />
            </svg>
          }
          value={escalations}
          subtitle={"Critical escalations sent"}
          color={"#f87171"}
          isDark={isDark}
        />
      </div>
      <div
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 10,
          padding: "0 0 4px",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${sectionBorder}`,
            fontSize: 13,
            fontWeight: 600,
            color: headingColor,
          }}
        >
          {"Reminder Tracker"}
        </div>
        {apps.map((app, idx) => (
          <div
            data-ocid={`email.tracker.item.${idx + 1}`}
            className={"email-tracker-row"}
            style={{
              padding: "10px 20px",
              borderBottom: `1px solid ${rowBorder}`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
            key={app.id}
          >
            <div
              style={{
                minWidth: 160,
                flex: "1 1 160px",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: trackerName,
                  fontWeight: 500,
                }}
              >
                {app.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: trackerDept,
                }}
              >
                {app.department}
              </div>
            </div>
            <div className={"email-reminder-count"}>
              <strong>{app.reminders}</strong>
              <span>
                {app.reminders === 1 ? "reminder sent" : "reminders sent"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                marginLeft: "auto",
              }}
            >
              <button
                type={"button"}
                data-ocid={`email.owner_remind.${idx + 1}`}
                onClick={() => onSendReminder(app)}
                style={{
                  background: "rgba(96,165,250,0.1)",
                  border: "1px solid rgba(96,165,250,0.2)",
                  borderRadius: 5,
                  padding: "4px 10px",
                  color: "#60a5fa",
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                {"Owner"}
              </button>
              <button
                type={"button"}
                data-ocid={`email.biz_owner_remind.${idx + 1}`}
                onClick={() => onSendReminder(app)}
                style={{
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.2)",
                  borderRadius: 5,
                  padding: "4px 10px",
                  color: "#4ade80",
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                {"Business Owner"}
              </button>
              <button
                type={"button"}
                data-ocid={`email.ciso_escalate.${idx + 1}`}
                onClick={() => onEscalateCISO(app)}
                style={{
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  borderRadius: 5,
                  padding: "4px 10px",
                  color: "#f87171",
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                {"CISO"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${sectionBorder}`,
            fontSize: 13,
            fontWeight: 600,
            color: headingColor,
          }}
        >{`Email History (${emails.length})`}</div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${sectionBorder}`,
              }}
            >
              {["APP", "RECIPIENT", "TYPE", "#", "SENT TIME"].map((h) => (
                <th
                  style={{
                    padding: "8px 14px",
                    textAlign: "left",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    color: thColor,
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                  key={h}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {emails.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  data-ocid={"email.empty_state"}
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    color: tdMuted,
                    fontSize: 13,
                  }}
                >
                  {"No emails sent yet. Use REMIND buttons to send reminders."}
                </td>
              </tr>
            )}
            {[...emails].reverse().map((e, i) => {
              const tc = TYPE_COLORS[e.emailType];
              return (
                <tr
                  data-ocid={`email.history.item.${i + 1}`}
                  data-email-type={e.emailType}
                  className={"row-hover"}
                  style={{
                    borderBottom: `1px solid ${rowBorder}`,
                  }}
                  key={e.id}
                >
                  <td
                    style={{
                      padding: "9px 14px",
                      fontSize: 13,
                      color: tdPrimaryColor,
                    }}
                  >
                    {e.appName}
                  </td>
                  <td
                    style={{
                      padding: "9px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: tdSecondary,
                      }}
                    >
                      {e.recipient}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: tdMuted,
                      }}
                    >
                      {e.recipientEmail}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "9px 14px",
                    }}
                  >
                    <span
                      style={{
                        background: tc.bg,
                        color: tc.color,
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {e.emailType}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "9px 14px",
                      fontSize: 13,
                      color: tdMuted,
                    }}
                  >
                    {"#"}
                    {e.reminderNumber}
                  </td>
                  <td
                    style={{
                      padding: "9px 14px",
                      fontSize: 11,
                      color: tdMuted,
                    }}
                  >
                    {new Date(e.sentAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export { TYPE_COLORS, EmailLog };
