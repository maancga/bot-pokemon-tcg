import type { Container, interfaces } from "inversify";
import cron from "node-cron";
import { SyncCards } from "../../../cards/use-cases/SyncCards.ts";
import { config } from "../../../config/infrastructure/config.ts";
import { Token } from "../../../config/domain/Token.ts";
import type { Logger } from "../../loggers/domain/Logger.ts";
import type { Scheduler } from "../domain/Scheduler.ts";

export class NodeCronScheduler implements Scheduler {
  private readonly container: Container;
  private readonly logger: Logger;

  static create({ container }: interfaces.Context) {
    const logger = container.get<Logger>(Token.LOGGER);
    return new NodeCronScheduler(container, logger);
  }

  constructor(container: Container, logger: Logger) {
    this.container = container;
    this.logger = logger;
  }

  start(): void {
    this.logger.info(`Scheduling card sync job: ${config.scheduler.cronSchedule}`);

    cron.schedule(config.scheduler.cronSchedule, async () => {
      this.logger.info(`Cron job triggered at ${new Date().toISOString()}`);

      try {
        const syncCardsUseCase = await this.container.getAsync<SyncCards>(
          Token.SYNC_CARDS_USE_CASE
        );
        await syncCardsUseCase.execute();
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
      const syncCardsUseCase = await this.container.getAsync<SyncCards>(
        Token.SYNC_CARDS_USE_CASE
      );
      await syncCardsUseCase.execute();
      this.logger.info("Initial sync completed");
    } catch (error) {
      this.logger.error("Initial sync failed:", error);
    }
  }
}
