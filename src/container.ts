import type { Hono } from "hono";
import { Container } from "inversify";
import type { CardsRepository } from "./cards/domain/CardsDataRepository.ts";
import type { CardsProvider } from "./cards/domain/CardsProvider.ts";
import { GAMEStoreCardsProvider } from "./cards/infrastructure/providers/GAMEStoreCardProvider.ts";
import { MongoCardsRepository } from "./cards/infrastructure/repositories/CardsDataRepository.ts";
import { SyncCards } from "./cards/use-cases/SyncCards.ts";
import { Token } from "./config/domain/Token.ts";
import { createHono } from "./shared/controllers/infrastructure/createHono.ts";
import type { Logger } from "./shared/loggers/domain/Logger.ts";
import { ConsoleLogger } from "./shared/loggers/infrastructure/ConsoleLogger.ts";
import { mongoModule } from "./shared/persistence/infrastructure/CreateMongoClient.ts";
import type { Scheduler } from "./shared/schedulers/domain/Scheduler.ts";
import { NodeCronScheduler } from "./shared/schedulers/infrastructure/NodeCronScheduler.ts";

// Create and configure container
export const container = new Container();

// App
container.bind<Hono>(Token.APP).toDynamicValue(createHono);
container.bind<Logger>(Token.LOGGER).toDynamicValue(ConsoleLogger.create);
container
  .bind<Scheduler>(Token.SCHEDULER)
  .toDynamicValue((context) => NodeCronScheduler.create(context));

// Load infrastructure modules
container.load(mongoModule);

// Cards - Providers
container
  .bind<CardsProvider>(Token.CARDS_PROVIDER)
  .toDynamicValue(GAMEStoreCardsProvider.create);

// Cards - Repositories
container
  .bind<CardsRepository>(Token.CARDS_REPOSITORY)
  .toDynamicValue((context) => MongoCardsRepository.create(context));

// Cards - Use Cases
container
  .bind<SyncCards>(Token.SYNC_CARDS_USE_CASE)
  .toDynamicValue((context) => SyncCards.create(context));
