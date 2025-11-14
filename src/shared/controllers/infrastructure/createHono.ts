import { Hono } from "hono";

export function createHono() {
  const app = new Hono();

  // Health check endpoint
  app.get("/health", (c) => {
    return c.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  app.get("/", (c) => {
    return c.json({
      message: "Pokemon TCG Card Scraper Bot",
      version: "1.0.0",
      endpoints: {
        health: "/health",
      },
    });
  });

  return app;
}
