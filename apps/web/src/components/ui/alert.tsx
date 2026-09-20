import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Alert({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" | "success" }) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        variant === "destructive" && "border-destructive/30 bg-destructive/10 text-destructive",
        variant === "success" && "border-emerald-300 bg-emerald-50 text-emerald-800",
        variant === "default" && "bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
