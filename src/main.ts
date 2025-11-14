import { serve } from "@hono/node-server";
import { app } from "./app.ts";
import { config } from "./config/infrastructure/config.ts";
import { Token } from "./config/domain/Token.ts";
import { container } from "./container.ts";
import type { Logger } from "./shared/loggers/domain/Logger.ts";
import type { Scheduler } from "./shared/schedulers/domain/Scheduler.ts";

const logger = container.get<Logger>(Token.LOGGER);
const scheduler = container.get<Scheduler>(Token.SCHEDULER);

serve(
  {
    fetch: app.fetch,
    port: config.app.port,
  },
  (info) => {
    logger.info(`Server running at http://localhost:${info.port}`);
  }
);

scheduler.start();
await scheduler.runInitialSync();

logger.info("Pokemon TCG Bot fully initialized and running");
