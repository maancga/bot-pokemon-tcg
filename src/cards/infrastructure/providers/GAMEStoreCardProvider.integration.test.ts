import { describe, expect, it } from "vitest";
import { GAMEStoreCardsProvider } from "./GAMEStoreCardProvider.ts";

describe("GAMEStoreDataProvider Integration Tests", () => {
  it("should fetch cards from GAME store", async () => {
    const provider = new GAMEStoreCardsProvider();

    const cards = await provider.getData();

    expect(cards).toBeDefined();
    expect(Array.isArray(cards)).toBe(true);
    expect(cards.length).toBeGreaterThan(0);
  }, 10000);
});
