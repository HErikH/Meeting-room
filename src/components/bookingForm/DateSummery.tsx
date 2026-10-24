import { formatDisplayDate } from "@utils/dateTime";
import { Icon } from "@UI/icon/Icon";

export function DateSummary({ date }: { date: string }) {
  return (
    <div className="booking-form__date">
      <Icon name="calendar" />
      <div>
        <span>Booking for</span>
        <p>
          {formatDisplayDate(date, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
