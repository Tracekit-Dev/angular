/**
 * TraceKit Angular Integration
 * @package @tracekit/angular
 *
 * Provides Angular-native error capture and navigation breadcrumbs
 * built on top of @tracekit/browser.
 *
 * Usage (standalone):
 *   bootstrapApplication(AppComponent, {
 *     providers: [...provideTraceKit({ apiKey: '...' })],
 *   });
 *
 * Usage (NgModule):
 *   @NgModule({
 *     imports: [TraceKitModule.forRoot({ apiKey: '...' })],
 *   })
 *   export class AppModule {}
 */

// Re-export core SDK functions for convenience
export {
  captureException,
  captureMessage,
  setUser,
  setTag,
  setExtra,
  addBreadcrumb,
  getClient,
} from '@tracekit/browser';

// Angular-specific exports
export { TraceKitErrorHandler } from './errorhandler';
export { provideTraceKit, TraceKitModule } from './providers';
export { setupAngularRouterBreadcrumbs, provideTraceKitRouter } from './router';

// Types
export type { TraceKitAngularConfig } from './types';
