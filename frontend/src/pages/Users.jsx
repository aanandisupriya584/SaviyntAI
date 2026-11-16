import {
  Briefcase,
  Check,
  Eye,
  Key,
  Pencil,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { adminResetPassword } from "../services/api.js";
import * as React from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
const ROLE_LABELS = {
  admin: "Admin",
  executive: "Executive",
  application_owner: "Application Owner",
};
const ROLE_COLORS = {
  admin: "bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/30",
  executive: "bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/30",
  application_owner:
    "bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30",
};
const ROLE_ICONS = {
  admin: <ShieldCheck className={"w-3 h-3"} />,
  executive: <Eye className={"w-3 h-3"} />,
  application_owner: <Briefcase className={"w-3 h-3"} />,
};
const EMPTY_FORM = {
  name: "",
  username: "",
  email: "",
  role: "application_owner",
  useIDP: false,
  password: "",
  assignedAppIds: [],
};
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function UserManagement({ apps }) {
  var _a2;
  const { currentUser, users, createUser, updateUser, deleteUser } = useAuth();
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [errors, setErrors] = React.useState({});
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [resetTarget, setResetTarget] = React.useState(null);
  const [resetNewPw, setResetNewPw] = React.useState("");
  const [resetConfirmPw, setResetConfirmPw] = React.useState("");
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetError, setResetError] = React.useState(null);
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const adminCount = users.filter((u) => u.role === "admin").length;
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setPanelOpen(true);
  }
  function openEdit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      useIDP: user.useIDP,
      password: "",
      // always blank on edit — leave blank to keep existing password
      assignedAppIds: user.assignedAppIds,
    });
    setErrors({});
    setPanelOpen(true);
  }
  function closePanel() {
    setPanelOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  }
  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.username.trim()) next.username = "Username is required.";
    else {
      const conflict = users.find(
        (u) =>
          u.username.toLowerCase() === form.username.toLowerCase() &&
          u.id !== editingId,
      );
      if (conflict) next.username = "Username is already taken.";
    }
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      next.email = "Enter a valid email address.";
    else {
      const conflict = users.find(
        (u) =>
          u.email.toLowerCase() === form.email.toLowerCase() &&
          u.id !== editingId,
      );
      if (conflict) next.email = "Email is already in use.";
    }
    if (!form.useIDP && !editingId && !form.password.trim())
      next.password = "Password is required for local auth.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  function handleSave() {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      role: form.role,
      useIDP: form.useIDP,
      // Send plain password; server will bcrypt-hash it.
      // On edit, blank password = don't change existing hash.
      passwordHash: form.useIDP ? "" : form.password,
      assignedAppIds:
        form.role === "application_owner" ? form.assignedAppIds : [],
    };
    if (editingId) {
      updateUser(editingId, payload);
    } else {
      createUser(payload);
    }
    closePanel();
  }
  function handleDelete(id) {
    deleteUser(id);
    setDeleteConfirm(null);
  }
  function toggleApp(appId) {
    setForm((prev) => ({
      ...prev,
      assignedAppIds: prev.assignedAppIds.includes(appId)
        ? prev.assignedAppIds.filter((a) => a !== appId)
        : [...prev.assignedAppIds, appId],
    }));
  }
  return (
    <div data-ocid={"user_management.page"} className={"w-full space-y-6"}>
      <div className={"space-y-1"}>
        <h1 className={"text-2xl font-semibold text-foreground"}>
          {"User Management"}
        </h1>
        <p className={"text-muted-foreground text-sm"}>
          {"Manage user accounts, roles, and application ownership."}
        </p>
      </div>
      <div
        className={"rounded-xl border border-border bg-card overflow-hidden"}
      >
        <div
          className={
            "flex items-center justify-between px-5 py-4 border-b border-border"
          }
        >
          <h2 className={"font-medium text-foreground"}>
            {"Users ("}
            {users.length}
            {")"}
          </h2>
          <button
            type={"button"}
            data-ocid={"user_management.add_button"}
            onClick={openCreate}
            className={
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366f1] hover:bg-[#818cf8] text-white text-sm font-medium transition-colors duration-200"
            }
          >
            <UserPlus className={"w-4 h-4"} />
            {"Add User"}
          </button>
        </div>
        <div className={"overflow-x-auto"}>
          <table className={"w-full text-sm"}>
            <thead>
              <tr className={"border-b border-border text-left"}>
                {[
                  "Name",
                  "Username",
                  "Email",
                  "Role",
                  "Auth Method",
                  "Apps",
                  "Created",
                  "Actions",
                ].map((col) => (
                  <th
                    className={
                      "px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    }
                    key={col}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => {
                const isCurrentUser =
                  user.id === (currentUser == null ? void 0 : currentUser.id);
                const isLastAdmin = user.role === "admin" && adminCount === 1;
                return (
                  <tr
                    data-ocid={`user_management.item.${idx + 1}`}
                    data-user-role={user.role}
                    className={`border-b border-border last:border-0 transition-colors hover:bg-white/5 ${isCurrentUser ? "ring-1 ring-inset ring-[#6366f1]/30" : ""}`}
                    key={user.id}
                  >
                    <td
                      className={
                        "px-4 py-3 font-medium text-foreground whitespace-nowrap"
                      }
                    >
                      <span>{user.name}</span>
                      {isCurrentUser && (
                        <span
                          className={"ml-2 text-xs text-[#818cf8] font-normal"}
                        >
                          {"(You)"}
                        </span>
                      )}
                    </td>
                    <td
                      className={
                        "px-4 py-3 text-muted-foreground font-mono text-xs"
                      }
                    >
                      {user.username}
                    </td>
                    <td
                      className={
                        "px-4 py-3 text-muted-foreground max-w-[200px] truncate"
                      }
                    >
                      {user.email}
                    </td>
                    <td className={"px-4 py-3"}>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${ROLE_COLORS[user.role]}`}
                      >
                        {ROLE_ICONS[user.role]}
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className={"px-4 py-3"}>
                      {user.useIDP ? (
                        <span
                          className={
                            "px-2 py-0.5 rounded-md text-xs font-medium bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/30"
                          }
                        >
                          {"IDP"}
                        </span>
                      ) : (
                        <span
                          className={
                            "px-2 py-0.5 rounded-md text-xs font-medium bg-white/10 text-muted-foreground border border-border"
                          }
                        >
                          {"Password"}
                        </span>
                      )}
                    </td>
                    <td className={"px-4 py-3"}>
                      {user.role === "application_owner" ? (
                        <span
                          className={
                            "inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#4ade80]/20 text-[#4ade80] text-xs font-bold border border-[#4ade80]/30"
                          }
                        >
                          {user.assignedAppIds.length}
                        </span>
                      ) : (
                        <span className={"text-muted-foreground text-xs"}>
                          {"—"}
                        </span>
                      )}
                    </td>
                    <td
                      className={
                        "px-4 py-3 text-muted-foreground whitespace-nowrap"
                      }
                    >
                      {formatDate(user.createdAt)}
                    </td>
                    <td className={"px-4 py-3"}>
                      <div className={"flex items-center gap-1"}>
                        {(currentUser == null ? void 0 : currentUser.role) ===
                          "admin" && (
                          <button
                            type={"button"}
                            data-ocid={`user_management.reset_password_button.${idx + 1}`}
                            onClick={() => {
                              setResetTarget(user);
                              setResetNewPw("");
                              setResetConfirmPw("");
                              setResetError(null);
                              setResetSuccess(false);
                            }}
                            className={
                              "p-1.5 rounded-lg hover:bg-[#818cf8]/10 text-muted-foreground hover:text-[#818cf8] transition-colors"
                            }
                            aria-label={`Reset password for ${user.name}`}
                            title={"Reset Password"}
                          >
                            <Key className={"w-3.5 h-3.5"} />
                          </button>
                        )}
                        <button
                          type={"button"}
                          data-ocid={`user_management.edit_button.${idx + 1}`}
                          onClick={() => openEdit(user)}
                          className={
                            "p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                          }
                          aria-label={`Edit ${user.name}`}
                        >
                          <Pencil className={"w-3.5 h-3.5"} />
                        </button>
                        <button
                          type={"button"}
                          data-ocid={`user_management.delete_button.${idx + 1}`}
                          onClick={() => setDeleteConfirm(user.id)}
                          disabled={isLastAdmin || isCurrentUser}
                          className={
                            "p-1.5 rounded-lg hover:bg-[#f87171]/10 text-muted-foreground hover:text-[#f87171] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          }
                          aria-label={`Delete ${user.name}`}
                        >
                          <Trash2 className={"w-3.5 h-3.5"} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {deleteConfirm && (
        <div
          className={
            "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          }
          data-ocid={"user_management.dialog"}
        >
          <div
            className={
              "w-full max-w-sm mx-4 rounded-xl border border-border bg-card p-6 space-y-4 shadow-2xl"
            }
          >
            <h3 className={"font-semibold text-foreground"}>{"Delete User"}</h3>
            <p className={"text-sm text-muted-foreground"}>
              {"Are you sure you want to delete"}{" "}
              <strong className={"text-foreground"}>
                {(_a2 = users.find((u) => u.id === deleteConfirm)) == null
                  ? void 0
                  : _a2.name}
              </strong>
              {"? This action cannot be undone."}
            </p>
            <div className={"flex items-center justify-end gap-3"}>
              <button
                type={"button"}
                data-ocid={"user_management.cancel_button"}
                onClick={() => setDeleteConfirm(null)}
                className={
                  "px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                }
              >
                {"Cancel"}
              </button>
              <button
                type={"button"}
                data-ocid={"user_management.confirm_button"}
                onClick={() => handleDelete(deleteConfirm)}
                className={
                  "px-4 py-2 rounded-lg bg-[#f87171]/20 text-[#f87171] border border-[#f87171]/30 text-sm font-medium hover:bg-[#f87171]/30 transition-colors"
                }
              >
                {"Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {resetTarget && (
        <div
          className={
            "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          }
          data-ocid={"user_management.reset_password_dialog"}
        >
          <div
            className={
              "w-full max-w-sm mx-4 rounded-xl border border-border bg-card p-6 space-y-5 shadow-2xl"
            }
          >
            <div className={"flex items-center justify-between"}>
              <h3
                className={
                  "font-semibold text-foreground flex items-center gap-2"
                }
              >
                <Key className={"w-4 h-4 text-[#818cf8]"} />
                {"Reset Password"}
              </h3>
              <button
                type={"button"}
                data-ocid={"user_management.reset_password_close_button"}
                onClick={() => setResetTarget(null)}
                className={
                  "p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                }
                aria-label={"Close"}
              >
                <X className={"w-4 h-4"} />
              </button>
            </div>
            <p className={"text-sm text-muted-foreground"}>
              {"Setting new password for"}{" "}
              <strong className={"text-foreground"}>{resetTarget.name}</strong>
              {" ("}
              <span className={"font-mono text-xs"}>
                {resetTarget.username}
              </span>
              {")"}
            </p>
            {resetSuccess ? (
              <div
                className={"rounded-lg px-4 py-3 text-sm"}
                style={{
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  color: "#4ade80",
                }}
                data-ocid={"user_management.reset_password_success_state"}
              >
                {"✓ Password updated successfully."}
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setResetError(null);
                  if (!resetNewPw.trim()) {
                    setResetError("New password is required.");
                    return;
                  }
                  if (resetNewPw !== resetConfirmPw) {
                    setResetError("Passwords do not match.");
                    return;
                  }
                  if (resetNewPw.length < 6) {
                    setResetError("Password must be at least 6 characters.");
                    return;
                  }
                  setResetLoading(true);
                  const result = await adminResetPassword(
                    resetTarget.username,
                    resetNewPw,
                  );
                  setResetLoading(false);
                  if (result.success) {
                    setResetSuccess(true);
                  } else {
                    setResetError(
                      result.message ??
                        "Password reset failed. Please try again.",
                    );
                  }
                }}
                className={"space-y-4"}
              >
                <div className={"space-y-1.5"}>
                  <label
                    htmlFor={"rp-new"}
                    className={
                      "block text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    }
                  >
                    {"New Password "}
                    <span className={"text-[#f87171]"}>{"*"}</span>
                  </label>
                  <input
                    id={"rp-new"}
                    type={"password"}
                    data-ocid={"user_management.reset_new_password_input"}
                    value={resetNewPw}
                    onChange={(e) => setResetNewPw(e.target.value)}
                    placeholder={"Enter new password"}
                    className={
                      "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50"
                    }
                    autoComplete={"new-password"}
                  />
                </div>
                <div className={"space-y-1.5"}>
                  <label
                    htmlFor={"rp-confirm"}
                    className={
                      "block text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    }
                  >
                    {"Confirm Password "}
                    <span className={"text-[#f87171]"}>{"*"}</span>
                  </label>
                  <input
                    id={"rp-confirm"}
                    type={"password"}
                    data-ocid={"user_management.reset_confirm_password_input"}
                    value={resetConfirmPw}
                    onChange={(e) => setResetConfirmPw(e.target.value)}
                    placeholder={"Confirm new password"}
                    className={
                      "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50"
                    }
                    autoComplete={"new-password"}
                  />
                </div>
                {resetError && (
                  <p
                    data-ocid={"user_management.reset_password_error_state"}
                    className={"text-xs rounded-lg px-3 py-2"}
                    style={{
                      color: "#f87171",
                      background: "rgba(248,113,113,0.08)",
                      border: "1px solid rgba(248,113,113,0.2)",
                    }}
                  >
                    {resetError}
                  </p>
                )}
                <div className={"flex items-center justify-end gap-3 pt-1"}>
                  <button
                    type={"button"}
                    data-ocid={"user_management.reset_password_cancel_button"}
                    onClick={() => setResetTarget(null)}
                    className={
                      "px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                    }
                  >
                    {"Cancel"}
                  </button>
                  <button
                    type={"submit"}
                    data-ocid={"user_management.reset_password_submit_button"}
                    disabled={resetLoading}
                    className={
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#818cf8] text-white text-sm font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    }
                  >
                    {resetLoading ? "Saving…" : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {panelOpen && (
        <div
          data-ocid={"user_management.panel"}
          className={
            "rounded-xl border border-[#6366f1]/40 bg-card overflow-hidden"
          }
        >
          <div
            className={
              "flex items-center justify-between px-5 py-4 border-b border-border bg-[#6366f1]/5"
            }
          >
            <h2 className={"font-medium text-foreground"}>
              {editingId ? "Edit User" : "Create New User"}
            </h2>
            <button
              type={"button"}
              data-ocid={"user_management.close_button"}
              onClick={closePanel}
              className={
                "p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              }
              aria-label={"Close panel"}
            >
              <X className={"w-4 h-4"} />
            </button>
          </div>
          <div className={"p-5 space-y-5"}>
            <div className={"grid grid-cols-1 md:grid-cols-2 gap-5"}>
              <div className={"space-y-1.5"}>
                <label
                  htmlFor={"um-name"}
                  className={
                    "block text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  }
                >
                  {"Full Name "}
                  <span className={"text-[#f87171]"}>{"*"}</span>
                </label>
                <input
                  id={"um-name"}
                  type={"text"}
                  data-ocid={"user_management.name_input"}
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      name: e.target.value,
                    }))
                  }
                  placeholder={"e.g. Jane Doe"}
                  className={`w-full rounded-lg border ${errors.name ? "border-[#f87171]" : "border-border"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-colors`}
                />
                {errors.name && (
                  <p
                    data-ocid={"user_management.name_field_error"}
                    className={"text-xs text-[#f87171]"}
                  >
                    {errors.name}
                  </p>
                )}
              </div>
              <div className={"space-y-1.5"}>
                <label
                  htmlFor={"um-username"}
                  className={
                    "block text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  }
                >
                  {"Username "}
                  <span className={"text-[#f87171]"}>{"*"}</span>
                </label>
                <input
                  id={"um-username"}
                  type={"text"}
                  data-ocid={"user_management.username_input"}
                  value={form.username}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      username: e.target.value,
                    }))
                  }
                  placeholder={"e.g. jane.doe"}
                  className={`w-full rounded-lg border ${errors.username ? "border-[#f87171]" : "border-border"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-colors`}
                />
                {errors.username && (
                  <p
                    data-ocid={"user_management.username_field_error"}
                    className={"text-xs text-[#f87171]"}
                  >
                    {errors.username}
                  </p>
                )}
              </div>
              <div className={"space-y-1.5"}>
                <label
                  htmlFor={"um-email"}
                  className={
                    "block text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  }
                >
                  {"Email "}
                  <span className={"text-[#f87171]"}>{"*"}</span>
                </label>
                <input
                  id={"um-email"}
                  type={"email"}
                  data-ocid={"user_management.email_input"}
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      email: e.target.value,
                    }))
                  }
                  placeholder={"jane@company.com"}
                  className={`w-full rounded-lg border ${errors.email ? "border-[#f87171]" : "border-border"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-colors`}
                />
                {errors.email && (
                  <p
                    data-ocid={"user_management.email_field_error"}
                    className={"text-xs text-[#f87171]"}
                  >
                    {errors.email}
                  </p>
                )}
              </div>
              <div className={"space-y-1.5"}>
                <label
                  htmlFor={"um-role"}
                  className={
                    "block text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  }
                >
                  {"Role"}
                </label>
                <select
                  id={"um-role"}
                  data-ocid={"user_management.role_select"}
                  value={form.role}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      role: e.target.value,
                      assignedAppIds: [],
                    }))
                  }
                  className={
                    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-colors"
                  }
                >
                  <option value={"admin"}>{"Admin"}</option>
                  <option value={"executive"}>{"Executive"}</option>
                  <option value={"application_owner"}>
                    {"Application Owner"}
                  </option>
                </select>
              </div>
            </div>
            <div className={"space-y-2"}>
              <p
                className={
                  "block text-xs font-medium text-muted-foreground uppercase tracking-wide"
                }
              >
                {"Auth Method"}
              </p>
              <div className={"flex items-center gap-3"}>
                <button
                  type={"button"}
                  data-ocid={"user_management.auth_password_toggle"}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      useIDP: false,
                    }))
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${!form.useIDP ? "bg-[#6366f1]/20 border-[#6366f1]/50 text-[#818cf8]" : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                >
                  {"Local Password"}
                </button>
                <button
                  type={"button"}
                  data-ocid={"user_management.auth_idp_toggle"}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      useIDP: true,
                      password: "",
                    }))
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.useIDP ? "bg-[#60a5fa]/20 border-[#60a5fa]/50 text-[#60a5fa]" : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                >
                  {"Enterprise IDP"}
                </button>
              </div>
              {!form.useIDP ? (
                <div className={"space-y-1.5 pt-1"}>
                  <label
                    htmlFor={"um-password"}
                    className={
                      "block text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    }
                  >
                    {editingId ? "New Password" : "Password"}{" "}
                    {!editingId && (
                      <span className={"text-[#f87171]"}>{"*"}</span>
                    )}
                    {editingId && (
                      <span
                        className={
                          "ml-1 normal-case text-[10px] font-normal opacity-60"
                        }
                      >
                        {"(leave blank to keep existing)"}
                      </span>
                    )}
                  </label>
                  <input
                    id={"um-password"}
                    type={"password"}
                    data-ocid={"user_management.password_input"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        password: e.target.value,
                      }))
                    }
                    placeholder={"Set a password"}
                    className={`w-full max-w-sm rounded-lg border ${errors.password ? "border-[#f87171]" : "border-border"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-colors`}
                  />
                  {errors.password && (
                    <p
                      data-ocid={"user_management.password_field_error"}
                      className={"text-xs text-[#f87171]"}
                    >
                      {errors.password}
                    </p>
                  )}
                </div>
              ) : (
                <p
                  className={
                    "text-xs text-[#60a5fa] bg-[#60a5fa]/10 border border-[#60a5fa]/20 rounded-lg px-3 py-2"
                  }
                >
                  {
                    "User will log in via your configured IDP using their email address."
                  }
                </p>
              )}
            </div>
            {form.role === "application_owner" && (
              <div className={"space-y-2"}>
                <p
                  className={
                    "block text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  }
                >
                  {"Assigned Applications"}
                </p>
                <div
                  className={
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1"
                  }
                >
                  {apps.map((app) => {
                    const checked = form.assignedAppIds.includes(app.id);
                    return (
                      <button
                        type={"button"}
                        data-ocid={`user_management.app_toggle.${app.id}`}
                        onClick={() => toggleApp(app.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${checked ? "border-[#4ade80]/50 bg-[#4ade80]/10 text-[#4ade80]" : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground hover:bg-white/5"}`}
                        key={app.id}
                      >
                        <span
                          className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center border ${checked ? "bg-[#4ade80] border-[#4ade80]" : "border-border"}`}
                        >
                          {checked && (
                            <Check className={"w-2.5 h-2.5 text-black"} />
                          )}
                        </span>
                        <span className={"min-w-0"}>
                          <span className={"block font-medium truncate"}>
                            {app.name}
                          </span>
                          <span className={"block text-xs opacity-70 truncate"}>
                            {app.department}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className={"text-xs text-muted-foreground"}>
                  {form.assignedAppIds.length}
                  {" app"}
                  {form.assignedAppIds.length !== 1 ? "s" : ""}
                  {" selected"}
                </p>
              </div>
            )}
            <div
              className={
                "flex items-center justify-end gap-3 pt-2 border-t border-border"
              }
            >
              <button
                type={"button"}
                data-ocid={"user_management.cancel_button"}
                onClick={closePanel}
                className={
                  "px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                }
              >
                {"Cancel"}
              </button>
              <button
                type={"button"}
                data-ocid={"user_management.submit_button"}
                onClick={handleSave}
                className={
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#818cf8] text-white text-sm font-medium transition-colors duration-200"
                }
              >
                <Check className={"w-4 h-4"} />
                {editingId ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export {
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_ICONS,
  EMPTY_FORM,
  formatDate,
  UserManagement,
};
