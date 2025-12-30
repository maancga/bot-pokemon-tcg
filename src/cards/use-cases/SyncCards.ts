import type { ResolutionContext } from "inversify";
import { Token } from "../../shared/config/domain/Token.ts";
import type { Logger } from "../../shared/loggers/domain/Logger.ts";
import type { NotificationSender } from "../../shared/notifications/domain/NotificationSender.ts";
import type { Card } from "../domain/Card.ts";
import type { CardsRepository } from "../domain/CardsDataRepository.ts";
import type { CardsProvider } from "../domain/CardsProvider.ts";

export class SyncCards {
  private readonly cardProvider: CardsProvider;
  private readonly cardRepository: CardsRepository;
  private readonly logger: Logger;
  private readonly notificationSender: NotificationSender;

  static async create(context: ResolutionContext) {
    const provider = await context.getAsync<CardsProvider>(
      Token.CARDS_PROVIDER
    );
    const repository = await context.getAsync<CardsRepository>(
      Token.CARDS_REPOSITORY
    );
    const logger = context.get<Logger>(Token.LOGGER);
    const notificationSender = context.get<NotificationSender>(
      Token.NOTIFICATION_SENDER
    );
    return new SyncCards(provider, repository, logger, notificationSender);
  }

  constructor(
    cardProvider: CardsProvider,
    cardRepository: CardsRepository,
    logger: Logger,
    notificationSender: NotificationSender
  ) {
    this.cardProvider = cardProvider;
    this.cardRepository = cardRepository;
    this.logger = logger;
    this.notificationSender = notificationSender;
  }

  async execute(): Promise<Card[]> {
    this.logger.info("Starting card sync...");
    const fetchedCards = await this.cardProvider.getData();
    this.logger.info(`Fetched ${fetchedCards.length} cards`);

    this.logger.info("Saving cards to database...");
    await this.cardRepository.save(fetchedCards);
    this.logger.info("Cards saved successfully");

    const cardData = fetchedCards.map((card) => ({
      title: card.title,
      price: card.price,
      link: card.link,
    }));

    await this.notificationSender.sendCardSync(cardData, "GAME store");

    return fetchedCards;
  }
}
