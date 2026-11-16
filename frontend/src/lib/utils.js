import { clsx } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export { cn };
