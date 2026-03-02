import { APP_INITIALIZER, Injector } from '@angular/core';
import type { Provider } from '@angular/core';
import { addBreadcrumb } from '@tracekit/browser';

/**
 * Set up Angular Router navigation breadcrumbs.
 *
 * Subscribes to router.events and captures NavigationEnd events as breadcrumbs.
 * When parameterized is true (default), attempts to extract the route config path
 * by walking the activated route tree.
 *
 * @param router - Angular Router instance (typed as `any` to avoid import issues)
 * @param parameterized - Use route config patterns instead of full URLs
 */
export function setupAngularRouterBreadcrumbs(
  router: any,
  parameterized: boolean = true,
): void {
  let lastUrl = '';

  router.events.subscribe((event: any) => {
    // Check for NavigationEnd by constructor name to avoid direct import
    // of NavigationEnd class (which would require @angular/router at build time)
    if (
      event.constructor?.name === 'NavigationEnd' ||
      (event.urlAfterRedirects !== undefined && event.id !== undefined && event.url !== undefined)
    ) {
      let toUrl = event.urlAfterRedirects || event.url;

      if (parameterized && router.routerState?.snapshot?.root) {
        const parameterizedPath = extractParameterizedPath(
          router.routerState.snapshot.root,
        );
        if (parameterizedPath) {
          toUrl = parameterizedPath;
        }
      }

      addBreadcrumb({
        category: 'navigation',
        message: `${lastUrl} -> ${toUrl}`,
        data: { from: lastUrl, to: toUrl },
      });

      lastUrl = toUrl;
    }
  });
}

/**
 * Extract the parameterized route path from the activated route tree.
 * Walks firstChild chain and joins route config paths.
 */
function extractParameterizedPath(
  route: any,
): string | null {
  const segments: string[] = [];
  let current = route;

  while (current) {
    if (current.routeConfig?.path) {
      segments.push(current.routeConfig.path);
    }
    current = current.firstChild;
  }

  if (segments.length === 0) {
    return null;
  }

  return '/' + segments.join('/');
}

/**
 * Provide TraceKit Router breadcrumbs via APP_INITIALIZER.
 *
 * Uses APP_INITIALIZER to lazily resolve the Router from the Injector,
 * avoiding the circular DI pitfall where Router is not yet available
 * when ErrorHandler is created.
 *
 * Usage:
 *   bootstrapApplication(AppComponent, {
 *     providers: [
 *       ...provideTraceKit({ apiKey: '...' }),
 *       ...provideTraceKitRouter(),
 *     ],
 *   });
 */
export function provideTraceKitRouter(
  parameterized: boolean = true,
): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => {
        return () => {
          try {
            // Lazily resolve Router to avoid circular DI
            const Router = injector.get(
              /* Router resolved at runtime to avoid circular dep */ 'Router' as any,
            );
            if (Router) {
              setupAngularRouterBreadcrumbs(Router, parameterized);
            }
          } catch {
            // Router not available -- skip breadcrumbs
          }
        };
      },
      deps: [Injector],
      multi: true,
    },
  ];
}
