import { Card } from "./Card";

export interface CardsRepository {
  save(cards: Card[]): Promise<void>;
}
