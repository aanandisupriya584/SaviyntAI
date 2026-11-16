import { Root as Root$1 } from "@radix-ui/react-label";
import { cn } from "../../lib/utils.js";
import * as React from "react";
function Label({ className, ...props }) {
  return (
    <Root$1
      data-slot={"label"}
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
export { Label };
