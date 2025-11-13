# Pokemon TCG Bot

A backend bot that monitors Pokemon TCG card sales across various websites and notifies subscribed users when updates are detected.

## Prerequisites

- Node.js 24+
- Docker and Docker Compose (for MongoDB)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Copy the example environment file:

```bash
cp .env.example .env
```

### 3. Start MongoDB

```bash
docker-compose up -d
```

This will start a MongoDB instance with:
- Username: `pokemon`
- Password: `password`
- Database: `pokemon_tcg`
- Port: `27017`

### 4. Run the Application

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Testing

Run all tests:
```bash
npm test
```

Run specific test types:
```bash
npm run test:unit           # Unit tests
npm run test:integration    # Integration tests (requires MongoDB)
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Tests with coverage report
```

### Running Integration Tests

Integration tests require MongoDB to be running. Start it with:

```bash
docker-compose up -d
```

Integration tests use isolated test databases per pool for parallel execution.

## Development

### Project Structure

- `src/cards/` - Card domain, providers, and repositories
- `src/config/` - Configuration and DI tokens
- `src/di/` - Dependency injection modules
- `src/test-helpers/` - Test utilities and fixtures
- `tests/e2e/` - End-to-end tests

### Using Test Fixtures

Import card fixtures for consistent test data:

```typescript
import { CardFixtures } from './src/test-helpers/fixtures/CardFixtures.ts';

const bulbasaur = CardFixtures.bulbasaurEx();
const customCard = CardFixtures.custom({ title: 'My Custom Card' });
```

## Architecture

- **Node.js 24** with native TypeScript support (no build step)
- **Inversify** for dependency injection
- **MongoDB** for data persistence
- **Hono** for lightweight API endpoints
- **node-cron** for scheduled scraping jobs
- **Zod** for schema validation

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.
