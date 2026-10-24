export type Booking = {
  id: string;
  /** Local calendar date in YYYY-MM-DD format. Validated at runtime. */
  date: string;
  /** Local start time in HH:mm format. Validated at runtime. */
  start: string;
  /** Local end time in HH:mm format. Validated at runtime. */
  end: string;
  title?: string;
};

export type CreateBookingInput = Omit<Booking, "id">;

/** PATCH fields are merged with the stored booking before validation. */
export type UpdateBookingInput = Partial<CreateBookingInput>;

export type BookingField = keyof CreateBookingInput;

export type BookingFieldErrors = Partial<Record<BookingField, string>>;

export type BookingValidationResult =
  | { valid: true }
  | {
      valid: false;
      code: "VALIDATION_ERROR" | "BOOKING_CONFLICT";
      message: string;
      fieldErrors?: BookingFieldErrors;
    };
