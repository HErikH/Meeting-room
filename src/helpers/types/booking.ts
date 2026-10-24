export type T_Booking = {
  id: string;
  /** Local calendar date in YYYY-MM-DD format. Validated at runtime. */
  date: string;
  /** Local start time in HH:mm format. Validated at runtime. */
  start: string;
  /** Local end time in HH:mm format. Validated at runtime. */
  end: string;
  title?: string;
};

export type T_CreateBookingInput = Omit<T_Booking, "id">;

/** PATCH fields are merged with the stored booking before validation. */
export type T_UpdateBookingInput = Partial<T_CreateBookingInput>;

export type T_BookingField = keyof T_CreateBookingInput;

export type T_BookingFieldErrors = Partial<Record<T_BookingField, string>>;

export type T_BookingValidationResult =
  | { valid: true }
  | {
      valid: false;
      code: "VALIDATION_ERROR" | "BOOKING_CONFLICT";
      message: string;
      fieldErrors?: T_BookingFieldErrors;
    };
