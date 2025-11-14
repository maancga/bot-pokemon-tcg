export const Token = {
  // App
  APP: Symbol.for("APP"),
  LOGGER: Symbol.for("LOGGER"),
  SCHEDULER: Symbol.for("SCHEDULER"),

  // Database
  DB_CONFIG: Symbol.for("DB_CONFIG"),
  MONGO_CLIENT: Symbol.for("MONGO_CLIENT"),
  MONGO_DB: Symbol.for("MONGO_DB"),

  // Repositories
  CARDS_REPOSITORY: Symbol.for("CARDS_REPOSITORY"),

  // Providers
  CARDS_PROVIDER: Symbol.for("CARDS_PROVIDER"),
} as const;

export type TokenType = (typeof Token)[keyof typeof Token];
