import type { interfaces } from "inversify";
import { Db } from "mongodb";
import type { Collection } from "mongodb";
import type { Card } from "../../domain/Card.ts";
import type { CardsRepository } from "../../domain/CardsDataRepository.ts";

export class MongoCardsRepository implements CardsRepository {
  private readonly collection: Collection<Card>;

  static async create({ container }: interfaces.Context) {
    const db = await container.getAsync<Db>(Db);
    return new MongoCardsRepository(db);
  }

  constructor(db: Db) {
    this.collection = db.collection("cards");
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    await this.collection.createIndex(
      { source: 1, link: 1 },
      { unique: true }
    );
  }

  async save(cards: Card[]): Promise<void> {
    if (!cards?.length) return;

    const now = new Date();
    const ops = cards.map((card) => {
      // Exclude createdAt and lastScrapedAt from the spread to avoid conflicts
      const { createdAt, lastScrapedAt, ...cardData } = card;

      return {
        updateOne: {
          filter: { source: card.source, link: card.link },
          update: {
            $set: {
              ...cardData,
              lastScrapedAt: now,
            },
            $setOnInsert: {
              createdAt: now,
            },
          },
          upsert: true,
        },
      };
    });

    await this.collection.bulkWrite(ops, { ordered: false });
  }
}
