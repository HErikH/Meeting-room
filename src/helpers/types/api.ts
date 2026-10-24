import type { BookingFieldErrors } from './booking';

export type ApiErrorResponse = {
  message: string;
  code?: string;
  fieldErrors?: BookingFieldErrors;
};
