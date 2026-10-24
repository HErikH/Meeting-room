import type { T_ApiErrorResponse } from '@app-types/api';
import type { T_BookingFieldErrors } from '@app-types/booking';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: T_BookingFieldErrors;

  constructor(status: number, payload: T_ApiErrorResponse) {
    super(payload.message);

    this.name = 'ApiError';
    this.status = status;
    this.code = payload.code;
    this.fieldErrors = payload.fieldErrors;
  }
}
