import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @tracekit/browser
vi.mock('@tracekit/browser', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
}));

import { ErrorHandler } from '@angular/core';
import { init } from '@tracekit/browser';
import { provideTraceKit, TraceKitModule } from '../providers';
import { TraceKitErrorHandler } from '../errorhandler';

describe('provideTraceKit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls init with config', () => {
    const config = { apiKey: 'test-key', environment: 'test' };
    provideTraceKit(config);

    expect(init).toHaveBeenCalledWith(config);
  });

  it('returns array with ErrorHandler provider', () => {
    const config = { apiKey: 'test-key' };
    const providers = provideTraceKit(config);

    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBe(1);
  });

  it('provider useClass is TraceKitErrorHandler', () => {
    const config = { apiKey: 'test-key' };
    const providers = provideTraceKit(config);

    const errorHandlerProvider = providers[0] as any;
    expect(errorHandlerProvider.useClass).toBe(TraceKitErrorHandler);
  });

  it('provider uses Angular ErrorHandler token', () => {
    const config = { apiKey: 'test-key' };
    const providers = provideTraceKit(config);

    const errorHandlerProvider = providers[0] as any;
    expect(errorHandlerProvider.provide).toBe(ErrorHandler);
  });
});

describe('TraceKitModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forRoot returns object with ngModule and providers array', () => {
    const config = { apiKey: 'test-key' };
    const result = TraceKitModule.forRoot(config);

    expect(result.ngModule).toBe(TraceKitModule);
    expect(Array.isArray(result.providers)).toBe(true);
  });

  it('forRoot providers match provideTraceKit output structure', () => {
    const config = { apiKey: 'test-key' };

    // Call init manually to reset mock
    vi.clearAllMocks();
    const directProviders = provideTraceKit(config);

    vi.clearAllMocks();
    const moduleResult = TraceKitModule.forRoot(config);

    // Both should have the same number of providers
    expect(moduleResult.providers.length).toBe(directProviders.length);

    // Both should provide TraceKitErrorHandler
    const directProvider = directProviders[0] as any;
    const moduleProvider = moduleResult.providers[0] as any;
    expect(directProvider.useClass).toBe(moduleProvider.useClass);
  });

  it('forRoot calls init with config', () => {
    const config = { apiKey: 'module-key' };
    TraceKitModule.forRoot(config);

    expect(init).toHaveBeenCalledWith(config);
  });
});
