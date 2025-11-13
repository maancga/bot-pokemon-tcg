# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a backend bot project built with Node.js v24+ and TypeScript that monitors Pokemon TCG card sales across various websites and notifies subscribed users when updates are detected. The application uses scheduled cron jobs to scrape websites, stores data in MongoDB, and provides a minimal API for user subscription management.

## Key Technologies

- **node-cron**: Schedule periodic scraping jobs
- **Hono**: Lightweight web framework for subscription API endpoints
- **Inversify**: Dependency injection container
- **Zod**: Schema validation for API requests
- **MongoDB**: Database for storing card data, sales information, and user subscriptions

## Common Commands

### Development
- `npm run dev` - Start development server with hot reload (watches src/main.ts using tsx)
- `npm start` - Run application with Node 24's native TypeScript support (no build step needed)

### Testing
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:e2e` - Run end-to-end tests only
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Linting
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Fix auto-fixable linting errors

## Project Structure

- **src/main.ts** - Application entrypoint (starts cron jobs and API server)
- **src/scrapers/** - Web scraping logic for different card sale websites
- **src/cron/** - Cron job definitions and scheduling
- **src/api/** - Hono routes for user subscription management
- **src/repositories/** - MongoDB data access layer
- **src/services/** - Business logic (scrapers, notification handlers)
- **tests/** - E2E test files (tests/e2e/)
- **Test files co-located with source**:
  - Unit tests: `*.test.ts` next to implementation files
  - Integration tests: `*.integration.test.ts` next to implementation files

## Architecture Notes

### Dependency Injection with Inversify

- Use explicit token-based injection (no reflect-metadata required)
- Define typed service identifiers/tokens in a centralized location (e.g., `src/di/tokens.ts`)
- Use `@injectable()` decorator on classes
- Register all bindings in a container configuration module
- Inject dependencies using tokens in constructor parameters

### Cron-based Scraping Architecture

- Define cron jobs using node-cron for periodic website checks
- Each scraper runs independently on its own schedule
- Compare scraped data with stored MongoDB data to detect changes
- When changes detected, trigger notification service for subscribed users
- Scrapers should be idempotent and handle failures gracefully

### API Development with Hono

- Minimal API focused on user subscription management
- Define routes for subscribe/unsubscribe operations
- Validate requests using Zod schemas
- Keep API lightweight - main work happens in cron jobs

### Schema Validation with Zod

- Define schemas for API request/response validation
- Validate user subscription data
- Use for scraper data validation and transformation

### MongoDB Integration

- Use the official mongodb driver
- Define repositories for data access layer
- Inject database connections via Inversify
- Handle connection lifecycle properly

#### Database Configuration

- Configuration stored in `src/config/infrastructure/config.ts`
- Environment variables for database connection (see `.env.example`)
- DI tokens defined in `src/config/domain/Token.ts`
- MongoDB module in `src/di/mongoModule.ts` for Inversify binding

#### Testing with MongoDB

- Use `setupTestDb()` and `teardownTestDb()` from `src/test-helpers/mongoTestHelpers.ts`
- Test databases are isolated per pool: `test-${VITEST_POOL_ID}`
- Import `testMongoModule` instead of `mongoModule` in tests
- Run MongoDB via Docker: `docker-compose up -d`

### Test Fixtures and Mother Pattern

- Card fixtures defined in `src/test-helpers/fixtures/CardFixtures.ts`
- Use `CardFixtures.bulbasaurEx()`, `CardFixtures.charizardEx()`, etc. in tests
- Provides reusable, consistent test data across the codebase
- Add new fixtures when new card types are needed for testing
