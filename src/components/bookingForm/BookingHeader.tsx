import { Icon } from "@UI/icon/Icon";

export function BookingHeader({
  icon,
  heading,
  description,
}: {
  icon: "plus" | "edit";
  heading: string;
  description: string;
}) {
  return (
    <div className="booking-form__header">
      <span className="booking-form__icon">
        <Icon name={icon} />
      </span>
      <div>
        <h2 className="booking-form__heading" id="form-heading">
          {heading}
        </h2>
        <p className="booking-form__description">{description}</p>
      </div>
    </div>
  );
}
