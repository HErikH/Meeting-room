import { useEffect, useRef, useState, type FormEvent } from "react";
import type { T_Booking } from "@app-types/booking";
import { useBookingForm } from "@hooks/useBookingForm";
import { useFocusFirstInvalid } from "@hooks/useFocusFirstInvalid";
import { useNow } from "@hooks/useNow";
import { useIsMutating, useIsSaving, useBookingsStatus } from "@/store";
import { timeToMinutes } from "@utils/dateTime";
import { Button } from "@UI/button/Button";
import { Icon } from "@UI/icon/Icon";
import { Notice } from "@UI/notice/Notice";
import { Badge } from "@UI/badge/Badge";
import { getBookingWindow, getValidDuration } from "@utils/bookingWindow";
import { TimeField } from "./TimeField";
import "./style.scss";
import { BookingHeader } from "./BookingHeader";
import { DateSummary } from "./DateSummery";
import { AvailabilityStatus } from "./AvailabilityStatus";

const COPY = {
  create: {
    icon: "plus",
    heading: "New booking",
    description: "Make time for your next meeting.",
    submit: "Create booking",
    cancel: "Clear",
  },
  edit: {
    icon: "edit",
    heading: "Edit booking",
    description: "A small change to your plans.",
    submit: "Save changes",
    cancel: "Cancel edit",
  },
} as const;

const CLOSED_MESSAGE = {
  past: "Past dates are available to view only.",
  full: "No bookable time remains today.",
} as const;

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
  const form = useBookingForm(date, booking, now);
  const isMutating = useIsMutating();
  const isSaving = useIsSaving();
  const status = useBookingsStatus();

  const formElement = useRef<HTMLFormElement>(null);
  const startInput = useRef<HTMLInputElement>(null);
  const [failedSubmissions, setFailedSubmissions] = useState(0);

  const copy = booking ? COPY.edit : COPY.create;
  const start = timeToMinutes(form.values.start);
  const end = timeToMinutes(form.values.end);
  const slots = getBookingWindow(date, now, start);
  const duration = getValidDuration(start, end);

  const closed = slots.closedReason !== null;
  const locked = closed || isMutating;
  const canSubmit = !locked && status === "success";
  const formError = form.error ?? form.overlapError;

  useEffect(() => {
    if (booking?.id) startInput.current?.focus();
  }, [booking?.id]);

  useFocusFirstInvalid(formElement, failedSubmissions);

  const change = (field: "start" | "end" | "title", value: string) => {
    form.change(field, value);
    onDirty();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    if (await form.submit()) onSaved();
    else setFailedSubmissions((count) => count + 1);
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <section className="panel booking-form" aria-labelledby="form-heading">
      <BookingHeader
        icon={copy.icon}
        heading={copy.heading}
        description={copy.description}
      />

      <DateSummary date={date} />

      {slots.closedReason && (
        <Notice variant="warning" className="booking-form__closed-message">
          {CLOSED_MESSAGE[slots.closedReason]} Choose a future date to book.
        </Notice>
      )}

      <form
        ref={formElement}
        aria-busy={isSaving}
        noValidate
        onSubmit={handleSubmit}
      >
        <fieldset className="booking-form__fieldset" disabled={locked}>
          <legend className="sr-only">Booking details</legend>

          <div className="booking-form__time-fields">
            <TimeField
              name="start"
              label="Start time"
              inputRef={startInput}
              value={form.values.start}
              error={form.fieldError("start")}
              min={slots.startMin}
              max={slots.startMax}
              onBlur={() => form.touch("start")}
              onChange={(value) => change("start", value)}
            />
            <TimeField
              name="end"
              label="End time"
              value={form.values.end}
              error={form.fieldError("end")}
              min={slots.endMin}
              max={slots.endMax}
              onBlur={() => form.touch("end")}
              onChange={(value) => change("end", value)}
            />
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
              onChange={(event) => change("title", event.target.value)}
            />
          </div>

          {duration !== null && (
            <div className="booking-form__duration">
              <Icon name="clock" />
              <span>Meeting duration</span>
              <Badge variant="primary">{duration} min</Badge>
            </div>
          )}
        </fieldset>

        {formError && (
          <Notice variant="error" className="booking-form__error" tabIndex={-1}>
            {formError}
          </Notice>
        )}

        <div className="booking-form__actions">
          <Button
            variant="primary"
            type="submit"
            icon={<Icon name={booking ? "check" : "plus"} />}
            loading={isSaving}
            loadingLabel="Saving…"
            disabled={!canSubmit}
          >
            {copy.submit}
          </Button>
          <Button type="button" disabled={isMutating} onClick={handleCancel}>
            {copy.cancel}
          </Button>
        </div>

        {!closed && status !== "success" && (
          <AvailabilityStatus status={status} />
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
