import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Subject } from 'rxjs';

// Mock @tracekit/browser
vi.mock('@tracekit/browser', () => ({
  addBreadcrumb: vi.fn(),
}));

import { APP_INITIALIZER, Injector } from '@angular/core';
import { addBreadcrumb } from '@tracekit/browser';
import { setupAngularRouterBreadcrumbs, provideTraceKitRouter } from '../router';

// Mock NavigationEnd event
function createNavigationEnd(url: string, urlAfterRedirects: string, id: number = 1) {
  return {
    id,
    url,
    urlAfterRedirects,
    constructor: { name: 'NavigationEnd' },
  };
}

// Mock router with events as rxjs Subject
function createMockRouter(routerState?: any) {
  return {
    events: new Subject<any>(),
    routerState: routerState || null,
  };
}

describe('setupAngularRouterBreadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to router.events', () => {
    const router = createMockRouter();
    const subscribeSpy = vi.spyOn(router.events, 'subscribe');

    setupAngularRouterBreadcrumbs(router);

    expect(subscribeSpy).toHaveBeenCalled();
  });

  it('calls addBreadcrumb on NavigationEnd with from/to', () => {
    const router = createMockRouter();
    setupAngularRouterBreadcrumbs(router, false);

    // First navigation
    router.events.next(createNavigationEnd('/home', '/home'));

    expect(addBreadcrumb).toHaveBeenCalledWith({
      category: 'navigation',
      message: ' -> /home',
      data: { from: '', to: '/home' },
    });

    // Second navigation
    router.events.next(createNavigationEnd('/about', '/about', 2));

    expect(addBreadcrumb).toHaveBeenCalledWith({
      category: 'navigation',
      message: '/home -> /about',
      data: { from: '/home', to: '/about' },
    });
  });

  it('tracks lastUrl across navigations', () => {
    const router = createMockRouter();
    setupAngularRouterBreadcrumbs(router, false);

    router.events.next(createNavigationEnd('/page1', '/page1'));
    router.events.next(createNavigationEnd('/page2', '/page2', 2));
    router.events.next(createNavigationEnd('/page3', '/page3', 3));

    expect(addBreadcrumb).toHaveBeenCalledTimes(3);

    // Third call should have from=/page2
    expect(addBreadcrumb).toHaveBeenNthCalledWith(3, {
      category: 'navigation',
      message: '/page2 -> /page3',
      data: { from: '/page2', to: '/page3' },
    });
  });

  it('uses urlAfterRedirects for URL', () => {
    const router = createMockRouter();
    setupAngularRouterBreadcrumbs(router, false);

    router.events.next(createNavigationEnd('/old-path', '/redirected-path'));

    expect(addBreadcrumb).toHaveBeenCalledWith({
      category: 'navigation',
      message: ' -> /redirected-path',
      data: { from: '', to: '/redirected-path' },
    });
  });

  it('uses parameterized paths when option is true and route state available', () => {
    const routerState = {
      snapshot: {
        root: {
          routeConfig: null,
          firstChild: {
            routeConfig: { path: 'users' },
            firstChild: {
              routeConfig: { path: ':id' },
              firstChild: null,
            },
          },
        },
      },
    };
    const router = createMockRouter(routerState);
    setupAngularRouterBreadcrumbs(router, true);

    router.events.next(createNavigationEnd('/users/123', '/users/123'));

    expect(addBreadcrumb).toHaveBeenCalledWith({
      category: 'navigation',
      message: ' -> /users/:id',
      data: { from: '', to: '/users/:id' },
    });
  });

  it('ignores non-NavigationEnd events', () => {
    const router = createMockRouter();
    setupAngularRouterBreadcrumbs(router);

    // Emit a non-NavigationEnd event (no urlAfterRedirects)
    router.events.next({ type: 'NavigationStart', url: '/somewhere' });

    expect(addBreadcrumb).not.toHaveBeenCalled();
  });
});

describe('provideTraceKitRouter', () => {
  it('returns provider with APP_INITIALIZER token', () => {
    const providers = provideTraceKitRouter();

    expect(providers.length).toBe(1);
    const provider = providers[0] as any;
    expect(provider.provide).toBe(APP_INITIALIZER);
  });

  it('has multi: true for APP_INITIALIZER', () => {
    const providers = provideTraceKitRouter();
    const provider = providers[0] as any;
    expect(provider.multi).toBe(true);
  });

  it('uses Injector as dependency', () => {
    const providers = provideTraceKitRouter();
    const provider = providers[0] as any;
    expect(provider.deps).toContain(Injector);
  });
});
