import { Db, MongoClient } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CardFixtures } from "../../../test-helpers/fixtures/CardFixtures.ts";
import {
  setupTestDb,
  teardownTestDb,
} from "../../../test-helpers/mongoTestHelpers.ts";
import { Card } from "../../domain/Card";
import { MongoCardsRepository } from "./CardsDataRepository";

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
    expect(saved.some((c) => c.id === CardFixtures.bulbasaurEx().id)).toBe(true);

    // Actualizar una carta existente
    const updatedCharizard = {
      ...CardFixtures.charizardEx(),
      price: "PREMIUM",
    };
    await repo.save([updatedCharizard]);

    const updated = await db
      .collection<Card>("cards")
      .findOne({ id: CardFixtures.charizardEx().id });
    expect(updated?.price).toBe("PREMIUM");
  });

  it("no falla si recibe una lista vacía", async () => {
    await expect(repo.save([])).resolves.not.toThrow();
  });
});
