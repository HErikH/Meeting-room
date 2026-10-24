import type { T_Booking, T_CreateBookingInput, T_UpdateBookingInput } from '@app-types/booking';
import { validateBooking } from '@utils/bookingRules';
import { isValidDate } from '@utils/dateTime';
import { ApiError } from './error';

type T_MockApiOptions = {
  delayMs?: number;
  now?: () => Date;
  conflictNextCreate?: boolean;
};

export function createBookingsApi({
  delayMs = 300,
  now = () => new Date(),
  conflictNextCreate = false,
}: T_MockApiOptions = {}) {
  const bookings: T_Booking[] = [];
  let pendingConflict = conflictNextCreate;

  async function wait(signal?: AbortSignal): Promise<void> {
    signal?.throwIfAborted();

    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

    signal?.throwIfAborted();
  }

  function assertValid(input: T_CreateBookingInput, excludeId?: string): void {
    const result = validateBooking(input, bookings, { now: now(), excludeId });

    if (!result.valid) {
      throw new ApiError(result.code === 'BOOKING_CONFLICT' ? 409 : 400, {
        code: result.code,
        message: result.message,
        fieldErrors: result.fieldErrors,
      });
    }
  }

  function findIndex(id: string): number {
    const index = bookings.findIndex((booking) => booking.id === id);

    if (index === -1) {
      throw new ApiError(404, { code: 'NOT_FOUND', message: 'This booking no longer exists.' });
    }

    return index;
  }

  return {
    async list(date: string, signal?: AbortSignal): Promise<T_Booking[]> {
      await wait(signal);

      if (!isValidDate(date)) {
        throw new ApiError(400, { code: 'BAD_REQUEST', message: 'Provide a valid date in YYYY-MM-DD format.' });
      }

      return bookings
        .filter((booking) => booking.date === date)
        .sort((a, b) => a.start.localeCompare(b.start))
        .map((booking) => ({ ...booking }));
    },

    async create(input: T_CreateBookingInput): Promise<T_Booking> {
      // Snapshot the submitted values before waiting; the form may change meanwhile.
      const draft = { ...input };
      await wait();
      assertValid(draft);

      if (pendingConflict) {
        pendingConflict = false;
        bookings.push({ ...draft, id: crypto.randomUUID(), title: 'Booked by another participant' });
        throw new ApiError(409, {
          code: 'BOOKING_CONFLICT',
          message: 'This slot was booked by someone else. Refresh availability and choose another time.',
        });
      }

      // Validate and commit without another await, so simultaneous saves cannot both win.
      const booking: T_Booking = { ...draft, id: crypto.randomUUID() };

      bookings.push(booking);

      return { ...booking };
    },

    async update(id: string, input: T_UpdateBookingInput): Promise<T_Booking> {
      const changes = { ...input };
      
      await wait();

      const index = findIndex(id);
      const booking: T_Booking = { ...bookings[index], ...changes, id };

      assertValid(booking, id);

      bookings[index] = booking;

      return { ...booking };
    },

    async remove(id: string): Promise<void> {
      await wait();
      bookings.splice(findIndex(id), 1);
    },
  };
}

const conflictNextCreate = typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('mockConflict') === 'once';

export const bookingsApi = createBookingsApi({ conflictNextCreate });
