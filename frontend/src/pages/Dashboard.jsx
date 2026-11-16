import { DEPARTMENTS } from "../data/departments.js";
import { DonutChart } from "../components/dashboard/DonutChart.jsx";
import { MetricCard } from "../components/common/MetricCard.jsx";
import { ProgressBar } from "../components/common/ProgressBar.jsx";
import { StatusBadge } from "../components/common/Badges.jsx";
import { getAppProgress } from "../utils/progress.js";
import * as React from "react";
import { useTheme } from "../contexts/ThemeContext.jsx";
function Dashboard({
  apps,
  onSendReminder,
  onOpenModal: _onOpenModal,
  emails: _emails,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const total = apps.length;
  const onboarded = apps.filter((a) => a.status === "onboarded").length;
  const inProgress = apps.filter((a) => a.status === "in_progress").length;
  const notStarted = apps.filter((a) => a.status === "not_started").length;
  const patternCounts = {
    OOTB: apps.filter((a) => {
      var _a2;
      return (
        ((_a2 = a.aiAssessment) == null ? void 0 : _a2.integrationPattern) ===
        "OOTB"
      );
    }).length,
    "Custom-Simple": apps.filter((a) => {
      var _a2;
      return (
        ((_a2 = a.aiAssessment) == null ? void 0 : _a2.integrationPattern) ===
        "Custom-Simple"
      );
    }).length,
    "Custom-Medium": apps.filter((a) => {
      var _a2;
      return (
        ((_a2 = a.aiAssessment) == null ? void 0 : _a2.integrationPattern) ===
        "Custom-Medium"
      );
    }).length,
    "Custom-Complex": apps.filter((a) => {
      var _a2;
      return (
        ((_a2 = a.aiAssessment) == null ? void 0 : _a2.integrationPattern) ===
        "Custom-Complex"
      );
    }).length,
    Unassessed: apps.filter((a) => !a.aiAssessment).length,
  };
  function getProgressSteps(app) {
    var _a2;
    const jml = app.jmlTests;
    const jmlScenarios = jml ? [jml.joiner, jml.mover, jml.leaver] : [];
    const ranScenarios = jmlScenarios.filter((t) => t != null);
    const allRanPassed =
      ranScenarios.length > 0 &&
      ranScenarios.every((t) => (t == null ? void 0 : t.status) === "pass");
    return [
      {
        label: "AI Assessment",
        done: app.aiAssessment != null,
      },
      {
        label: "Connection Tested & Passed",
        done: app.connectionTestPassed === true,
      },
      {
        label: "Integration Spec Approved",
        done:
          ((_a2 = app.specDocument) == null ? void 0 : _a2.status) ===
          "approved",
      },
      {
        label: "Functional Test Pass",
        done: (app.functionalTests ?? []).some((t) => t.status === "pass"),
      },
      {
        label: "JML Tests Passed",
        done: allRanPassed,
      },
    ];
  }
  const attentionApps = apps.filter(
    (a) => a.criticality === "critical" && a.status !== "onboarded",
  );
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const headingColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "#a5b4c8" : "#52637b";
  const sectionHeadColor = isDark ? "#e5e7eb" : "#374151";
  const labelColor = isDark ? "#9ca3af" : "#64748b";
  const countColor = isDark ? "#a5b4c8" : "#52637b";
  const patternItemBg = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const patternLabelColor = isDark ? "#e5e7eb" : "#374151";
  const unassessedBarColor = isDark ? "#374151" : "#cbd5e1";
  const CARD_STYLE = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 10,
    padding: 16,
  };
  return (
    <div
      className={"dashboard-content"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        animation: "fadeUp 0.4s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
        }}
      >
        <MetricCard
          label={"Total Apps"}
          value={total}
          icon={
            <svg
              width={22}
              height={22}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"currentColor"}
              strokeWidth={1.7}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
              aria-hidden={true}
            >
              <path
                d={"M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z"}
              />
            </svg>
          }
          subtitle={"All registered applications"}
          isDark={isDark}
        />
        <MetricCard
          label={"Onboarded"}
          value={onboarded}
          icon={
            <svg
              width={22}
              height={22}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"currentColor"}
              strokeWidth={1.7}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
              aria-hidden={true}
            >
              <path d={"M9 12l2 2 4-5 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"} />
            </svg>
          }
          subtitle={"Successfully integrated"}
          color={"#4ade80"}
          isDark={isDark}
        />
        <MetricCard
          label={"In Progress"}
          value={inProgress}
          icon={
            <svg
              width={22}
              height={22}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"currentColor"}
              strokeWidth={1.7}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
              aria-hidden={true}
            >
              <path d={"M12 3a9 9 0 1 1-9 9 M12 7v5l3 2 M3 3v5h5"} />
            </svg>
          }
          subtitle={"Currently being configured"}
          color={"#60a5fa"}
          isDark={isDark}
        />
        <MetricCard
          label={"Not Started"}
          value={notStarted}
          icon={
            <svg
              width={22}
              height={22}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"currentColor"}
              strokeWidth={1.7}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
              aria-hidden={true}
            >
              <path d={"M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"} />
            </svg>
          }
          subtitle={"Awaiting initiation"}
          color={"#6b7280"}
          isDark={isDark}
        />
      </div>
      <div style={CARD_STYLE}>
        <div
          style={{
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: headingColor,
            }}
          >
            {"AI Integration Pattern Overview"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: subColor,
            }}
          >
            {"Connector classification for all registered applications"}
          </div>
        </div>
        <div
          className={"pattern-kpi-grid"}
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {[
            {
              label: "OOTB Connectors",
              count: patternCounts.OOTB,
              color: "#4ade80",
              icon: "✓",
              desc: "Pre-built connectors",
            },
            {
              label: "Custom-Simple",
              count: patternCounts["Custom-Simple"],
              color: "#60a5fa",
              icon: "◈",
              desc: "1-2 weeks dev",
            },
            {
              label: "Custom-Medium",
              count: patternCounts["Custom-Medium"],
              color: "#f59e0b",
              icon: "◆",
              desc: "3-6 weeks dev",
            },
            {
              label: "Custom-Complex",
              count: patternCounts["Custom-Complex"],
              color: "#f87171",
              icon: "⬡",
              desc: "8-16 weeks dev",
            },
            {
              label: "Unassessed",
              count: patternCounts.Unassessed,
              color: "#6b7280",
              icon: "?",
              desc: "Not yet analyzed",
            },
          ].map(({ label, count, color, icon, desc }) => (
            <div
              style={{
                flex: 1,
                background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                borderRadius: 12,
                boxShadow: isDark ? "none" : "0 3px 12px #14345908",
                padding: "12px 14px",
              }}
              key={label}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: patternLabelColor,
                  }}
                >
                  {count}
                </span>
                <span
                  style={{
                    color: subColor,
                    fontSize: 18,
                  }}
                >
                  {icon}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: patternLabelColor,
                  marginTop: 4,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: subColor,
                  marginTop: 2,
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            height: 6,
            borderRadius: 3,
            overflow: "hidden",
            gap: 1,
          }}
        >
          {Object.entries(patternCounts).map(([k, v]) => {
            const colors = {
              OOTB: "#4ade80",
              "Custom-Simple": "#60a5fa",
              "Custom-Medium": "#f59e0b",
              "Custom-Complex": "#f87171",
              Unassessed: unassessedBarColor,
            };
            return (
              <div
                style={{
                  flex: v,
                  background: colors[k],
                  transition: "flex 0.3s ease",
                }}
                key={k}
              />
            );
          })}
        </div>
      </div>
      <div
        className={"dashboard-insights"}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div style={CARD_STYLE}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: sectionHeadColor,
              marginBottom: 16,
            }}
          >
            {"Overall Health"}
          </div>
          <DonutChart apps={apps} isDark={isDark} />
          <div className={"dashboard-health-summary"}>
            <strong>{`${total ? Math.round((onboarded / total) * 100) : 0}% onboarded`}</strong>
            <span>{`${apps.filter((a) => a.status === "pending").length} pending review | ${inProgress} in progress`}</span>
          </div>
        </div>
        <div style={CARD_STYLE}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: sectionHeadColor,
              marginBottom: 16,
            }}
          >
            {"Department Progress"}
          </div>
          <div className={"dashboard-departments"}>
            {DEPARTMENTS.map((dept) => {
              const dApps = apps.filter((a) => a.department === dept);
              if (!dApps.length) return null;
              const avg = Math.round(
                dApps.reduce((s, a) => s + getAppProgress(a), 0) / dApps.length,
              );
              return (
                <div key={dept}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: labelColor,
                      }}
                    >
                      {dept}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: countColor,
                      }}
                    >
                      {dApps.length}
                      {" app"}
                      {dApps.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className={"department-progress"}>
                    <div
                      className={"department-progress-track"}
                      role={"progressbar"}
                      aria-label={`${dept} onboarding progress`}
                      aria-valuenow={avg}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        style={{
                          width: `${avg}%`,
                        }}
                      />
                    </div>
                    <span>{`${avg}%`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {attentionApps.length > 0 && (
        <div>
          <div
            style={{
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: headingColor,
              }}
            >
              {"Attention Required"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: subColor,
              }}
            >
              {"Critical applications pending onboarding"}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {attentionApps.map((app) => (
              <div
                data-ocid={`attention.item.${app.id}`}
                style={{
                  ...CARD_STYLE,
                  borderLeft: "3px solid #f87171",
                }}
                key={app.id}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: headingColor,
                    marginBottom: 4,
                  }}
                >
                  {app.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      background: "rgba(248,113,113,0.15)",
                      color: "#f87171",
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 3,
                      fontWeight: 600,
                    }}
                  >
                    {app.department}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                <ProgressBar
                  value={getAppProgress(app)}
                  steps={getProgressSteps(app)}
                />
                <div
                  style={{
                    fontSize: 11,
                    color: subColor,
                    margin: "8px 0",
                  }}
                >
                  {app.owner}
                </div>
                <button
                  type={"button"}
                  data-ocid={`attention.remind_button.${app.id}`}
                  onClick={() => onSendReminder(app)}
                  style={{
                    width: "100%",
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: 6,
                    padding: "7px",
                    color: "#818cf8",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {"Send reminder"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export { Dashboard };
