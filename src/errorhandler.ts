import type { ErrorHandler } from '@angular/core';
import { captureException } from '@tracekit/browser';

/**
 * TraceKit ErrorHandler for Angular.
 *
 * Captures errors via handleError() and re-throws to console.error
 * to preserve Angular's default console output.
 *
 * No @Injectable() decorator -- tsup/esbuild cannot process Angular decorators.
 * Provided via `useClass` in provideTraceKit() which works with plain constructors.
 */
export class TraceKitErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    // Angular sometimes wraps errors -- extract the underlying error
    const extractedError = this.extractError(error);

    if (extractedError instanceof Error) {
      captureException(extractedError, { handled: false });
    }

    // Preserve Angular's default console output
    console.error(error);
  }

  private extractError(error: unknown): unknown {
    // Angular wraps errors in various ways
    if (error && typeof error === 'object') {
      // Check for Angular's wrapped error patterns
      if ('originalError' in error && error.originalError) {
        return error.originalError;
      }
      if ('rejection' in error && error.rejection) {
        return error.rejection;
      }
    }
    return error;
  }
}
