import { SPEC_STATUS_LABELS, formatBytes } from "./documentUtils.js";
import * as React from "react";
function IntegrationSpecTab({
  app: _app,
  specDoc,
  isDark,
  border,
  cardBg,
  titleColor,
  textColor,
  mutedColor,
  dimColor,
  inputStyle,
  fileInputRef,
  revisionComment,
  setRevisionComment,
  showRevisionInput,
  setShowRevisionInput,
  revisionError,
  setRevisionError,
  onDownloadTemplate,
  onFileUpload,
  onApprove,
  onRequestRevisions,
}) {
  const statusInfo =
    SPEC_STATUS_LABELS[(specDoc == null ? void 0 : specDoc.status) ?? "none"];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          type={"button"}
          data-ocid={"details.spec_download_template_button"}
          onClick={onDownloadTemplate}
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: 7,
            padding: "8px 16px",
            color: "#818cf8",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {"⬇ Download Template"}
        </button>
        <button
          type={"button"}
          data-ocid={"details.spec_upload_button"}
          onClick={() => {
            var _a2;
            return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
          }}
          style={{
            background: "rgba(74,222,128,0.12)",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: 7,
            padding: "8px 16px",
            color: "#4ade80",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <React.Fragment>
            <svg
              width={20}
              height={20}
              viewBox={"0 0 24 24"}
              fill={"none"}
              stroke={"currentColor"}
              strokeWidth={2}
              strokeLinecap={"round"}
              strokeLinejoin={"round"}
              aria-hidden={true}
            >
              <path
                d={
                  "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                }
              />
            </svg>
            {"Upload Spec"}
          </React.Fragment>
        </button>
        <input
          ref={fileInputRef}
          type={"file"}
          accept={".docx,.pdf,.txt,.doc"}
          style={{
            display: "none",
          }}
          onChange={onFileUpload}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: mutedColor,
            fontWeight: 500,
          }}
        >
          {"Document Status:"}
        </span>
        <span
          style={{
            fontSize: 12,
            padding: "4px 12px",
            borderRadius: 6,
            background: `${statusInfo.color}22`,
            color: statusInfo.color,
            fontWeight: 700,
          }}
        >
          {statusInfo.label}
        </span>
      </div>
      {specDoc ? (
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 24,
              }}
            >
              {"📄"}
            </span>
            <div
              style={{
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: titleColor,
                }}
              >
                {specDoc.fileName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: dimColor,
                  marginTop: 2,
                }}
              >
                {"Uploaded by "}
                {specDoc.uploadedBy}
                {" ·"} {new Date(specDoc.uploadedAt).toLocaleString()}
                {" ·"} {formatBytes(specDoc.size)}
              </div>
              {specDoc.approvedAt && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#4ade80",
                    marginTop: 2,
                  }}
                >
                  {"✓ Approved by "}
                  {specDoc.approvedBy}
                  {" on"} {new Date(specDoc.approvedAt).toLocaleDateString()}
                </div>
              )}
              {specDoc.revisionComment && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#f87171",
                    marginTop: 2,
                  }}
                >
                  {"⚠ Revision note: "}
                  {specDoc.revisionComment}
                </div>
              )}
            </div>
          </div>
          {specDoc.status === "pending_review" && (
            <div
              style={{
                borderTop: `1px solid ${border}`,
                paddingTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: mutedColor,
                }}
              >
                {"IGA Admin Review"}
              </div>
              {!showRevisionInput ? (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <button
                    type={"button"}
                    data-ocid={"details.spec_approve_button"}
                    onClick={onApprove}
                    style={{
                      background: "rgba(74,222,128,0.15)",
                      border: "1px solid rgba(74,222,128,0.3)",
                      borderRadius: 6,
                      padding: "7px 16px",
                      color: "#4ade80",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {"✓ Approve"}
                  </button>
                  <button
                    type={"button"}
                    data-ocid={"details.spec_request_revisions_button"}
                    onClick={() => setShowRevisionInput(true)}
                    style={{
                      background: "rgba(248,113,113,0.12)",
                      border: "1px solid rgba(248,113,113,0.3)",
                      borderRadius: 6,
                      padding: "7px 16px",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {"✎ Request Revisions"}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <textarea
                    data-ocid={"details.spec_revision_comment_input"}
                    value={revisionComment}
                    onChange={(e) => {
                      setRevisionComment(e.target.value);
                      setRevisionError("");
                    }}
                    placeholder={
                      "Describe what revisions are needed (min. 10 characters)..."
                    }
                    style={{
                      ...inputStyle,
                      height: 80,
                      resize: "vertical",
                    }}
                  />
                  {revisionError && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#f87171",
                      }}
                    >
                      {revisionError}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <button
                      type={"button"}
                      data-ocid={"details.spec_revision_submit_button"}
                      onClick={onRequestRevisions}
                      style={{
                        background: "rgba(248,113,113,0.15)",
                        border: "1px solid rgba(248,113,113,0.3)",
                        borderRadius: 6,
                        padding: "7px 16px",
                        color: "#f87171",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {"Send Revision Request"}
                    </button>
                    <button
                      type={"button"}
                      data-ocid={"details.spec_revision_cancel_button"}
                      onClick={() => {
                        setShowRevisionInput(false);
                        setRevisionComment("");
                        setRevisionError("");
                      }}
                      style={{
                        background: "none",
                        border: `1px solid ${border}`,
                        borderRadius: 6,
                        padding: "7px 14px",
                        color: mutedColor,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      {"Cancel"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 10,
            padding: "28px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 32,
              marginBottom: 8,
            }}
          >
            {"📋"}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? "#4b5563" : "#94a3b8",
              marginBottom: 4,
            }}
          >
            {"No document uploaded"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: dimColor,
            }}
          >
            {
              "Download the pre-filled template, complete the integration details, then upload for IGA Admin review."
            }
          </div>
        </div>
      )}
      {specDoc && specDoc.history.length > 0 && (
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: mutedColor,
              marginBottom: 10,
            }}
          >
            {"Approval History"}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {specDoc.history.map((evt, i) => {
              const actionColor =
                evt.action === "approved"
                  ? "#4ade80"
                  : evt.action === "revisions_requested"
                    ? "#f87171"
                    : "#60a5fa";
              const actionLabel =
                evt.action === "approved"
                  ? "Approved"
                  : evt.action === "revisions_requested"
                    ? "Revisions Requested"
                    : "Document Uploaded";
              return (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    paddingBottom: 8,
                    borderBottom:
                      i < specDoc.history.length - 1
                        ? `1px solid ${border}`
                        : "none",
                  }}
                  key={`${evt.at}-${i}`}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: actionColor,
                      marginTop: 4,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: actionColor,
                        }}
                      >
                        {actionLabel}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: dimColor,
                        }}
                      >
                        {"by "}
                        {evt.by}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: dimColor,
                          marginLeft: "auto",
                        }}
                      >
                        {new Date(evt.at).toLocaleString()}
                      </span>
                    </div>
                    {evt.comment && (
                      <div
                        style={{
                          fontSize: 11,
                          color: textColor,
                          marginTop: 3,
                          background: "rgba(248,113,113,0.06)",
                          padding: "4px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {'"'}
                        {evt.comment}
                        {'"'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{
          fontSize: 11,
          color: dimColor,
          background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1px solid ${border}`,
          borderRadius: 8,
          padding: "8px 12px",
        }}
      >
        {
          "💡 Template includes: App Name, Connection Type, Protocol, Credentials Format, Environment, Owner Details, Integration Pattern, Connector Type, Auth Method, Endpoint URL, Test Credentials, and Approval Status."
        }
      </div>
    </div>
  );
}
export { IntegrationSpecTab };
