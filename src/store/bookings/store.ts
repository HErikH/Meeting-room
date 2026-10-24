import { create } from "zustand";
import { bookingsApi } from "@/api/bookings";
import { ApiError } from "@/api/error";
import { formatLocalDate, isValidDate } from "@utils/dateTime";
import { INITIAL_BOOKINGS_STATE } from "./constants";
import type { BookingsStore } from "./types";

export const useBookingsStore = create<BookingsStore>((set, get) => {
  let controller: AbortController | undefined;
  let requestId = 0;

  return {
    ...INITIAL_BOOKINGS_STATE,

    selectedDate: formatLocalDate(new Date()),

    async changeDate(date) {
      if (
        !isValidDate(date) ||
        date === get().selectedDate ||
        get().isSaving ||
        get().deletingId
      )
        return;
      controller?.abort();
      set({
        selectedDate: date,
        bookings: [],
        status: "loading",
        error: null,
        deleteError: null,
      });
      await get().refreshBookings();
    },

    async refreshBookings() {
      const currentRequest = ++requestId;
      const date = get().selectedDate;

      controller?.abort();
      controller = new AbortController();

      const signal = controller.signal;
      set({ status: "loading", error: null });

      try {
        const bookings = await bookingsApi.list(date, signal);
        if (
          signal.aborted ||
          currentRequest !== requestId ||
          date !== get().selectedDate
        )
          return;
        set({ bookings, status: "success" });
      } catch (error) {
        if (
          signal.aborted ||
          currentRequest !== requestId ||
          date !== get().selectedDate
        )
          return;
        set({
          status: "error",
          error:
            error instanceof Error ? error.message : "Unable to load bookings.",
        });
      }
    },

    async saveBooking(input, id) {
      if (get().isSaving || get().deletingId)
        throw new Error("Please wait for the current change to finish.");
      set({ isSaving: true, deleteError: null });

      try {
        const booking = id
          ? await bookingsApi.update(id, input)
          : await bookingsApi.create(input);

        set((state) => ({
          bookings:
            state.selectedDate === booking.date
              ? [
                  ...state.bookings.filter((item) => item.id !== booking.id),
                  booking,
                ].sort((a, b) => a.start.localeCompare(b.start))
              : state.bookings,
        }));
        // A failed refresh is a list error; it must not turn a successful save into a failed save.
        await get().refreshBookings();

        return booking;
      } catch (error) {
        if (
          error instanceof ApiError &&
          (error.status === 409 || error.status === 404)
        ) {
          await get().refreshBookings();
        }
        throw error;
      } finally {
        set({ isSaving: false });
      }
    },

    async deleteBooking(id) {
      if (get().isSaving || get().deletingId) return false;
      set({ deletingId: id, deleteError: null });

      try {
        await bookingsApi.remove(id);
        set((state) => ({
          bookings: state.bookings.filter((booking) => booking.id !== id),
        }));
        await get().refreshBookings();
        return true;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404)
          await get().refreshBookings();
        set({
          deleteError:
            error instanceof Error
              ? error.message
              : "Unable to delete this booking.",
        });
        return false;
      } finally {
        set({ deletingId: null });
      }
    },
  };
});
