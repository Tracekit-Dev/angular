import type { TracekitBrowserConfig } from '@tracekit/browser';

export interface TraceKitAngularConfig extends TracekitBrowserConfig {
  parameterizedRoutes?: boolean; // default: true
}
