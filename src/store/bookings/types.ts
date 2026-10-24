import type { Booking, CreateBookingInput } from "@app-types/booking";

export type BookingsState = {
  selectedDate: string;
  bookings: Booking[];
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  isSaving: boolean;
  deletingId: string | null;
  deleteError: string | null;
};

export type BookingsActions = {
  changeDate: (date: string) => Promise<void>;
  refreshBookings: () => Promise<void>;
  saveBooking: (input: CreateBookingInput, id?: string) => Promise<Booking>;
  deleteBooking: (id: string) => Promise<boolean>;
};

export type BookingsStore = BookingsState & BookingsActions;
