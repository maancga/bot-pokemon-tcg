import type { Card } from "./Card.ts";

export interface CardsRepository {
  save(cards: Card[]): Promise<void>;
}
