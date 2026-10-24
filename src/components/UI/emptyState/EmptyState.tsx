import type { ReactNode } from "react";
import { Icon, type T_IconName } from "../icon/Icon";
import "./style.scss";

export function EmptyState({
  title,
  description,
  icon = "calendar",
  action,
}: {
  title: string;
  description: string;
  icon?: T_IconName;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon name={icon} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
