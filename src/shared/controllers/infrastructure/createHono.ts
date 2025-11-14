import { Hono } from "hono";
import type { ResolutionContext } from "inversify";
import { Token } from "../../config/domain/Token.ts";
import type { Logger } from "../../loggers/domain/Logger.ts";
import { createErrorMiddleware } from "./errorMiddleware.ts";

export function createHono(context: ResolutionContext) {
  const app = new Hono();
  const logger = context.get<Logger>(Token.LOGGER);

  // Global error handling middleware
  app.use("*", createErrorMiddleware(logger));

  // Health check endpoint
  app.get("/health", (c) => {
    return c.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  app.get("/", (c) => {
    return c.json({
      message: "Pokemon TCG Card Scraper Bot",
      version: "0.1.0",
      endpoints: {
        health: "/health",
      },
    });
  });

  return app;
}
