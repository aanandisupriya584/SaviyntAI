import { AdditionalNotesSection } from "./AdditionalNotesSection.jsx";
import { FormLabel } from "../common/FormLabel.jsx";
import { getConnectorCapability } from "../../data/connectors.js";
import * as React from "react";
function SchemaTab({
  app,
  localAssessment,
  isDark,
  border,
  cardBg,
  textColor,
  mutedColor,
  dimColor,
  INPUT,
  editableAttrs,
  setEditableAttrs,
  schemaAdditionalNotes,
  setSchemaAdditionalNotes,
}) {
  const capability =
    (localAssessment == null ? void 0 : localAssessment.integrationPattern) ===
    "OOTB"
      ? getConnectorCapability(app.name)
      : null;
  if (!localAssessment) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
          gap: 12,
        }}
      >
        <svg
          width={36}
          height={36}
          viewBox={"0 0 24 24"}
          fill={"none"}
          stroke={dimColor}
          strokeWidth={1.8}
          strokeLinecap={"round"}
          aria-hidden={true}
        >
          <circle cx={10.5} cy={10.5} r={6.5} />
          <path d={"m16 16 4 4"} />
        </svg>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: textColor,
          }}
        >
          {"Run AI Assessment First"}
        </div>
        <div
          style={{
            fontSize: 12,
            color: dimColor,
            maxWidth: 340,
          }}
        >
          {
            "Schema attributes will be automatically populated based on the connector identified by the AI Assessment. Go to the AI Assessment tab to run the analysis."
          }
        </div>
      </div>
    );
  }
  if (!capability) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.2)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            color: "#60a5fa",
          }}
        >
          {
            "ⓘ Custom connector — no predefined schema. Define attributes manually below."
          }
        </div>
        {["Schema Attributes", "Roles", "Entitlements"].map((label) => (
          <div key={label}>
            <FormLabel label={label} muted={dimColor} />
            <textarea
              style={{
                ...INPUT,
                height: 80,
                resize: "vertical",
              }}
              placeholder={
                label === "Schema Attributes"
                  ? "firstName, lastName, email, department..."
                  : label === "Roles"
                    ? "Admin, User, ReadOnly..."
                    : "List entitlements..."
              }
            />
          </div>
        ))}
        <AdditionalNotesSection
          value={schemaAdditionalNotes}
          onChange={setSchemaAdditionalNotes}
          INPUT={INPUT}
          isDark={isDark}
          border={border}
          textColor={textColor}
          mutedColor={mutedColor}
          dimColor={dimColor}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 16,
          }}
        >
          {"✓"}
        </span>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#4ade80",
            }}
          >
            {capability.connectorName}
          </div>
          <div
            style={{
              fontSize: 11,
              color: dimColor,
            }}
          >
            {
              "Attributes pre-populated from Saviynt Exchange connector definition"
            }
          </div>
        </div>
      </div>
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 0.8fr 2fr 60px 2fr",
            background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
            borderBottom: `1px solid ${border}`,
            padding: "8px 14px",
          }}
        >
          {["Attribute Name", "Type", "Description", "Req'd", "Comments"].map(
            (h) => (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: dimColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
                key={h}
              >
                {h}
              </div>
            ),
          )}
        </div>
        <div
          style={{
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {editableAttrs.map((attr, i) => (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.8fr 0.8fr 2fr 60px 2fr",
                padding: "7px 14px",
                borderBottom:
                  i < editableAttrs.length - 1 ? `1px solid ${border}` : "none",
                background: attr.isCustom
                  ? isDark
                    ? "rgba(168,85,247,0.07)"
                    : "rgba(168,85,247,0.04)"
                  : i % 2 === 0
                    ? "transparent"
                    : isDark
                      ? "rgba(255,255,255,0.015)"
                      : "rgba(0,0,0,0.015)",
                alignItems: "center",
                borderLeft: attr.isCustom
                  ? "3px solid rgba(168,85,247,0.5)"
                  : "3px solid transparent",
              }}
              key={`${attr.name}-${i}`}
            >
              <div
                style={{
                  paddingRight: 6,
                }}
              >
                <input
                  type={"text"}
                  value={attr.name}
                  onChange={(e) => {
                    const next = [...editableAttrs];
                    next[i] = {
                      ...next[i],
                      name: e.target.value,
                    };
                    setEditableAttrs(next);
                  }}
                  style={{
                    ...INPUT,
                    padding: "4px 8px",
                    fontSize: 12,
                    fontFamily: "IBM Plex Mono, monospace",
                    fontWeight: 600,
                  }}
                />
                {attr.isCustom && (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 3,
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: 3,
                      background: "rgba(168,85,247,0.15)",
                      color: "#a855f7",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {"Custom"}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#818cf8",
                  paddingLeft: 6,
                  fontFamily: "IBM Plex Mono, monospace",
                }}
              >
                {attr.type}
              </div>
              <input
                type={"text"}
                value={attr.description}
                onChange={(e) => {
                  const next = [...editableAttrs];
                  next[i] = {
                    ...next[i],
                    description: e.target.value,
                  };
                  setEditableAttrs(next);
                }}
                style={{
                  ...INPUT,
                  padding: "4px 8px",
                  fontSize: 12,
                  marginLeft: 4,
                }}
              />
              <div
                style={{
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontWeight: 700,
                    background: attr.required
                      ? "rgba(248,113,113,0.12)"
                      : isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)",
                    color: attr.required ? "#f87171" : dimColor,
                  }}
                >
                  {attr.required ? "Yes" : "No"}
                </span>
              </div>
              <input
                type={"text"}
                value={attr.comment ?? ""}
                onChange={(e) => {
                  const next = [...editableAttrs];
                  next[i] = {
                    ...next[i],
                    comment: e.target.value,
                  };
                  setEditableAttrs(next);
                }}
                placeholder={"Owner notes, rules..."}
                style={{
                  ...INPUT,
                  padding: "4px 8px",
                  fontSize: 11,
                  marginLeft: 4,
                  fontStyle: (attr.comment ?? "") ? "normal" : "italic",
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <button
        type={"button"}
        data-ocid={"details.schema_add_custom_attribute_button"}
        onClick={() =>
          setEditableAttrs((prev) => [
            ...prev,
            {
              name: "",
              type: "String",
              description: "",
              required: false,
              isCustom: true,
            },
          ])
        }
        style={{
          alignSelf: "flex-start",
          background: isDark ? "rgba(168,85,247,0.1)" : "rgba(168,85,247,0.06)",
          border: "1px dashed rgba(168,85,247,0.4)",
          borderRadius: 6,
          padding: "6px 14px",
          color: "#a855f7",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        {"+ Add Custom Attribute"}
      </button>
      {["Roles", "Entitlements"].map((label) => (
        <div key={label}>
          <FormLabel label={label} muted={dimColor} />
          <textarea
            style={{
              ...INPUT,
              height: 60,
              resize: "vertical",
            }}
            placeholder={
              label === "Roles"
                ? "Admin, User, ReadOnly..."
                : "List entitlements..."
            }
          />
        </div>
      ))}
      <AdditionalNotesSection
        value={schemaAdditionalNotes}
        onChange={setSchemaAdditionalNotes}
        INPUT={INPUT}
        isDark={isDark}
        border={border}
        textColor={textColor}
        mutedColor={mutedColor}
        dimColor={dimColor}
      />
    </div>
  );
}
export { SchemaTab };
