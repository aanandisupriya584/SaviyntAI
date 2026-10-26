import { FunctionalTestModal } from "../components/application-details/FunctionalTestModal.jsx";
import { OOTBBadge, StatusBadge } from "../components/common/Badges.jsx";
import { ProgressBar } from "../components/common/ProgressBar.jsx";
import { getAppProgress } from "../utils/progress.js";
import { getConnectorSchema } from "../data/connectors.js";
import * as React from "react";
import { useTheme } from "../contexts/ThemeContext.jsx";
function Applications({
  apps,
  onSendReminder,
  onOpenModal,
  onSubmitToSaviynt,
  onBulkRemind,
  onRunFunctionalTest,
  onUpdateApp: _onUpdateApp,
  onAddToast,
}) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [deptFilter, setDeptFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("name-asc");
  const [progressFilter, setProgressFilter] = React.useState("any");
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [testingApp, setTestingApp] = React.useState(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const headingColor = isDark ? "#fff" : "#0f172a";
  const subColor = isDark ? "#6b7280" : "#64748b";
  const thColor = isDark ? "#b0bfd2" : "#52637b";
  const rowBorder = isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9";
  const ownerTextColor = isDark ? "#e5e7eb" : "#374151";
  const ownerEmailColor = isDark ? "#94a3b8" : "#52637b";
  const deptTextColor = isDark ? "#9ca3af" : "#64748b";
  const editBtnBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const editBtnBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const editBtnColor = isDark ? "#9ca3af" : "#64748b";
  const remindBtnBorder = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const remindBtnColor = isDark ? "#6b7280" : "#94a3b8";
  const SEL_STYLE = {
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "6px 10px",
    color: isDark ? "#9ca3af" : "#64748b",
    fontSize: 12,
    cursor: "pointer",
  };
  const departments = React.useMemo(
    () => [...new Set(apps.map((a) => a.department))].sort(),
    [apps],
  );
  const PROGRESS_THRESHOLDS = {
    below25: 25,
    below50: 50,
    below75: 75,
    below100: 100,
  };
  function getProgressSteps(app) {
    var _a2;
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
        label: "Saviynt Endpoint Registered",
        done: app.saviyntEndpointRegistered === true,
      },
    ];
  }
  const filtered = React.useMemo(() => {
    let list = apps.filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (deptFilter !== "all" && a.department !== deptFilter) return false;
      if (progressFilter !== "any") {
        const threshold = PROGRESS_THRESHOLDS[progressFilter];
        if (threshold !== void 0 && getAppProgress(a) >= threshold)
          return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "progress-asc")
        return getAppProgress(a) - getAppProgress(b);
      if (sortBy === "progress-desc")
        return getAppProgress(b) - getAppProgress(a);
      if (sortBy === "updated")
        return b.lastUpdated.localeCompare(a.lastUpdated);
      return 0;
    });
    return list;
  }, [apps, search, statusFilter, deptFilter, sortBy, progressFilter]);
  const allSelected =
    filtered.length > 0 && filtered.every((a) => selectedIds.includes(a.id));
  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : filtered.map((a) => a.id));
  const toggleOne = (id) =>
    setSelectedIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  const CRIT_COLORS = {
    critical: "#f87171",
    high: "#f59e0b",
    medium: "#60a5fa",
    low: "#6b7280",
  };
  function exportToCSV() {
    const header = [
      "Name",
      "Status",
      "Progress",
      "Integration Pattern",
      "Connector Name",
      "Effort Estimate",
      "Criticality",
      "Owner",
    ];
    const rows = apps.map((a2) => {
      var _a2, _b2, _c2;
      return [
        a2.name,
        a2.status,
        String(getAppProgress(a2)),
        ((_a2 = a2.aiAssessment) == null ? void 0 : _a2.integrationPattern) ??
          "",
        ((_b2 = a2.aiAssessment) == null ? void 0 : _b2.connectorName) ?? "",
        ((_c2 = a2.aiAssessment) == null ? void 0 : _c2.effortEstimate) ?? "",
        a2.criticality,
        a2.owner,
      ];
    });
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saviynt-applications.csv";
    a.click();
    URL.revokeObjectURL(url);
    onAddToast("↓ Applications exported to CSV", "success");
  }
  function bulkAIAssess() {
    onAddToast("Open each app's AI Assessment tab to run analysis", "info");
  }
  return (
    <div
      className={"applications-page"}
      style={{
        animation: "fadeUp 0.4s ease",
      }}
    >
      <div
        style={{
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
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
              {"Application Registry"}
            </div>
            <div
              style={{
                fontSize: 13,
                color: subColor,
              }}
            >{`${filtered.length} of ${apps.length} applications shown`}</div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button
              type={"button"}
              data-ocid={"apps.bulk_ai_assess_button"}
              onClick={bulkAIAssess}
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.35)",
                borderRadius: 7,
                padding: "7px 14px",
                color: "#818cf8",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {"Bulk AI Assess"}
            </button>
            <button
              type={"button"}
              data-ocid={"apps.export_csv_button"}
              onClick={exportToCSV}
              style={{
                background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: 7,
                padding: "7px 14px",
                color: "#4ade80",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {"Export CSV"}
            </button>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: "1 1 200px",
          }}
        >
          <span className={"apps-search-icon"} aria-hidden={true}>
            <svg
              width={14}
              height={14}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"currentColor"}
              strokeWidth={1.5}
              strokeLinecap={"round"}
            >
              <circle cx={10.5} cy={10.5} r={6} />
              <path d={"m15 15 4.5 4.5"} />
            </svg>
          </span>
          <input
            data-ocid={"apps.search_input"}
            type={"search"}
            placeholder={"Search applications..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...SEL_STYLE,
              paddingLeft: 48,
              width: "100%",
            }}
          />
        </div>
        <select
          data-ocid={"apps.status_filter"}
          style={SEL_STYLE}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value={"all"}>{"All Status"}</option>
          <option value={"onboarded"}>{"Onboarded"}</option>
          <option value={"in_progress"}>{"In Progress"}</option>
          <option value={"pending"}>{"Pending"}</option>
          <option value={"not_started"}>{"Not Started"}</option>
        </select>
        <select
          data-ocid={"apps.dept_filter"}
          style={SEL_STYLE}
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value={"all"}>{"All Departments"}</option>
          {departments.map((d) => (
            <option value={d} key={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          data-ocid={"apps.sort_select"}
          style={SEL_STYLE}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value={"name-asc"}>{"Name A-Z"}</option>
          <option value={"name-desc"}>{"Name Z-A"}</option>
          <option value={"progress-asc"}>{"Progress ↑"}</option>
          <option value={"progress-desc"}>{"Progress ↓"}</option>
          <option value={"updated"}>{"Last Updated"}</option>
        </select>
        <select
          data-ocid={"apps.progress_filter"}
          style={SEL_STYLE}
          value={progressFilter}
          onChange={(e) => setProgressFilter(e.target.value)}
        >
          <option value={"any"}>{"Any Progress"}</option>
          <option value={"below25"}>{"Below 25%"}</option>
          <option value={"below50"}>{"Below 50%"}</option>
          <option value={"below75"}>{"Below 75%"}</option>
          <option value={"below100"}>{"Below 100%"}</option>
        </select>
      </div>
      {selectedIds.length > 0 && (
        <div
          data-ocid={"apps.bulk_bar"}
          style={{
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 8,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              color: "#818cf8",
              fontSize: 13,
            }}
          >
            {selectedIds.length}
            {" selected"}
          </span>
          <button
            type={"button"}
            data-ocid={"apps.bulk_remind_button"}
            onClick={() => {
              onBulkRemind(selectedIds);
              setSelectedIds([]);
            }}
            style={{
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: 6,
              padding: "6px 14px",
              color: "#818cf8",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {"✉ Remind All Selected"}
          </button>
        </div>
      )}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${cardBorder}`,
              }}
            >
              <th
                style={{
                  width: 40,
                  padding: "10px 14px",
                }}
              >
                <input
                  type={"checkbox"}
                  checked={allSelected}
                  onChange={toggleAll}
                  style={{
                    accentColor: "#6366f1",
                  }}
                />
              </th>
              {[
                "APPLICATION",
                "DEPT",
                "OWNER",
                "STATUS",
                "INTEGRATION MODE",
                "OVERALL PROGRESS",
                "TESTS",
                "ACTIONS",
              ].map((h) => (
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    color: thColor,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                  key={h}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((app, idx) => {
              var _a2;
              const passCount = app.functionalTests.filter(
                (t) => t.status === "pass",
              ).length;
              const failCount = app.functionalTests.filter(
                (t) => t.status === "fail" || t.status === "error",
              ).length;
              return (
                <tr
                  data-ocid={`apps.item.${idx + 1}`}
                  className={"row-hover"}
                  data-status={app.status}
                  data-criticality={app.criticality}
                  style={{
                    borderBottom: `1px solid ${rowBorder}`,
                  }}
                  key={app.id}
                >
                  <td
                    style={{
                      padding: "10px 14px",
                    }}
                  >
                    <input
                      type={"checkbox"}
                      checked={selectedIds.includes(app.id)}
                      onChange={() => toggleOne(app.id)}
                      style={{
                        accentColor: "#6366f1",
                      }}
                    />
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      minWidth: 160,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: headingColor,
                        fontSize: 13,
                      }}
                    >
                      {app.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginTop: 3,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          padding: "1px 6px",
                          borderRadius: 3,
                          background: `${CRIT_COLORS[app.criticality]}22`,
                          color: CRIT_COLORS[app.criticality],
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {app.criticality}
                      </span>
                      {app.reminders > 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            color: subColor,
                          }}
                        >
                          {"✉ "}
                          {app.reminders}
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: deptTextColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {app.department}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      minWidth: 130,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: ownerTextColor,
                      }}
                    >
                      {app.owner}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: ownerEmailColor,
                      }}
                    >
                      {app.ownerEmail}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                    }}
                  >
                    <StatusBadge status={app.status} />
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                    }}
                  >
                    <OOTBBadge
                      hasOOTB={getConnectorSchema(app.name).hasOOTB}
                      integrationPattern={
                        ((_a2 = app.aiAssessment) == null
                          ? void 0
                          : _a2.integrationPattern) ?? null
                      }
                      isDark={isDark}
                    />
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      minWidth: 120,
                    }}
                  >
                    <ProgressBar
                      value={getAppProgress(app)}
                      compact={true}
                      steps={getProgressSteps(app)}
                    />
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      minWidth: 80,
                    }}
                  >
                    {app.functionalTests.length === 0 ? (
                      <span
                        style={{
                          fontSize: 11,
                          color: isDark ? "#94a3b8" : "#52637b",
                        }}
                      >
                        {"No tests"}
                      </span>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        {passCount > 0 && (
                          <span
                            style={{
                              fontSize: 10,
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: "rgba(74,222,128,0.12)",
                              color: "#4ade80",
                              fontWeight: 600,
                            }}
                          >
                            {"✓ "}
                            {passCount}
                          </span>
                        )}
                        {failCount > 0 && (
                          <span
                            style={{
                              fontSize: 10,
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: "rgba(248,113,113,0.12)",
                              color: "#f87171",
                              fontWeight: 600,
                            }}
                          >
                            {"✗ "}
                            {failCount}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 5,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type={"button"}
                        data-ocid={`apps.test_button.${idx + 1}`}
                        onClick={() => setTestingApp(app)}
                        style={{
                          background: "rgba(96,165,250,0.12)",
                          border: "1px solid rgba(96,165,250,0.3)",
                          borderRadius: 5,
                          padding: "4px 9px",
                          color: "#60a5fa",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {"Test"}
                      </button>
                      <button
                        type={"button"}
                        data-ocid={`apps.edit_button.${idx + 1}`}
                        onClick={() => onOpenModal(app, 0)}
                        style={{
                          background: editBtnBg,
                          border: `1px solid ${editBtnBorder}`,
                          borderRadius: 5,
                          padding: "4px 9px",
                          color: editBtnColor,
                          cursor: "pointer",
                          fontSize: 11,
                        }}
                      >
                        {"Edit"}
                      </button>
                      <button
                        type={"button"}
                        data-ocid={`apps.remind_button.${idx + 1}`}
                        onClick={() => onSendReminder(app)}
                        style={{
                          background: "none",
                          border: `1px solid ${remindBtnBorder}`,
                          borderRadius: 5,
                          padding: "4px 7px",
                          color: remindBtnColor,
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                        aria-label={"Send reminder"}
                      >
                        {"✉"}
                      </button>
                      {getAppProgress(app) === 100 && (
                        <button
                          type={"button"}
                          data-ocid={`apps.submit_button.${idx + 1}`}
                          onClick={() => onSubmitToSaviynt(app)}
                          style={{
                            background: "rgba(99,102,241,0.2)",
                            border: "1px solid rgba(99,102,241,0.4)",
                            borderRadius: 5,
                            padding: "4px 7px",
                            color: "#818cf8",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                          aria-label={"Submit to Saviynt"}
                        >
                          {"⚡"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  data-ocid={"apps.empty_state"}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: isDark ? "#94a3b8" : "#52637b",
                    fontSize: 13,
                  }}
                >
                  {"No applications match your filters"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {testingApp && (
        <FunctionalTestModal
          app={testingApp}
          onClose={() => setTestingApp(null)}
          onTestComplete={(result) => {
            onRunFunctionalTest(testingApp.id, result);
            setTestingApp(null);
          }}
        />
      )}
    </div>
  );
}
export { Applications };
