import type { ResolutionContext } from "inversify";
import { Token } from "../../shared/config/domain/Token.ts";
import type { Logger } from "../../shared/loggers/domain/Logger.ts";
import type { Card } from "../domain/Card.ts";
import type { CardsRepository } from "../domain/CardsDataRepository.ts";
import type { CardsProvider } from "../domain/CardsProvider.ts";

export class SyncCards {
  private readonly cardProvider: CardsProvider;
  private readonly cardRepository: CardsRepository;
  private readonly logger: Logger;

  static async create(context: ResolutionContext) {
    const provider = await context.getAsync<CardsProvider>(
      Token.CARDS_PROVIDER
    );
    const repository = await context.getAsync<CardsRepository>(
      Token.CARDS_REPOSITORY
    );
    const logger = context.get<Logger>(Token.LOGGER);
    return new SyncCards(provider, repository, logger);
  }

  constructor(
    cardProvider: CardsProvider,
    cardRepository: CardsRepository,
    logger: Logger
  ) {
    this.cardProvider = cardProvider;
    this.cardRepository = cardRepository;
    this.logger = logger;
  }

  async execute(): Promise<Card[]> {
    this.logger.info("Starting card sync...");
    const fetchedCards = await this.cardProvider.getData();
    this.logger.info(`Fetched ${fetchedCards.length} cards`);

    this.logger.info("Saving cards to database...");
    await this.cardRepository.save(fetchedCards);
    this.logger.info("Cards saved successfully");

    return fetchedCards;
  }
}
