import type { Card } from "../../../src/cards/domain/Card.ts";

/**
 * Card Mother pattern - provides reusable test card instances
 * Use these fixtures in tests to avoid duplication and ensure consistency
 */
export class CardFixtures {
  /**
   * Bulbasaur EX - Common test card
   */
  static bulbasaurEx(): Card {
    return {
      id: "game-bulbasaur-ex-001",
      source: "gamestore",
      title: "Caja Colección Pokemon TCG Bulbasaur EX (Castellano)",
      price: "MERCHANDISING",
      link: "https://www.game.es/COLECCIONABLES/BARAJA-POKÉMON/MERCHANDISING/BULBASAUR-EX/001",
      imageUrl: "https://media.game.es/COVERV2/3D_L/001/001.png",
      lastScrapedAt: new Date("2025-01-15T10:00:00Z"),
      createdAt: new Date("2025-01-15T10:00:00Z"),
    };
  }

  /**
   * Charizard EX - Premium test card
   */
  static charizardEx(): Card {
    return {
      id: "game-charizard-ex-241281",
      source: "gamestore",
      title: "Caja Colección Especial Pokemon TCG Charizard Ex (Castellano)",
      price: "MERCHANDISING",
      link: "https://www.game.es/COLECCIONABLES/BARAJA-POKÉMON/MERCHANDISING/CAJA-COLECCION-ESPECIAL-POKEMON-TCG-CHARIZARD-EX-CASTELLANO/241281",
      imageUrl: "https://media.game.es/COVERV2/3D_L/241/241281.png",
      lastScrapedAt: new Date("2025-01-15T10:00:00Z"),
      createdAt: new Date("2025-01-15T10:00:00Z"),
    };
  }

  /**
   * Pikachu VMAX - Popular test card
   */
  static pikachuVmax(): Card {
    return {
      id: "game-pikachu-vmax-002",
      source: "gamestore",
      title: "Caja Colección Pokemon TCG Pikachu VMAX (Inglés)",
      price: "MERCHANDISING",
      link: "https://www.game.es/COLECCIONABLES/CARTAS-POKÉMON/MERCHANDISING/PIKACHU-VMAX/002",
      imageUrl: "https://media.game.es/COVERV2/3D_L/002/002.png",
      lastScrapedAt: new Date("2025-01-15T10:00:00Z"),
      createdAt: new Date("2025-01-15T10:00:00Z"),
    };
  }

  /**
   * Mewtwo EX - Legendary test card
   */
  static mewtwoEx(): Card {
    return {
      id: "game-mewtwo-ex-241878",
      source: "gamestore",
      title: "Caja EX Pokemon TCG: Mewtwo del Team Rocket",
      price: "MERCHANDISING",
      link: "https://www.game.es/COLECCIONABLES/BARAJA-POKÉMON/MERCHANDISING/CAJA-EX-POKEMON-TCG-MEWTWO-DEL-TEAM-ROCKET/241878",
      imageUrl: "https://media.game.es/COVERV2/3D_L/241/241878.png",
      lastScrapedAt: new Date("2025-01-15T10:00:00Z"),
      createdAt: new Date("2025-01-15T10:00:00Z"),
    };
  }

  /**
   * Zacian de Paul - Battle deck test card
   */
  static zacianDePaul(): Card {
    return {
      id: "game-zacian-v1ib5c",
      source: "gamestore",
      title: "Caja Coleccion EX Pokemon TCG Zacian de Paul (Castellano)",
      price: "MERCHANDISING",
      link: "https://www.game.es/COLECCIONABLES/BARAJA-POKÉMON/MERCHANDISING/CAJA-COLECCION-EX-POKEMON-TCG-ZACIAN-DE-PAUL-CASTELLANO/V1IB5C",
      imageUrl: "https://media.game.es/COVERV2/3D_L/V1I/V1IB5C.png",
      lastScrapedAt: new Date("2025-01-15T10:00:00Z"),
      createdAt: new Date("2025-01-15T10:00:00Z"),
    };
  }

  /**
   * Garchomp de Cintia - Premium collection test card
   */
  static garchompDeCintia(): Card {
    return {
      id: "game-garchomp-241879",
      source: "gamestore",
      title: "Caja Colección Premium EX Pokemon TCG: Garchomp de Cintia",
      price: "MERCHANDISING",
      link: "https://www.game.es/COLECCIONABLES/BARAJA-POKÉMON/MERCHANDISING/CAJA-COLECCION-PREMIUM-EX-POKEMON-TCG-GARCHOMP-DE-CINTIA/241879",
      imageUrl: "https://media.game.es/COVERV2/3D_L/241/241879.png",
      lastScrapedAt: new Date("2025-01-15T10:00:00Z"),
      createdAt: new Date("2025-01-15T10:00:00Z"),
    };
  }

  /**
   * Get a default set of cards for testing (3 cards)
   */
  static defaultSet(): Card[] {
    return [this.bulbasaurEx(), this.charizardEx(), this.pikachuVmax()];
  }

  /**
   * Get a large set of cards for testing (6 cards)
   */
  static largeSet(): Card[] {
    return [
      this.bulbasaurEx(),
      this.charizardEx(),
      this.pikachuVmax(),
      this.mewtwoEx(),
      this.zacianDePaul(),
      this.garchompDeCintia(),
    ];
  }

  /**
   * Create a custom card with overrides
   */
  static custom(overrides: Partial<Card> = {}): Card {
    return {
      id: "custom-card-001",
      source: "gamestore",
      title: "Custom Test Card",
      price: "MERCHANDISING",
      link: "https://example.com/custom",
      imageUrl: "https://example.com/custom.png",
      lastScrapedAt: new Date("2025-01-15T10:00:00Z"),
      createdAt: new Date("2025-01-15T10:00:00Z"),
      ...overrides,
    };
  }

  /**
   * Create multiple custom cards
   */
  static customSet(count: number, baseOverrides: Partial<Card> = {}): Card[] {
    return Array.from({ length: count }, (_, i) =>
      this.custom({
        id: `custom-card-${String(i + 1).padStart(3, "0")}`,
        title: `Custom Test Card ${i + 1}`,
        ...baseOverrides,
      })
    );
  }
}
