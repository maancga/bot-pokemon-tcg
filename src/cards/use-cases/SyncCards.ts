import { Card } from "../domain/Card.ts";
import { CardsProvider } from "../domain/CardsProvider.ts";

export class SyncCards {
  constructor(private readonly cardProvider: CardsProvider) {}

  async execute(): Promise<Card[]> {
    const fetchedCards = await this.cardProvider.getData();

    return fetchedCards;
  }
}
