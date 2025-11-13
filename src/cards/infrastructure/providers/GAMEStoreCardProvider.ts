import puppeteer from "puppeteer";
import { Card } from "../../domain/Card";
import { CardsProvider } from "../../domain/CardsProvider";

export class GAMEStoreCardsProvider implements CardsProvider {
  private readonly url = "https://www.game.es/buscar/pokemon%20tcg";

  async getData(): Promise<Card[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      await page.goto(this.url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));

      const cards = await page.evaluate(() => {
        const results: Card[] = [];

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

      return cards.filter((card) => card.price === "MERCHANDISING");
    } finally {
      await browser.close();
    }
  }
}
