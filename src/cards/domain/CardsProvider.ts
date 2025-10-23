import { Card } from "./Card.ts";

export interface CardsProvider {
  getData(): Promise<Card[]>;
}
