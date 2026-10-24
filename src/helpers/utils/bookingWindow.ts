import type { useNow } from "@hooks/useNow";
import { formatLocalDate, localTimeInMinutes } from "@utils/dateTime";
import {
  MAX_BOOKING_DURATION,
  MIN_BOOKING_DURATION,
  WORKING_DAY_END,
  WORKING_DAY_START,
} from "@constants/booking";

type T_Now = ReturnType<typeof useNow>;

export type T_ClosedReason = "past" | "full" | null;

export type T_BookingWindow = {
  closedReason: T_ClosedReason;
  startMin: number;
  startMax: number;
  endMin: number;
  endMax: number;
};

export function getBookingWindow(
  date: string,
  now: T_Now,
  start: number | null,
): T_BookingWindow {
  const today = formatLocalDate(now);
  const startMin =
    date === today
      ? Math.max(WORKING_DAY_START, Math.ceil(localTimeInMinutes(now)))
      : WORKING_DAY_START;
  const startMax = WORKING_DAY_END - MIN_BOOKING_DURATION;

  const closedReason: T_ClosedReason =
    date < today ? "past" : startMin > startMax ? "full" : null;

  return {
    closedReason,
    startMin,
    startMax,
    endMin:
      Math.max(WORKING_DAY_START, start ?? WORKING_DAY_START) +
      MIN_BOOKING_DURATION,
    endMax: Math.min(
      WORKING_DAY_END,
      (start ?? WORKING_DAY_END) + MAX_BOOKING_DURATION,
    ),
  };
}

export function getValidDuration(start: number | null, end: number | null) {
  if (start === null || end === null) return null;
  const duration = end - start;
  return duration >= MIN_BOOKING_DURATION && duration <= MAX_BOOKING_DURATION
    ? duration
    : null;
}
