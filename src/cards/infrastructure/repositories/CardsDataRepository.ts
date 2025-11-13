import type { Collection, Db } from "mongodb";
import type { Card } from "../../domain/Card";
import { CardsRepository } from "../../domain/CardsDataRepository";

export class MongoCardsRepository implements CardsRepository {
  private readonly collection: Collection<Card>;

  constructor(db: Db) {
    this.collection = db.collection("cards");
  }

  async save(cards: Card[]): Promise<void> {
    if (!cards?.length) return;

    const ops = cards.map((card) => {
      return {
        updateOne: {
          filter: { id: card.id },
          update: { $set: card },
          upsert: true,
        },
      };
    });

    await this.collection.bulkWrite(ops, { ordered: false });
  }
}
