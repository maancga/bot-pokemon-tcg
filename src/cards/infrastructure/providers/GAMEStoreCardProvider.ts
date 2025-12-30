import puppeteer from "puppeteer";
import type { Card } from "../../domain/Card.ts";
import type { CardsProvider } from "../../domain/CardsProvider.ts";

export class GAMEStoreCardsProvider implements CardsProvider {
  static async create() {
    return new GAMEStoreCardsProvider();
  }
  private readonly url = "https://www.game.es/buscar/pokemon%20tcg";

  async getData(): Promise<Card[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Reduces shared memory usage
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-default-apps",
        "--disable-sync",
        "--disable-translate",
        "--disable-features=site-per-process",
        "--metrics-recording-only",
        "--mute-audio",
        "--no-first-run",
        "--safebrowsing-disable-auto-update",
        "--disable-blink-features=AutomationControlled",
        "--single-process", // Run in single process to reduce memory overhead
      ],
    });

    try {
      const page = await browser.newPage();

      // Block unnecessary resources to save memory
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const resourceType = req.resourceType();
        // Only allow documents and scripts, block images, fonts, etc.
        if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      await page.goto(this.url, {
        waitUntil: "domcontentloaded", // Changed from networkidle2 to reduce wait time
        timeout: 20000, // Reduced timeout
      });

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Reduced wait time

      const cards = await page.evaluate(() => {
        const results: Array<{
          id: string;
          title: string;
          price: string;
          link: string;
          imageUrl: string;
        }> = [];

        const selectors = [
          "article",
          '[class*="product"]',
          '[class*="item"]',
          'li[class*="product"]',
          'div[class*="product"]',
          ".search-results article",
          ".results article",
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);

          elements.forEach((element: Element) => {
            const titleEl = element.querySelector(
              'a[title], h3, h2, h4, .title, [class*="title"]'
            );
            const title =
              titleEl?.textContent?.trim() ||
              titleEl?.getAttribute("title") ||
              "";

            const priceEl = element.querySelector(
              '[class*="price"], .price, span'
            );
            const price = priceEl?.textContent?.trim() || "";

            const linkEl = element.querySelector("a[href]");
            const link = linkEl?.getAttribute("href") || "";

            const imgEl = element.querySelector("img");
            const imageUrl =
              imgEl?.getAttribute("src") ||
              imgEl?.getAttribute("data-src") ||
              imgEl?.getAttribute("data-lazy-src") ||
              "";

            if (title && title.length > 3) {
              results.push({
                id: title,
                title,
                price,
                link: link.startsWith("http")
                  ? link
                  : `https://www.game.es${link}`,
                imageUrl: imageUrl.startsWith("http")
                  ? imageUrl
                  : imageUrl
                  ? `https://www.game.es${imageUrl}`
                  : "",
              });
            }
          });

          if (results.length > 0) {
            break;
          }
        }

        return results;
      });

      const now = new Date();
      const fullCards: Card[] = cards
        .filter((card) => card.price === "MERCHANDISING")
        .map((card) => ({
          ...card,
          source: "gamestore",
          lastScrapedAt: now,
          createdAt: now,
        }));

      return fullCards;
    } finally {
      await browser.close();
    }
  }
}
