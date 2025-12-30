import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ResolutionContext } from "inversify";
import { Token } from "../../config/domain/Token.ts";
import type { Logger } from "../../loggers/domain/Logger.ts";
import { createErrorMiddleware } from "./errorMiddleware.ts";

export function createHono(context: ResolutionContext) {
  const app = new Hono();
  const logger = context.get<Logger>(Token.LOGGER);

  // CORS middleware for frontend
  app.use(
    "*",
    cors({
      origin: [
        "https://tcg-radar-frontend.vercel.app",
        "http://localhost:4321",
        "http://localhost:3000",
      ],
      credentials: true,
    })
  );

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
        stats: "/stats",
      },
    });
  });

  // Stats endpoint for frontend
  app.get("/stats", (c) => {
    return c.json({
      stores: {
        total: 1,
        active: [
          {
            id: "gamestore",
            name: "GAME Store",
            url: "https://www.game.es",
            status: "active",
          },
        ],
      },
      integrations: [
        {
          id: "discord",
          name: "Discord",
          status: "active",
          icon: "discord",
        },
        {
          id: "email",
          name: "Email",
          status: "planned",
          icon: "email",
        },
        {
          id: "telegram",
          name: "Telegram",
          status: "planned",
          icon: "telegram",
        },
      ],
    });
  });

  return app;
}
