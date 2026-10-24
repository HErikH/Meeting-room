import type { Ref } from "react";
import { minutesToTime } from "@utils/dateTime";

type T_Props = {
  name: "start" | "end";
  label: string;
  value: string;
  error?: string | null;
  min: number;
  max: number;
  inputRef?: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function TimeField({
  name,
  label,
  value,
  error,
  min,
  max,
  inputRef,
  onChange,
  onBlur,
}: T_Props) {
  const id = `booking-${name}`;
  const errorId = `${name}-error`;

  return (
    <div className="booking-form__field form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        ref={inputRef}
        className={error ? "input input--invalid" : "input"}
        id={id}
        name={name}
        type="time"
        required
        step="60"
        min={minutesToTime(min)}
        max={minutesToTime(max)}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={errorId} className="form-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
