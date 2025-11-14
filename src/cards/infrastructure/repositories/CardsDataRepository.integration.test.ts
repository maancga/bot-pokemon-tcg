import { Db, MongoClient } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CardFixtures } from "../../../test-helpers/fixtures/CardFixtures.ts";
import {
  setupTestDb,
  teardownTestDb,
} from "../../../test-helpers/mongoTestHelpers.ts";
import type { Card } from "../../domain/Card.ts";
import { MongoCardsRepository } from "./CardsDataRepository.ts";

describe("MongoCardsRepository (integration)", () => {
  let client: MongoClient;
  let db: Db;
  let repo: MongoCardsRepository;

  beforeAll(async () => {
    ({ client, db } = await setupTestDb());
    repo = new MongoCardsRepository(db);
  });

  afterAll(async () => {
    await teardownTestDb(client, db);
  });

  it("guarda nuevas cartas y las actualiza si ya existen", async () => {
    const cards: Card[] = [
      CardFixtures.bulbasaurEx(),
      CardFixtures.charizardEx(),
    ];

    await repo.save(cards);

    const saved = await db.collection<Card>("cards").find().toArray();
    expect(saved.length).toBe(2);
    expect(
      saved.some(
        (c) =>
          c.source === CardFixtures.bulbasaurEx().source &&
          c.link === CardFixtures.bulbasaurEx().link
      )
    ).toBe(true);

    // Actualizar una carta existente (misma source + link)
    const updatedCharizard = {
      ...CardFixtures.charizardEx(),
      price: "PREMIUM",
    };
    await repo.save([updatedCharizard]);

    const updated = await db
      .collection<Card>("cards")
      .findOne({
        source: CardFixtures.charizardEx().source,
        link: CardFixtures.charizardEx().link,
      });
    expect(updated?.price).toBe("PREMIUM");
  });

  it("no falla si recibe una lista vacía", async () => {
    await expect(repo.save([])).resolves.not.toThrow();
  });

  it("actualiza lastScrapedAt en cada guardado", async () => {
    const card = CardFixtures.bulbasaurEx();
    await repo.save([card]);

    const firstSave = await db
      .collection<Card>("cards")
      .findOne({ source: card.source, link: card.link });
    const firstScrapedAt = firstSave?.lastScrapedAt;

    // Wait a bit to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 10));

    await repo.save([card]);

    const secondSave = await db
      .collection<Card>("cards")
      .findOne({ source: card.source, link: card.link });
    const secondScrapedAt = secondSave?.lastScrapedAt;

    expect(firstScrapedAt).toBeDefined();
    expect(secondScrapedAt).toBeDefined();
    expect(secondScrapedAt!.getTime()).toBeGreaterThan(
      firstScrapedAt!.getTime()
    );
  });

  it("mantiene createdAt sin cambios en actualizaciones posteriores", async () => {
    const card = CardFixtures.bulbasaurEx();
    await repo.save([card]);

    const firstSave = await db
      .collection<Card>("cards")
      .findOne({ source: card.source, link: card.link });
    const originalCreatedAt = firstSave?.createdAt;

    // Wait and save again
    await new Promise((resolve) => setTimeout(resolve, 10));
    await repo.save([card]);

    const secondSave = await db
      .collection<Card>("cards")
      .findOne({ source: card.source, link: card.link });

    expect(originalCreatedAt).toBeDefined();
    expect(secondSave?.createdAt).toEqual(originalCreatedAt);
  });

  it("deduplica por source y link, no por id", async () => {
    const card1 = CardFixtures.bulbasaurEx();
    const card2 = {
      ...CardFixtures.bulbasaurEx(),
      id: "different-id", // Different ID, same source+link
      price: "UPDATED_PRICE",
    };

    await repo.save([card1]);
    await repo.save([card2]);

    // Query specifically for cards with this source+link
    const saved = await db
      .collection<Card>("cards")
      .find({ source: card1.source, link: card1.link })
      .toArray();
    // Should only have 1 card since source+link are the same
    expect(saved.length).toBe(1);
    // Should have the updated price from card2
    expect(saved[0].price).toBe("UPDATED_PRICE");
  });
});
