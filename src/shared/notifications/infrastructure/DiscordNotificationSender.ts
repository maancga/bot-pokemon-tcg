import type {
  CardData,
  NotificationSender,
} from "../domain/NotificationSender.ts";

export class DiscordNotificationSender implements NotificationSender {
  private readonly webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  static create(webhookUrl: string): DiscordNotificationSender {
    return new DiscordNotificationSender(webhookUrl);
  }

  private async send(message: string): Promise<void> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          username: "Pokemon TCG Bot",
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Discord webhook failed: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Failed to send Discord notification:", error);
    }
  }

  async sendCardSync(cards: CardData[], storeName: string): Promise<void> {
    await this.send(
      `✅ Sync completed: ${cards.length} cards from ${storeName}`
    );

    const CARDS_CHUNK_SIZE = 10;
    const cardChunks: CardData[][] = [];

    for (
      let chunkIndex = 0;
      chunkIndex < cards.length;
      chunkIndex += CARDS_CHUNK_SIZE
    ) {
      cardChunks.push(cards.slice(chunkIndex, chunkIndex + CARDS_CHUNK_SIZE));
    }

    for (let chunkIndex = 0; chunkIndex < cardChunks.length; chunkIndex++) {
      const chunk = cardChunks[chunkIndex];
      const message = this.formatCardsChunk(
        chunk,
        chunkIndex + 1,
        cardChunks.length
      );
      await this.send(message);

      // Discord rate limit: ~30 requests/minute
      // Wait 2 seconds between messages to stay under the limit
      if (chunkIndex < cardChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  private formatCardsChunk(
    cards: CardData[],
    chunkNumber: number,
    totalChunks: number
  ): string {
    const header = `📦 Cards ${chunkNumber}/${totalChunks}:\n\n`;
    const cardList = cards
      .map((card) => `**${card.title}** - ${card.price}\n${card.link}`)
      .join("\n\n");

    return header + cardList;
  }
}
