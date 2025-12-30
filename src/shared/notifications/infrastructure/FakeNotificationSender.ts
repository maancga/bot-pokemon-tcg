import type {
  CardData,
  NotificationSender,
} from "../domain/NotificationSender.ts";

interface CardSyncCall {
  cards: CardData[];
  storeName: string;
}

export class FakeNotificationSender implements NotificationSender {
  private cardSyncCalls: CardSyncCall[] = [];

  async sendCardSync(cards: CardData[], storeName: string): Promise<void> {
    this.cardSyncCalls.push({ cards, storeName });
  }

  getCardSyncCalls(): CardSyncCall[] {
    return this.cardSyncCalls;
  }

  wasCardSyncCalledWith(storeName: string, cardCount: number): boolean {
    return this.cardSyncCalls.some(
      (call) => call.storeName === storeName && call.cards.length === cardCount
    );
  }

  getLastCardSyncCall(): CardSyncCall | undefined {
    return this.cardSyncCalls[this.cardSyncCalls.length - 1];
  }

  reset(): void {
    this.cardSyncCalls = [];
  }
}
