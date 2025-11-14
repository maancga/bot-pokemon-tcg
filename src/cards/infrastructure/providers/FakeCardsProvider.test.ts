import { describe, expect, it } from "vitest";
import { CardFixtures } from "@tests/helpers/fixtures/CardFixtures.ts";
import { FakeCardsProvider } from "./FakeCardsProvider.ts";

describe("FakeCardsProvider", () => {
  it("should return default cards", async () => {
    const provider = new FakeCardsProvider();

    const cards = await provider.getData();

    expect(cards.length).toBe(3);
    expect(cards[0].title).toContain("Charizard");
  });

  it("should return custom cards when provided", async () => {
    const customCards = CardFixtures.largeSet();
    const provider = new FakeCardsProvider(customCards);

    const cards = await provider.getData();

    expect(cards).toEqual(customCards);
  });

  it("should allow updating cards", async () => {
    const provider = new FakeCardsProvider();
    const newCards = CardFixtures.largeSet();

    provider.setCards(newCards);
    const cards = await provider.getData();

    expect(cards).toEqual(newCards);
  });

  it("should throw error when configured to fail", async () => {
    const provider = new FakeCardsProvider([], true);

    await expect(provider.getData()).rejects.toThrow(
      "Fake provider configured to fail"
    );
  });

  it("should allow toggling failure state", async () => {
    const provider = new FakeCardsProvider();

    provider.setShouldFail(true);

    await expect(provider.getData()).rejects.toThrow();

    provider.setShouldFail(false);
    const cards = await provider.getData();

    expect(cards).toBeDefined();
  });

  it("should return a copy of cards (not reference)", async () => {
    const provider = new FakeCardsProvider();

    const cards1 = await provider.getData();
    const cards2 = await provider.getData();

    expect(cards1).toEqual(cards2);
    expect(cards1).not.toBe(cards2);
  });
});
