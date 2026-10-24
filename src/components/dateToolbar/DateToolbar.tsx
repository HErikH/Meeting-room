import { useNow } from "@hooks/useNow";
import { formatLocalDate } from "@utils/dateTime";
import { useIsMutating } from "@/store";
import "./style.scss";

type Props = {
  date: string;
  onChange: (date: string) => void;
};

export function DateToolbar({ date, onChange }: Props) {
  const isMutating = useIsMutating();

  return (
    <div className="date-toolbar">
      <div className="date-toolbar__field form-field">
        <label className="form-field__label" htmlFor="selected-date">
          View date
        </label>
        <input
          className="input"
          id="selected-date"
          type="date"
          value={date}
          disabled={isMutating}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <TodayButton date={date} disabled={isMutating} onChange={onChange} />
    </div>
  );
}

function TodayButton({
  date,
  disabled,
  onChange,
}: Props & { disabled: boolean }) {
  const today = formatLocalDate(useNow());

  return (
    <button
      className="button"
      type="button"
      disabled={disabled || date === today}
      onClick={() => onChange(today)}
    >
      Today
    </button>
  );
}
