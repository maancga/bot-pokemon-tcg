import { Card } from "../../domain/Card";
import { CardsProvider } from "../../domain/CardsProvider";

export class FakeCardsProvider implements CardsProvider {
  private cards: Card[];
  private shouldFail: boolean;

  constructor(cards?: Card[], shouldFail = false) {
    this.shouldFail = shouldFail;
    this.cards = cards || this.getDefaultCards();
  }

  async getData(): Promise<Card[]> {
    if (this.shouldFail) {
      throw new Error("Fake provider configured to fail");
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    return [...this.cards];
  }

  setCards(cards: Card[]): void {
    this.cards = cards;
  }

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  private getDefaultCards(): Card[] {
    const now = new Date("2025-01-15T10:00:00Z");
    return [
      {
        id: "game-charizard-ex-241281",
        source: "gamestore",
        title: "Caja Colección Especial Pokemon TCG Charizard Ex (Castellano)",
        price: "MERCHANDISING",
        link: "https://www.game.es/COLECCIONABLES/BARAJA-POKÉMON/MERCHANDISING/CAJA-COLECCION-ESPECIAL-POKEMON-TCG-CHARIZARD-EX-CASTELLANO/241281",
        imageUrl: "https://media.game.es/COVERV2/3D_L/241/241281.png",
        lastScrapedAt: now,
        createdAt: now,
      },
      {
        id: "game-zacian-v1ib5c",
        source: "gamestore",
        title: "Caja Coleccion EX Pokemon TCG Zacian de Paul (Castellano)",
        price: "MERCHANDISING",
        link: "https://www.game.es/COLECCIONABLES/BARAJA-POKÉMON/MERCHANDISING/CAJA-COLECCION-EX-POKEMON-TCG-ZACIAN-DE-PAUL-CASTELLANO/V1IB5C",
        imageUrl: "https://media.game.es/COVERV2/3D_L/V1I/V1IB5C.png",
        lastScrapedAt: now,
        createdAt: now,
      },
      {
        id: "game-garchomp-241879",
        source: "gamestore",
        title: "Caja Colección Premium EX Pokemon TCG: Garchomp de Cintia",
        price: "MERCHANDISING",
        link: "https://www.game.es/COLECCIONABLES/BARAJA-POKÉMON/MERCHANDISING/CAJA-COLECCION-PREMIUM-EX-POKEMON-TCG-GARCHOMP-DE-CINTIA/241879",
        imageUrl: "https://media.game.es/COVERV2/3D_L/241/241879.png",
        lastScrapedAt: now,
        createdAt: now,
      },
    ];
  }
}
