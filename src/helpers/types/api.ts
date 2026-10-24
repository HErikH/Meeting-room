import type { T_BookingFieldErrors } from "./booking";

export type T_ApiErrorResponse = {
  message: string;
  code?: string;
  fieldErrors?: T_BookingFieldErrors;
};
