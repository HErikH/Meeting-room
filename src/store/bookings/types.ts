import type { T_Booking, T_CreateBookingInput } from "@app-types/booking";

export type T_BookingsState = {
  selectedDate: string;
  bookings: T_Booking[];
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  isSaving: boolean;
  deletingId: string | null;
  deleteError: string | null;
};

export type T_BookingsActions = {
  changeDate: (date: string) => Promise<void>;
  refreshBookings: () => Promise<void>;
  saveBooking: (input: T_CreateBookingInput, id?: string) => Promise<T_Booking>;
  deleteBooking: (id: string) => Promise<boolean>;
};

export type T_BookingsStore = T_BookingsState & T_BookingsActions;
