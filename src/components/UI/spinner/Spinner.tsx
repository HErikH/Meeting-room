import { Icon } from "../icon/Icon";
import "./style.scss";

export function Spinner({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`spinner ${className}`}
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
    >
      <Icon name="loader" className="spinner__circle" />
      {label && <span>{label}</span>}
    </span>
  );
}
