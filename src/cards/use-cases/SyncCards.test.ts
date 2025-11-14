import { beforeEach, describe, expect, it } from "vitest";
import { FakeLogger } from "../../shared/loggers/infrastructure/FakeLogger.ts";
import type { Card } from "../domain/Card.ts";
import { FakeCardsProvider } from "../infrastructure/providers/FakeCardsProvider.ts";
import { FakeCardsRepository } from "../infrastructure/repositories/FakeCardsRepository.ts";
import { SyncCards } from "./SyncCards.ts";

describe("SyncDataUseCase", () => {
  let fakeProvider: FakeCardsProvider;
  let fakeRepository: FakeCardsRepository;
  let fakeLogger: FakeLogger;
  let useCase: SyncCards;

  beforeEach(() => {
    fakeProvider = new FakeCardsProvider();
    fakeRepository = new FakeCardsRepository();
    fakeLogger = new FakeLogger();
    useCase = new SyncCards(fakeProvider, fakeRepository, fakeLogger);
  });

  it("should fetch cards from data provider", async () => {
    const cards = await useCase.execute();

    expect(cards).toBeDefined();
    expect(Array.isArray(cards)).toBe(true);
    expect(cards.length).toBeGreaterThan(0);
  });

  it("should return cards with correct structure", async () => {
    const cards = await useCase.execute();

    const firstCard = cards[0];
    expect(firstCard).toHaveProperty("id");
    expect(firstCard).toHaveProperty("source");
    expect(firstCard).toHaveProperty("title");
    expect(firstCard).toHaveProperty("price");
    expect(firstCard).toHaveProperty("link");
    expect(firstCard).toHaveProperty("imageUrl");
    expect(firstCard).toHaveProperty("lastScrapedAt");
    expect(firstCard).toHaveProperty("createdAt");
  });

  it("should work with custom card data", async () => {
    const customCards: Card[] = [
      {
        id: "custom-001",
        source: "test-store",
        title: "Custom Pokemon Card",
        price: "MERCHANDISING",
        link: "https://example.com/custom",
        imageUrl: "https://example.com/image.png",
        lastScrapedAt: new Date("2025-01-15T10:00:00Z"),
        createdAt: new Date("2025-01-15T10:00:00Z"),
      },
    ];
    fakeProvider.setCards(customCards);

    const cards = await useCase.execute();

    expect(cards).toEqual(customCards);
    expect(cards[0].title).toBe("Custom Pokemon Card");
  });

  it("should handle provider failures", async () => {
    fakeProvider.setShouldFail(true);

    await expect(useCase.execute()).rejects.toThrow(
      "Fake provider configured to fail"
    );
  });

  it("should return empty array when provider has no cards", async () => {
    fakeProvider.setCards([]);

    const cards = await useCase.execute();

    expect(cards).toEqual([]);
  });

  it("should save fetched cards to repository", async () => {
    const cards = await useCase.execute();

    expect(fakeRepository.getSavedCards()).toEqual(cards);
  });

  it("should log progress during execution", async () => {
    await useCase.execute();

    expect(fakeLogger.logs).toContain(
      expect.stringMatching(/Starting card sync/)
    );
    expect(fakeLogger.logs).toContain(
      expect.stringMatching(/Fetched \d+ cards/)
    );
    expect(fakeLogger.logs).toContain(
      expect.stringMatching(/Saving cards to database/)
    );
    expect(fakeLogger.logs).toContain(
      expect.stringMatching(/Cards saved successfully/)
    );
  });
});
