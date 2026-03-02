# @tracekit/angular

TraceKit Angular Integration -- Error capture and navigation breadcrumbs for Angular 17+.

## Installation

```bash
npm install @tracekit/angular @tracekit/browser
```

## Quick Start

```typescript
import { ErrorHandler, NgModule } from '@angular/core';
import { init } from '@tracekit/browser';
import { TraceKitErrorHandler } from '@tracekit/angular';

init({ dsn: 'https://your-dsn@tracekit.dev/1' });

@NgModule({
  providers: [
    { provide: ErrorHandler, useClass: TraceKitErrorHandler },
  ],
})
export class AppModule {}
```

### Standalone Components (Angular 17+)

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { init } from '@tracekit/browser';
import { TraceKitErrorHandler } from '@tracekit/angular';

init({ dsn: 'https://your-dsn@tracekit.dev/1' });

bootstrapApplication(AppComponent, {
  providers: [
    { provide: ErrorHandler, useClass: TraceKitErrorHandler },
  ],
});
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showDialog` | `boolean` | `false` | Show a user feedback dialog on error |

## Documentation

Full documentation: [https://app.tracekit.dev/docs/frontend/frameworks](https://app.tracekit.dev/docs/frontend/frameworks)

## License

MIT
