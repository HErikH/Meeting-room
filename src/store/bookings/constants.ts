import type { T_BookingsState } from "./types";

export const INITIAL_BOOKINGS_STATE: Omit<T_BookingsState, "selectedDate"> = {
  bookings: [],
  status: "idle",
  error: null,
  isSaving: false,
  deletingId: null,
  deleteError: null,
};
