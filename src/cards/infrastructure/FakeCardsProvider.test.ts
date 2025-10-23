import { describe, expect, it } from "vitest";
import { Card } from "../domain/Card.ts";
import { FakeCardsProvider } from "./FakeCardsProvider.ts";

describe("FakeCardsProvider", () => {
  it("should return default cards", async () => {
    const provider = new FakeCardsProvider();

    const cards = await provider.getData();

    expect(cards.length).toBe(3);
    expect(cards[0].title).toContain("Charizard");
  });

  it("should return custom cards when provided", async () => {
    const customCards: Card[] = [
      {
        title: "Test Card",
        price: "MERCHANDISING",
        link: "https://test.com",
        imageUrl: "https://test.com/image.png",
      },
    ];
    const provider = new FakeCardsProvider(customCards);

    const cards = await provider.getData();

    expect(cards).toEqual(customCards);
  });

  it("should allow updating cards", async () => {
    const provider = new FakeCardsProvider();
    const newCards: Card[] = [
      {
        title: "Updated Card",
        price: "MERCHANDISING",
        link: "https://updated.com",
        imageUrl: "https://updated.com/image.png",
      },
    ];

    provider.setCards(newCards);
    const cards = await provider.getData();

    expect(cards).toEqual(newCards);
  });

  it("should throw error when configured to fail", async () => {
    // Arrange
    const provider = new FakeCardsProvider([], true);

    // Act & Assert
    await expect(provider.getData()).rejects.toThrow(
      "Fake provider configured to fail"
    );
  });

  it("should allow toggling failure state", async () => {
    // Arrange
    const provider = new FakeCardsProvider();

    // Act - enable failure
    provider.setShouldFail(true);

    // Assert - should fail
    await expect(provider.getData()).rejects.toThrow();

    // Act - disable failure
    provider.setShouldFail(false);
    const cards = await provider.getData();

    // Assert - should succeed
    expect(cards).toBeDefined();
  });

  it("should return a copy of cards (not reference)", async () => {
    // Arrange
    const provider = new FakeCardsProvider();

    // Act
    const cards1 = await provider.getData();
    const cards2 = await provider.getData();

    // Assert
    expect(cards1).toEqual(cards2);
    expect(cards1).not.toBe(cards2); // Different instances
  });
});
