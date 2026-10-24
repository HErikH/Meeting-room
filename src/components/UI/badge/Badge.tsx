import type { ReactNode } from "react";
import "./style.scss";

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "primary" | "success" | "warning";
}) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
