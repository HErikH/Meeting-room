import { useState } from "react";
import type {
  T_Booking,
  T_BookingField,
  T_BookingFieldErrors,
} from "@app-types/booking";
import { ApiError } from "@/api/error";
import { getBookings, useBookings, saveBooking } from "@/store";
import { validateBooking } from "@utils/bookingRules";

export function useBookingForm(
  date: string,
  booking: T_Booking | null,
  now: Date,
) {
  const initialValues = {
    date,
    start: booking?.start ?? "",
    end: booking?.end ?? "",
    title: booking?.title ?? "",
  };
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<
    Partial<Record<T_BookingField, boolean>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<T_BookingFieldErrors>({});
  const bookings = useBookings();
  const validation = validateBooking(values, bookings, {
    now,
    excludeId: booking?.id,
  });
  const fieldErrors = !validation.valid ? (validation.fieldErrors ?? {}) : {};

  function change(field: T_BookingField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setError(null);
    setServerErrors({});
  }

  function reset() {
    setValues(initialValues);
    setTouched({});
    setError(null);
    setServerErrors({});
  }

  async function submit(): Promise<boolean> {
    setTouched({ start: true, end: true, title: true });
    setServerErrors({});
    // Recheck the current clock even if the tab was suspended between renders.
    const result = validateBooking(values, getBookings(), {
      now: new Date(),
      excludeId: booking?.id,
    });

    if (!result.valid) {
      setError(result.message);
      return false;
    }

    setError(null);
    try {
      await saveBooking(values, booking?.id);
      reset();
      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save this booking. Please try again.",
      );
      if (error instanceof ApiError) setServerErrors(error.fieldErrors ?? {});
      return false;
    }
  }

  function fieldError(field: T_BookingField): string | undefined {
    return (
      serverErrors[field] ?? (touched[field] ? fieldErrors[field] : undefined)
    );
  }

  return {
    values,
    change,
    reset,
    submit,
    error,
    fieldError,
    touch: (field: T_BookingField) =>
      setTouched((current) => ({ ...current, [field]: true })),
    overlapError:
      !validation.valid && validation.code === "BOOKING_CONFLICT"
        ? validation.message
        : null,
  };
}
