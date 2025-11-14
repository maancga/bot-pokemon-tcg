# Architecture Overview

This project follows **Clean Architecture** principles with **Dependency Injection** using **Inversify 7**.

## Project Structure

```
src/
├── app.ts                          # Hono app instance from DI
├── main.ts                         # Application bootstrap
├── container.ts                    # Main DI container configuration
│
├── shared/                         # Shared cross-cutting concerns
│   ├── config/
│   │   ├── domain/Token.ts         # DI service identifiers
│   │   └── infrastructure/
│   │       └── config.ts           # Environment configuration
│   │
│   ├── loggers/
│   │   ├── domain/Logger.ts        # Logger interface
│   │   └── infrastructure/
│   │       └── ConsoleLogger.ts    # Console implementation
│   │
│   ├── persistence/
│   │   └── infrastructure/
│   │       └── CreateMongoClient.ts  # MongoDB module & factories
│   │
│   ├── schedulers/
│   │   ├── domain/Scheduler.ts     # Scheduler interface
│   │   └── infrastructure/
│   │       └── NodeCronScheduler.ts  # node-cron implementation
│   │
│   └── controllers/
│       └── infrastructure/
│           └── createHono.ts       # Hono app factory
│
└── cards/                          # Cards domain (DDD)
    ├── domain/
    │   ├── Card.ts                 # Card entity
    │   ├── CardsProvider.ts        # Provider interface
    │   └── CardsDataRepository.ts  # Repository interface
    │
    ├── use-cases/
    │   └── SyncCards.ts            # Sync cards use case
    │
    └── infrastructure/
        ├── providers/
        │   ├── GAMEStoreCardProvider.ts   # GAME store scraper
        │   └── FakeCardsProvider.ts       # Fake for testing
        └── repositories/
            └── CardsDataRepository.ts     # MongoDB implementation

tests/
├── helpers/
│   ├── fixtures/
│   │   └── CardFixtures.ts         # Test data Mother pattern
│   ├── mongoTestHelpers.ts         # MongoDB test utilities
│   └── testMongoModule.ts          # Test-specific DI module
│
└── card-notification-flow.test.ts  # E2E tests
```

## Key Design Patterns

### 1. Dependency Injection with Inversify 7 (No Decorators)

We use **static factory methods** instead of decorators for explicit, type-safe dependency resolution.

#### Factory Pattern with ResolutionContext

```typescript
export class SyncCards {
  static async create(context: ResolutionContext) {
    const provider = await context.getAsync<CardsProvider>(Token.CARDS_PROVIDER);
    const repository = await context.getAsync<CardsRepository>(Token.CARDS_REPOSITORY);
    const logger = context.get<Logger>(Token.LOGGER);
    return new SyncCards(provider, repository, logger);
  }

  constructor(
    private readonly cardProvider: CardsProvider,
    private readonly cardRepository: CardsRepository,
    private readonly logger: Logger
  ) {}
}
```

#### Binding Strategies

**Approach 1: Token-Based (Recommended for shared services)**
```typescript
// Good for: cross-cutting concerns, multiple implementations, arrays
container.bind<Logger>(Token.LOGGER).toDynamicValue(ConsoleLogger.create);
container.bind<Scheduler>(Token.SCHEDULER).toDynamicValue(NodeCronScheduler.create);
```

**Approach 2: Class-Based (Simpler for unique services)**
```typescript
// Good for: unique use cases, repositories, single-instance services
container.bind<SyncCards>(SyncCards).toDynamicValue(SyncCards.create);
```

**Approach 3: Multi-Binding with Tokens (For collections)**
```typescript
// When you need multiple instances (e.g., multiple HTTP endpoints)
container.bind<RouteHandler>(Token.ROUTE_HANDLER).toDynamicValue(HealthCheckRoute.create);
container.bind<RouteHandler>(Token.ROUTE_HANDLER).toDynamicValue(ScrapeRoute.create);

// Collect all in Hono factory:
const handlers = container.getAll<RouteHandler>(Token.ROUTE_HANDLER);
handlers.forEach(handler => handler.register(app));
```

#### ContainerModule Pattern

For infrastructure concerns, use `ContainerModule` for better organization:

```typescript
// mongoModule.ts
export const mongoModule = new ContainerModule(({ bind }) => {
  bind(Token.DB_CONFIG).toConstantValue(config.db);
  bind(MongoClient).toDynamicValue(createMongoClient);
  bind(Db).toDynamicValue(createDb);
});

// container.ts
container.loadSync(mongoModule);
```

**Key Changes in Inversify 7:**
- Use `ResolutionContext` instead of `interfaces.Context`
- Access methods directly: `context.get()` not `context.container.get()`
- `ContainerModule` callback receives options object: `({ bind }) => ...`
- Use `loadSync()` for synchronous modules, `load()` for async

### 2. Domain-Driven Design (DDD)

Each domain (e.g., `cards`) follows the structure:
- **domain/** - Entities and interfaces (business rules)
- **use-cases/** - Application logic
- **infrastructure/** - Implementations (DB, API, etc.)

### 3. Interface Segregation

```typescript
// Logger interface - can swap implementations
export interface Logger {
  info(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

// Current: ConsoleLogger
// Future: Winston, Pino, or custom cloud logger
```

### 4. Repository Pattern

```typescript
// Interface in domain
export interface CardsRepository {
  save(cards: Card[]): Promise<void>;
}

// MongoDB implementation in infrastructure
export class MongoCardsRepository implements CardsRepository {
  async save(cards: Card[]): Promise<void> {
    // MongoDB-specific logic
  }
}
```

## Application Flow

### Startup (main.ts)

1. Load DI container with all bindings
2. Get Hono app instance from DI
3. Start HTTP server
4. Initialize cron scheduler
5. Optionally run initial sync

### Cron Job (scheduler.ts)

1. Trigger at scheduled time
2. Get SyncCards use case from DI
3. Execute sync
4. Log results

### Sync Flow (SyncCards use case)

1. Fetch cards from provider (e.g., GAME store via Puppeteer)
2. Save to repository (MongoDB with compound index deduplication)
3. Log progress

## Deduplication Strategy

Cards are deduplicated using MongoDB compound unique index:

```typescript
// Compound index on (source, link)
db.cards.createIndex({ source: 1, link: 1 }, { unique: true });

// Upsert operation
{
  filter: { source: "gamestore", link: "https://..." },
  update: {
    $set: { ...cardData, lastScrapedAt: now },
    $setOnInsert: { createdAt: now }
  },
  upsert: true
}
```

**Benefits:**
- Natural deduplication
- Human-readable queries
- Efficient lookups
- No hash computation needed

## Testing Strategy

### Test Doubles & Fixtures

```
tests/helpers/
├── fixtures/
│   └── CardFixtures.ts     # Mother pattern for test data
├── mongoTestHelpers.ts      # MongoDB test setup/teardown
└── testMongoModule.ts       # Test-specific DI bindings
```

**Mother Pattern** - Provides reusable, consistent test data:
```typescript
CardFixtures.bulbasaurEx()    // Single card
CardFixtures.defaultSet()     // 3 cards
CardFixtures.largeSet()       // 6 cards
CardFixtures.custom({ ... })  // Custom overrides
```

### Test Types

- **Unit tests**: `*.test.ts` (co-located with source)
- **Integration tests**: `*.integration.test.ts` (co-located with source)
- **E2E tests**: `tests/*.test.ts`

### Path Aliases

Tests use `@tests/*` alias for cleaner imports:
```typescript
import { CardFixtures } from "@tests/helpers/fixtures/CardFixtures.ts";
```

Configured in `tsconfig.json` and vitest configs.

## Configuration

Environment variables (see `.env.example`):

```bash
# Database
DB_HOST=localhost
DB_PORT=27017
DB_USERNAME=pokemon
DB_PASSWORD=password
DB_DATABASE=pokemon_tcg

# Cron
CRON_SCHEDULE="0 */6 * * *"  # Every 6 hours
SYNC_ON_STARTUP=false         # Run on startup

# App
PORT=3000
NODE_ENV=production
```

## Future Extensions

### Adding Multiple HTTP Endpoints (Recommended Pattern)

When adding multiple routes/endpoints, use the **Route Handler Collection** pattern:

1. **Define a RouteHandler interface:**
   ```typescript
   // src/shared/controllers/domain/RouteHandler.ts
   export interface RouteHandler {
     register(app: Hono): void;
   }
   ```

2. **Create individual route handlers:**
   ```typescript
   // src/cards/infrastructure/http/CardsRoutes.ts
   export class CardsRoutes implements RouteHandler {
     static create(context: ResolutionContext) {
       const syncCards = context.get<SyncCards>(SyncCards);
       return new CardsRoutes(syncCards);
     }

     constructor(private readonly syncCards: SyncCards) {}

     register(app: Hono): void {
       app.post('/api/cards/sync', async (c) => {
         await this.syncCards.execute();
         return c.json({ success: true });
       });
     }
   }
   ```

3. **Bind with TOKEN for collection:**
   ```typescript
   // container.ts
   container.bind<RouteHandler>(Token.ROUTE_HANDLER).toDynamicValue(CardsRoutes.create);
   container.bind<RouteHandler>(Token.ROUTE_HANDLER).toDynamicValue(HealthRoutes.create);
   // Add more as needed...
   ```

4. **Collect and register in Hono factory:**
   ```typescript
   // createHono.ts
   export function createHono(context: ResolutionContext) {
     const app = new Hono();
     const handlers = context.getAll<RouteHandler>(Token.ROUTE_HANDLER);
     handlers.forEach(handler => handler.register(app));
     return app;
   }
   ```

**Benefits:**
- ✅ Each route handler is independently testable
- ✅ Routes automatically discovered via DI
- ✅ No manual route registration in createHono
- ✅ Routes can inject their own dependencies

### Adding a new scraper

1. Create provider in `src/cards/infrastructure/providers/`
2. Implement `CardsProvider` interface
3. Bind in `container.ts` (use Token for multiple providers)
4. Update scheduler to handle multiple providers

### Switching to different logger

1. Create new implementation: `src/shared/loggers/infrastructure/WinstonLogger.ts`
2. Update binding in `container.ts`:
   ```typescript
   container.bind<Logger>(Token.LOGGER).toDynamicValue(WinstonLogger.create);
   ```
3. No changes needed in use cases!

## Injection Strategy Decision Guide

Use this guide to decide between class-based and token-based injection:

| Scenario | Strategy | Example |
|----------|----------|---------|
| **Unique service, single instance** | Class-based | `container.bind(SyncCards).to...` |
| **Cross-cutting concern** | Token-based | `Token.LOGGER`, `Token.SCHEDULER` |
| **Multiple implementations** | Token-based | `Token.ROUTE_HANDLER` (array) |
| **Need to swap implementations** | Token-based | `Token.CARDS_PROVIDER` |
| **Infrastructure module** | Token-based | `Token.DB_CONFIG`, `MongoClient` |
| **Domain use case (1:1 with class)** | Class-based | `SyncCards`, `GetCardById` |

**Current project uses:**
- **Token-based**: Logger, Scheduler, Database, Providers, Repositories
- **Class-based**: SyncCards use case

**Recommendation for endpoints:** Use **Token-based with `Token.ROUTE_HANDLER`** and `getAll()` pattern for automatic discovery and registration.

## Why This Architecture?

1. **Testable** - Easy to mock dependencies with test doubles
2. **Maintainable** - Clear separation of concerns (domain/use-cases/infrastructure)
3. **Scalable** - Add domains without touching existing code
4. **Flexible** - Swap implementations (DB, logger, scraper) easily via DI
5. **Type-safe** - Full TypeScript coverage with strict mode
6. **No decorators** - Explicit dependencies, no magic, easier to debug
7. **Framework agnostic** - Business logic has zero framework dependencies
