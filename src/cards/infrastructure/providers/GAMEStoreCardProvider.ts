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
        "--disable-dev-shm-usage",
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
        waitUntil: "networkidle2",
        timeout: 25000,
      });

      // Wait for products to load (they load dynamically via JavaScript)
      await page.waitForSelector(".search-item", { timeout: 15000 }).catch(() => {
        console.log("[Scraper] Warning: .search-item selector not found, page might not have loaded properly");
      });

      // Additional wait for dynamic content to fully render
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const cards = await page.evaluate(() => {
        const results: Array<{
          id: string;
          title: string;
          price: string;
          link: string;
          imageUrl: string;
        }> = [];

        // Use the correct selector for GAME.es search results
        const items = document.querySelectorAll(".search-item");

        items.forEach((item: Element) => {
          // Try to get data from data attributes first (most reliable)
          const linkEl = item.querySelector("a[data-list-item-click]");
          const dataPrice = linkEl?.getAttribute("data-list-item-price");
          const dataName = linkEl?.getAttribute("data-list-item-name");
          const dataId = linkEl?.getAttribute("data-list-item-click");

          // Fallback to DOM elements
          const titleEl = item.querySelector("h3.title a, .title a");
          const title = dataName || titleEl?.textContent?.trim() || "";

          // Get price from data attribute or parse from DOM
          let price = "";
          if (dataPrice) {
            price = `${dataPrice} €`;
          } else {
            const priceEl = item.querySelector(".prices-wrap, .price");
            const priceText = priceEl?.textContent?.trim() || "";
            // Extract price pattern like "199'99€" or "31,99 €"
            const priceMatch = priceText.match(/(\d+)[',](\d{2})\s*€/);
            if (priceMatch) {
              price = `${priceMatch[1]}.${priceMatch[2]} €`;
            }
          }

          // Get link
          const href = linkEl?.getAttribute("href") || titleEl?.getAttribute("href") || "";
          const link = href.startsWith("http")
            ? href
            : href.startsWith("//")
            ? `https:${href}`
            : href
            ? `https://www.game.es${href}`
            : "";

          // Get image
          const imgEl = item.querySelector("img");
          let imageUrl =
            imgEl?.getAttribute("src") ||
            imgEl?.getAttribute("data-src") ||
            imgEl?.getAttribute("data-lazy-src") ||
            "";

          if (imageUrl) {
            if (imageUrl.startsWith("//")) {
              imageUrl = `https:${imageUrl}`;
            } else if (!imageUrl.startsWith("http")) {
              imageUrl = `https://www.game.es${imageUrl}`;
            }
            if (imageUrl.includes("no_disponible.png")) {
              imageUrl = "";
            }
          }

          // Only add valid products with actual product links
          if (title && title.length > 3 && link.includes("/coleccionables/")) {
            results.push({
              id: dataId || title,
              title,
              price,
              link,
              imageUrl,
            });
          }
        });

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
