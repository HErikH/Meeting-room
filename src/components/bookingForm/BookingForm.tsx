import { useEffect, useRef, useState } from "react";
import type { T_Booking } from "@app-types/booking";
import { useBookingForm } from "@hooks/useBookingForm";
import { useNow } from "@hooks/useNow";
import { useIsMutating, useIsSaving, useBookingsStatus } from "@/store";
import {
  formatLocalDate,
  formatDisplayDate,
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
import { Button } from "@components/UI/button/Button";
import { Icon } from "@components/UI/icon/Icon";
import { Notice } from "@components/UI/notice/Notice";
import { Badge } from "@components/UI/badge/Badge";
import { Spinner } from "@components/UI/spinner/Spinner";
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
  const formElement = useRef<HTMLFormElement>(null);
  const startInput = useRef<HTMLInputElement>(null);
  const [failedSubmissions, setFailedSubmissions] = useState(0);
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
  const end = timeToMinutes(form.values.end);
  const duration = start !== null && end !== null ? end - start : null;
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

  useEffect(() => {
    if (failedSubmissions === 0) return;
    formElement.current
      ?.querySelector<HTMLElement>(
        '[aria-invalid="true"]:not(:disabled), [role="alert"]',
      )
      ?.focus();
  }, [failedSubmissions]);

  return (
    <section className="panel booking-form" aria-labelledby="form-heading">
      <div className="booking-form__header">
        <span className="booking-form__icon">
          <Icon name={booking ? "edit" : "plus"} />
        </span>
        <div>
          <h2 className="booking-form__heading" id="form-heading">
            {booking ? "Edit booking" : "New booking"}
          </h2>
          <p className="booking-form__description">
            {booking
              ? "A small change to your plans."
              : "Make time for your next meeting."}
          </p>
        </div>
      </div>
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
      {closed && (
        <Notice variant="warning" className="booking-form__closed-message">
          {date < today
            ? "Past dates are available to view only."
            : "No bookable time remains today."}{" "}
          Choose a future date to book.
        </Notice>
      )}
      <form
        ref={formElement}
        aria-busy={isSaving}
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          if (closed || isMutating || status !== "success") return;
          if (await form.submit()) {
            onSaved();
          } else {
            setFailedSubmissions((count) => count + 1);
          }
        }}
      >
        <fieldset
          className="booking-form__fieldset"
          disabled={closed || isMutating}
        >
          <legend className="sr-only">Booking details</legend>
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
              placeholder="e.g. Team catch-up"
              value={form.values.title}
              onChange={(event) => {
                form.change("title", event.target.value);
                onDirty();
              }}
            />
          </div>
          {duration !== null &&
            duration >= MIN_BOOKING_DURATION &&
            duration <= MAX_BOOKING_DURATION && (
              <div className="booking-form__duration">
                <Icon name="clock" />
                <span>Meeting duration</span>
                <Badge variant="primary">{duration} min</Badge>
              </div>
            )}
        </fieldset>
        {(form.error || form.overlapError) && (
          <Notice variant="error" className="booking-form__error" tabIndex={-1}>
            {form.error ?? form.overlapError}
          </Notice>
        )}
        <div className="booking-form__actions">
          <Button
            variant="primary"
            type="submit"
            icon={<Icon name={booking ? "check" : "plus"} />}
            loading={isSaving}
            loadingLabel="Saving…"
            disabled={closed || isMutating || status !== "success"}
          >
            {booking ? "Save changes" : "Create booking"}
          </Button>
          <Button
            type="button"
            disabled={isMutating}
            onClick={() => {
              form.reset();
              onCancel();
            }}
          >
            {booking ? "Cancel edit" : "Clear"}
          </Button>
        </div>
        {!closed && status !== "success" && (
          <div className="booking-form__status">
            {status === "error" ? (
              <Notice variant="warning">Reload bookings before saving.</Notice>
            ) : (
              <Spinner label="Loading availability…" />
            )}
          </div>
        )}
      </form>
      <div className="booking-form__guidance">
        <Icon name="info" />
        <p>
          Keep it between <strong>30 minutes and 2 hours</strong>, within
          working hours. Overlapping bookings aren’t allowed.
        </p>
      </div>
    </section>
  );
}
