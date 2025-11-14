import { serve } from "@hono/node-server";
import { app } from "./app.ts";
import { container } from "./container.ts";
import { Token } from "./shared/config/domain/Token.ts";
import { config } from "./shared/config/infrastructure/config.ts";
import type { Logger } from "./shared/loggers/domain/Logger.ts";
import type { Scheduler } from "./shared/schedulers/domain/Scheduler.ts";

const logger = container.get<Logger>(Token.LOGGER);
const scheduler = await container.getAsync<Scheduler>(Token.SCHEDULER);

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
