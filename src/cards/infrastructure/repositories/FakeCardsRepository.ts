import type { Card } from "../../domain/Card.ts";
import type { CardsRepository } from "../../domain/CardsDataRepository.ts";

export class FakeCardsRepository implements CardsRepository {
  private cards: Card[] = [];
  private shouldFail = false;

  async save(cards: Card[]): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Fake repository configured to fail");
    }
    this.cards = cards;
  }

  getSavedCards(): Card[] {
    return this.cards;
  }

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  clear(): void {
    this.cards = [];
  }
}
