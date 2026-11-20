import { HttpErrorResponse } from '@angular/common/http';
import { Translatable } from './translatable';

/** Les codes d'erreur de l'API (enum ErrorCode côté Java). Chacun a sa traduction dans apiErrors. */
export const API_ERROR_CODES = [
  'VALIDATION_FAILED',
  'INVALID_CREDENTIALS',
  'EMAIL_TAKEN',
  'ROOM_NOT_FOUND',
  'BOOKING_NOT_FOUND',
  'SLOT_TAKEN',
  'PLAYER_COUNT_OUT_OF_RANGE',
  'SLOT_IN_PAST',
  'BEYOND_BOOKING_WINDOW',
  'ROOM_CLOSED',
  'NOT_A_SLOT',
  'ALREADY_CANCELLED',
  'CANCELLATION_TOO_LATE',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return API_ERROR_CODES.includes(value as ApiErrorCode);
}

export function apiErrorMessage(error: unknown, fallbackKey: string): Translatable {
  if (error instanceof HttpErrorResponse && isApiErrorCode(error.error?.code)) {
    const params = error.error.params;
    return {
      key: `apiErrors.${error.error.code}`,
      params: typeof params === 'object' && params !== null ? params : {},
    };
  }
  return { key: fallbackKey };
}