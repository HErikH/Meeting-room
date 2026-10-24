import { useBookingsStore } from "./store";

// Store actions are stable references and do not need React subscriptions.
export const { changeDate, refreshBookings, saveBooking, deleteBooking } =
  useBookingsStore.getState();
