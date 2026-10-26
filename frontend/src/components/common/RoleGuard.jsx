import { Button } from "../ui/Button.jsx";
import * as React from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
function RoleGuard({ allowedRoles, children, fallback }) {
  const { currentUser } = useAuth();
  const hasAccess =
    currentUser !== null && allowedRoles.includes(currentUser.role);
  if (hasAccess) return <React.Fragment>{children}</React.Fragment>;
  if (fallback) return <React.Fragment>{fallback}</React.Fragment>;
  return (
    <div
      data-ocid={"role_guard.panel"}
      className={"flex flex-1 items-center justify-center min-h-[320px] px-4"}
    >
      <div
        className={
          "max-w-sm w-full rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center space-y-4"
        }
      >
        <div className={"flex justify-center"}>
          <svg
            viewBox={"0 0 24 24"}
            fill={"none"}
            stroke={"currentColor"}
            strokeWidth={"1.5"}
            strokeLinecap={"round"}
            strokeLinejoin={"round"}
            className={"w-12 h-12 text-red-400"}
            aria-hidden={"true"}
          >
            <path d={"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"} />
            <line x1={"12"} y1={"8"} x2={"12"} y2={"12"} />
            <line x1={"12"} y1={"16"} x2={"12.01"} y2={"16"} />
          </svg>
        </div>
        <div className={"space-y-1.5"}>
          <h2 className={"text-lg font-semibold text-foreground"}>
            {"Access Restricted"}
          </h2>
          <p className={"text-sm text-muted-foreground leading-relaxed"}>
            {
              "You don't have permission to view this page. Contact your administrator if you believe this is an error."
            }
          </p>
        </div>
        <Button
          type={"button"}
          data-ocid={"role_guard.go_back_button"}
          variant={"outline"}
          className={
            "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          }
          onClick={() => window.history.back()}
        >
          {"Go Back"}
        </Button>
      </div>
    </div>
  );
}
export { RoleGuard };
