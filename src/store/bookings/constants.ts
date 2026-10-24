import type { BookingsState } from "./types";

export const INITIAL_BOOKINGS_STATE: Omit<BookingsState, "selectedDate"> = {
  bookings: [],
  status: "idle",
  error: null,
  isSaving: false,
  deletingId: null,
  deleteError: null,
};
