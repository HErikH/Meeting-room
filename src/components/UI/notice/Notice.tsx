import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Button } from "@UI/button/Button";
import { Icon } from "@UI/icon/Icon";
import "./style.scss";

type T_Props = HTMLAttributes<HTMLDivElement> & {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  action?: ReactNode;
  onDismiss?: () => void;
};

export const Notice = forwardRef<HTMLDivElement, T_Props>(function Notice(
  {
    children,
    variant = "info",
    title,
    action,
    onDismiss,
    className = "",
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`notice notice--${variant} ${className}`}
      role={variant === "error" ? "alert" : "status"}
      {...props}
    >
      <Icon
        name={
          variant === "success"
            ? "check"
            : variant === "error" || variant === "warning"
              ? "warning"
              : "info"
        }
      />
      <div className="notice__content">
        {title && <p className="notice__title">{title}</p>}
        <div>{children}</div>
        {action && <div className="notice__action">{action}</div>}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          iconOnly
          aria-label="Dismiss notification"
          icon={<Icon name="close" />}
          onClick={onDismiss}
        />
      )}
    </div>
  );
});
