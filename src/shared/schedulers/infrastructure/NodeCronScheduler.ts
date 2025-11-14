import type { ResolutionContext } from "inversify";
import cron from "node-cron";
import { SyncCards } from "../../../cards/use-cases/SyncCards.ts";
import { Token } from "../../config/domain/Token.ts";
import { config } from "../../config/infrastructure/config.ts";
import type { Logger } from "../../loggers/domain/Logger.ts";
import type { Scheduler } from "../domain/Scheduler.ts";

export class NodeCronScheduler implements Scheduler {
  private readonly syncCardsUseCase: SyncCards;
  private readonly logger: Logger;

  static async create(context: ResolutionContext) {
    const logger = context.get<Logger>(Token.LOGGER);
    const syncCardsUseCase = await context.getAsync<SyncCards>(SyncCards);
    return new NodeCronScheduler(syncCardsUseCase, logger);
  }

  constructor(syncCardsUseCase: SyncCards, logger: Logger) {
    this.syncCardsUseCase = syncCardsUseCase;
    this.logger = logger;
  }

  start(): void {
    this.logger.info(
      `Scheduling card sync job: ${config.scheduler.cronSchedule}`
    );

    cron.schedule(config.scheduler.cronSchedule, async () => {
      this.logger.info(`Cron job triggered at ${new Date().toISOString()}`);

      try {
        await this.syncCardsUseCase.execute();
        this.logger.info("Cron job completed successfully");
      } catch (error) {
        this.logger.error("Cron job failed:", error);
      }
    });

    this.logger.info("Cron job scheduled");
  }

  async runInitialSync(): Promise<void> {
    if (!config.scheduler.syncOnStartup) {
      return;
    }

    this.logger.info("Running initial sync on startup...");

    try {
      await this.syncCardsUseCase.execute();
      this.logger.info("Initial sync completed");
    } catch (error) {
      this.logger.error("Initial sync failed:", error);
    }
  }
}
