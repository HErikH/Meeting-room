import { useNow } from "@hooks/useNow";
import {
  formatLocalDate,
  formatDisplayDate,
  isValidDate,
  parseLocalDate,
  shiftDate,
} from "@utils/dateTime";
import { useIsMutating } from "@/store";
import { Button } from "@UI/button/Button";
import { Icon } from "@UI/icon/Icon";
import "./style.scss";

type T_Props = { date: string; onChange: (date: string) => void };

export function DateToolbar({ date, onChange }: T_Props) {
  const isMutating = useIsMutating();
  const weekday = (parseLocalDate(date).getDay() + 6) % 7;
  const dates = Array.from({ length: 7 }, (_, index) =>
    shiftDate(date, index - weekday),
  );

  return (
    <section className="date-toolbar" aria-label="Choose a booking date">
      <div className="date-toolbar__header">
        <div className="date-toolbar__month">
          <span className="date-toolbar__calendar">
            <Icon name="calendar" />
          </span>
          <h2>{formatDisplayDate(date, { month: "long", year: "numeric" })}</h2>
        </div>
        <div className="date-toolbar__controls">
          <div className="date-toolbar__arrows">
            <Button
              iconOnly
              icon={<Icon name="chevronLeft" />}
              aria-label="Previous day"
              disabled={isMutating || !isValidDate(shiftDate(date, -1))}
              onClick={() => onChange(shiftDate(date, -1))}
            />
            <Button
              iconOnly
              icon={<Icon name="chevronRight" />}
              aria-label="Next day"
              disabled={isMutating || !isValidDate(shiftDate(date, 1))}
              onClick={() => onChange(shiftDate(date, 1))}
            />
          </div>
          <TodayButton date={date} disabled={isMutating} onChange={onChange} />
          <div className="date-toolbar__field">
            <label className="sr-only" htmlFor="selected-date">
              View date
            </label>
            <input
              className="input"
              id="selected-date"
              type="date"
              min="0001-01-01"
              max="9999-12-31"
              value={date}
              disabled={isMutating}
              onChange={(event) => onChange(event.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="date-toolbar__week" role="group" aria-label="Week dates">
        {dates.map((day) => (
          <button
            key={day}
            className={`date-toolbar__day${day === date ? " date-toolbar__day--selected" : ""}`}
            type="button"
            aria-pressed={day === date}
            aria-label={
              isValidDate(day)
                ? formatDisplayDate(day, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Outside supported dates"
            }
            disabled={isMutating || !isValidDate(day)}
            onClick={() => onChange(day)}
          >
            <span>
              {isValidDate(day)
                ? formatDisplayDate(day, { weekday: "short" })
                : "–"}
            </span>
            <span>
              {isValidDate(day) ? parseLocalDate(day).getDate() : "–"}
            </span>
            <span className="date-toolbar__day-marker" aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}

function TodayButton({
  date,
  disabled,
  onChange,
}: T_Props & { disabled: boolean }) {
  const today = formatLocalDate(useNow());
  return (
    <Button
      disabled={disabled || date === today}
      onClick={() => onChange(today)}
    >
      Today
    </Button>
  );
}
