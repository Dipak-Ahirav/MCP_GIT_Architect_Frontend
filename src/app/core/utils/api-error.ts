import {
  HttpErrorResponse,
} from '@angular/common/http';

export function getApiError(
  error: unknown,
): string {

  if (
    error instanceof HttpErrorResponse
  ) {
    return (
      error.error?.message ??
      error.message ??
      'Request failed'
    );
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return 'Something went wrong.';
}