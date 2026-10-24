import { useEffect, useRef } from "react";
import type { T_Booking } from "@app-types/booking";
import { useBookingForm } from "@hooks/useBookingForm";
import { useNow } from "@hooks/useNow";
import { useIsMutating, useIsSaving, useBookingsStatus } from "@/store";
import {
  formatLocalDate,
  localTimeInMinutes,
  minutesToTime,
  timeToMinutes,
} from "@utils/dateTime";
import {
  MAX_BOOKING_DURATION,
  MIN_BOOKING_DURATION,
  WORKING_DAY_END,
  WORKING_DAY_START,
} from "@constants/booking";
import "./style.scss";

type T_Props = {
  date: string;
  booking: T_Booking | null;
  onDirty: () => void;
  onCancel: () => void;
  onSaved: () => void;
};

export function BookingForm({
  date,
  booking,
  onDirty,
  onCancel,
  onSaved,
}: T_Props) {
  const now = useNow();
  const startInput = useRef<HTMLInputElement>(null);
  const editingId = booking?.id;
  const form = useBookingForm(date, booking, now);
  const isMutating = useIsMutating();
  const isSaving = useIsSaving();
  const status = useBookingsStatus();
  const today = formatLocalDate(now);
  const firstStart =
    date === today
      ? Math.max(WORKING_DAY_START, Math.ceil(localTimeInMinutes(now)))
      : WORKING_DAY_START;
  const closed =
    date < today || firstStart > WORKING_DAY_END - MIN_BOOKING_DURATION;
  const start = timeToMinutes(form.values.start);
  const endMin = Math.max(
    WORKING_DAY_START + MIN_BOOKING_DURATION,
    (start ?? WORKING_DAY_START) + MIN_BOOKING_DURATION,
  );
  const endMax = Math.min(
    WORKING_DAY_END,
    (start ?? WORKING_DAY_END) + MAX_BOOKING_DURATION,
  );
  const startError = form.fieldError("start");
  const endError = form.fieldError("end");

  useEffect(() => {
    if (editingId) startInput.current?.focus();
  }, [editingId]);

  return (
    <section className="panel booking-form" aria-labelledby="form-heading">
      <h2 className="booking-form__heading" id="form-heading">
        {booking ? "Edit booking" : "New booking"}
      </h2>
      <p className="booking-form__description">
        {date} · 30 minutes to 2 hours
      </p>
      {closed && (
        <p className="booking-form__closed-message" role="status">
          {date < today
            ? "Past dates are available to view only."
            : "No bookable time remains today."}{" "}
          Choose a future date to book.
        </p>
      )}
      <form
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          if (closed || isMutating || status !== "success") return;
          if (await form.submit()) onSaved();
        }}
      >
        <fieldset
          className="booking-form__fieldset"
          disabled={closed || isMutating}
        >
          <legend className="booking-form__legend">Booking details</legend>
          <div className="booking-form__time-fields">
            <div className="booking-form__field form-field">
              <label className="form-field__label" htmlFor="booking-start">
                Start time
              </label>
              <input
                ref={startInput}
                className={startError ? "input input--invalid" : "input"}
                id="booking-start"
                name="start"
                type="time"
                required
                step="60"
                min={minutesToTime(firstStart)}
                max={minutesToTime(WORKING_DAY_END - MIN_BOOKING_DURATION)}
                value={form.values.start}
                aria-invalid={Boolean(startError)}
                aria-describedby={startError ? "start-error" : undefined}
                onBlur={() => form.touch("start")}
                onChange={(event) => {
                  form.change("start", event.target.value);
                  onDirty();
                }}
              />
              {startError && (
                <p id="start-error" className="form-field__error">
                  {startError}
                </p>
              )}
            </div>
            <div className="booking-form__field form-field">
              <label className="form-field__label" htmlFor="booking-end">
                End time
              </label>
              <input
                className={endError ? "input input--invalid" : "input"}
                id="booking-end"
                name="end"
                type="time"
                required
                step="60"
                min={minutesToTime(endMin)}
                max={minutesToTime(endMax)}
                value={form.values.end}
                aria-invalid={Boolean(endError)}
                aria-describedby={endError ? "end-error" : undefined}
                onBlur={() => form.touch("end")}
                onChange={(event) => {
                  form.change("end", event.target.value);
                  onDirty();
                }}
              />
              {endError && (
                <p id="end-error" className="form-field__error">
                  {endError}
                </p>
              )}
            </div>
          </div>
          <div className="booking-form__field form-field">
            <label className="form-field__label" htmlFor="booking-title">
              Title <span className="form-field__hint">(optional)</span>
            </label>
            <input
              className="input"
              id="booking-title"
              name="title"
              type="text"
              value={form.values.title}
              onChange={(event) => {
                form.change("title", event.target.value);
                onDirty();
              }}
            />
          </div>
          {(form.error || form.overlapError) && (
            <p className="notice notice--error" role="alert">
              {form.error ?? form.overlapError}
            </p>
          )}
          <div className="booking-form__actions">
            <button
              className="button button--primary"
              type="submit"
              disabled={status !== "success"}
            >
              {isSaving
                ? "Saving…"
                : booking
                  ? "Save changes"
                  : "Create booking"}
            </button>
            <button
              className="button"
              type="button"
              onClick={() => {
                form.reset();
                onCancel();
              }}
            >
              {booking ? "Cancel edit" : "Clear"}
            </button>
          </div>
        </fieldset>
        {!closed && status !== "success" && (
          <p className="booking-form__status" role="status">
            {status === "error"
              ? "Reload bookings before saving."
              : "Loading availability…"}
          </p>
        )}
      </form>
    </section>
  );
}
