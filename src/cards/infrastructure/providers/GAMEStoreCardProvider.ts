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
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-default-apps",
        "--disable-sync",
        "--disable-translate",
        "--metrics-recording-only",
        "--mute-audio",
        "--no-first-run",
        "--safebrowsing-disable-auto-update",
      ],
    });

    try {
      const page = await browser.newPage();

      // Block heavy resources to save memory, but keep CSS for proper rendering
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const resourceType = req.resourceType();
        // Block images, fonts, and media, but allow stylesheets
        if (["image", "font", "media"].includes(resourceType)) {
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
            let imageUrl =
              imgEl?.getAttribute("data-src") ||
              imgEl?.getAttribute("src") ||
              imgEl?.getAttribute("data-lazy-src") ||
              "";

            // Normalize image URL
            if (imageUrl) {
              if (imageUrl.startsWith("//")) {
                imageUrl = `https:${imageUrl}`;
              } else if (!imageUrl.startsWith("http")) {
                imageUrl = `https://www.game.es${imageUrl}`;
              }
              // Skip error placeholder images
              if (imageUrl.includes("no_disponible.png")) {
                imageUrl = "";
              }
            }

            if (title && title.length > 3) {
              results.push({
                id: title,
                title,
                price,
                link: link.startsWith("http")
                  ? link
                  : link.startsWith("//")
                  ? `https:${link}`
                  : `https://www.game.es${link}`,
                imageUrl,
              });
            }
          });

          if (results.length > 0) {
            break;
          }
        }

        return results;
      });

      console.log(`[Scraper] Raw cards found: ${cards.length}`);

      const now = new Date();
      const fullCards: Card[] = cards.map((card) => ({
        ...card,
        source: "gamestore",
        lastScrapedAt: now,
        createdAt: now,
      }));

      console.log(`[Scraper] Cards to save: ${fullCards.length}`);
      return fullCards;
    } finally {
      await browser.close();
    }
  }
}
