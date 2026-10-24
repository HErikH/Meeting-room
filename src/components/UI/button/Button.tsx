import type { ComponentProps, ReactNode } from "react";
import { Spinner } from "@UI/spinner/Spinner";
import "./style.scss";

type T_Props = ComponentProps<"button"> & {
  variant?: "default" | "primary" | "danger" | "ghost";
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
};

export function Button({
  children,
  className = "",
  variant = "default",
  loading = false,
  loadingLabel,
  disabled,
  icon,
  iconOnly,
  type = "button",
  ...props
}: T_Props) {
  return (
    <button
      {...props}
      type={type}
      className={`button button--${variant}${iconOnly ? " button--icon" : ""} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner /> : icon}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
