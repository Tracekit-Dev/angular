import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @tracekit/browser
vi.mock('@tracekit/browser', () => ({
  captureException: vi.fn(),
}));

import { captureException } from '@tracekit/browser';
import { TraceKitErrorHandler } from '../errorhandler';

describe('TraceKitErrorHandler', () => {
  let handler: TraceKitErrorHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new TraceKitErrorHandler();
  });

  it('calls captureException for Error instances with handled: false', () => {
    const error = new Error('test error');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    handler.handleError(error);

    expect(captureException).toHaveBeenCalledWith(error, { handled: false });
    consoleError.mockRestore();
  });

  it('calls console.error to preserve Angular output', () => {
    const error = new Error('test error');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    handler.handleError(error);

    expect(consoleError).toHaveBeenCalledWith(error);
    consoleError.mockRestore();
  });

  it('handles wrapped errors with originalError', () => {
    const originalError = new Error('original error');
    const wrappedError = { originalError, message: 'wrapped' };
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    handler.handleError(wrappedError);

    expect(captureException).toHaveBeenCalledWith(originalError, {
      handled: false,
    });
    consoleError.mockRestore();
  });

  it('handles wrapped errors with rejection', () => {
    const rejectionError = new Error('promise rejection');
    const wrappedError = { rejection: rejectionError, message: 'unhandled' };
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    handler.handleError(wrappedError);

    expect(captureException).toHaveBeenCalledWith(rejectionError, {
      handled: false,
    });
    consoleError.mockRestore();
  });

  it('handles non-Error values gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    handler.handleError('string error');

    expect(captureException).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith('string error');
    consoleError.mockRestore();
  });

  it('handles null/undefined errors gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    handler.handleError(null);
    handler.handleError(undefined);

    expect(captureException).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});
