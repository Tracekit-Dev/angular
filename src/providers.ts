import { ErrorHandler } from '@angular/core';
import type { Provider } from '@angular/core';
import { init } from '@tracekit/browser';
import type { TraceKitAngularConfig } from './types';
import { TraceKitErrorHandler } from './errorhandler';

/**
 * Provide TraceKit error handling for standalone Angular apps.
 *
 * Initializes the @tracekit/browser SDK and returns a provider array
 * that replaces Angular's default ErrorHandler with TraceKitErrorHandler.
 *
 * Usage:
 *   bootstrapApplication(AppComponent, {
 *     providers: [...provideTraceKit({ apiKey: '...' })],
 *   });
 */
export function provideTraceKit(config: TraceKitAngularConfig): Provider[] {
  init(config);

  return [
    { provide: ErrorHandler, useClass: TraceKitErrorHandler },
  ];
}

/**
 * TraceKit Module for NgModule-based Angular apps.
 *
 * No @NgModule() decorator -- tsup/esbuild cannot process Angular decorators.
 * This is a plain class with a static forRoot() method, following the same
 * approach as Sentry's Angular SDK.
 *
 * Usage:
 *   @NgModule({
 *     imports: [TraceKitModule.forRoot({ apiKey: '...' })],
 *   })
 *   export class AppModule {}
 */
export class TraceKitModule {
  static forRoot(config: TraceKitAngularConfig): {
    ngModule: typeof TraceKitModule;
    providers: Provider[];
  } {
    return {
      ngModule: TraceKitModule,
      providers: provideTraceKit(config),
    };
  }
}
