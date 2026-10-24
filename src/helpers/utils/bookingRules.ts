import {
  MAX_BOOKING_DURATION,
  MIN_BOOKING_DURATION,
  WORKING_DAY_END,
  WORKING_DAY_START,
} from '@constants/booking';
import type {
  T_Booking,
  T_BookingFieldErrors,
  T_BookingValidationResult,
  T_CreateBookingInput,
} from '@app-types/booking';
import { formatLocalDate, isValidDate, localTimeInMinutes, timeToMinutes } from './dateTime';

export type T_BookingValidationOptions = {
  now?: Date;
  excludeId?: string;
};

export function intervalsOverlap(
  start: number,
  end: number,
  existingStart: number,
  existingEnd: number,
): boolean {
  return start < existingEnd && end > existingStart;
}

export function validateBooking(
  input: T_CreateBookingInput,
  bookings: readonly T_Booking[],
  { now = new Date(), excludeId }: T_BookingValidationOptions = {},
): T_BookingValidationResult {
  const fieldErrors: T_BookingFieldErrors = {};
  const today = formatLocalDate(now);
  const start = timeToMinutes(input.start);
  const end = timeToMinutes(input.end);

  if (!isValidDate(input.date)) {
    fieldErrors.date = 'Enter a valid date.';
  } else if (input.date < today) {
    fieldErrors.date = 'Bookings cannot be made for past dates.';
  }

  if (start === null) {
    fieldErrors.start = 'Enter a valid start time.';
  } else if (start < WORKING_DAY_START || start > WORKING_DAY_END) {
    fieldErrors.start = 'Start time must be within 09:00–18:00.';
  } else if (input.date === today && start < localTimeInMinutes(now)) {
    fieldErrors.start = 'This start time has already passed.';
  }

  if (end === null) {
    fieldErrors.end = 'Enter a valid end time.';
  } else if (end < WORKING_DAY_START || end > WORKING_DAY_END) {
    fieldErrors.end = 'End time must be within 09:00–18:00.';
  }

  if (start !== null && end !== null && !fieldErrors.end) {
    if (start >= end) {
      fieldErrors.end = 'End time must be later than start time.';
    } else if (end - start < MIN_BOOKING_DURATION || end - start > MAX_BOOKING_DURATION) {
      fieldErrors.end = 'Duration must be between 30 minutes and 2 hours.';
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, code: 'VALIDATION_ERROR', message: 'Check the booking details.', fieldErrors };
  }

  // The guards above establish valid times before overlap calculations.
  if (start !== null && end !== null && bookings.some((booking) => {
    if (booking.date !== input.date || booking.id === excludeId) return false;
    const existingStart = timeToMinutes(booking.start);
    const existingEnd = timeToMinutes(booking.end);
    return existingStart !== null && existingEnd !== null
      && intervalsOverlap(start, end, existingStart, existingEnd);
  })) {
    return {
      valid: false,
      code: 'BOOKING_CONFLICT',
      message: 'This time overlaps another booking. Refresh availability and choose another time.',
    };
  }

  return { valid: true };
}
