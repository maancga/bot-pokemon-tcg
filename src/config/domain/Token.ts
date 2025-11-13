export const Token = {
  // Database
  DB_CONFIG: Symbol.for("DB_CONFIG"),
  MONGO_CLIENT: Symbol.for("MONGO_CLIENT"),
  MONGO_DB: Symbol.for("MONGO_DB"),

  // Repositories
  CARDS_REPOSITORY: Symbol.for("CARDS_REPOSITORY"),

  // Providers
  CARDS_PROVIDER: Symbol.for("CARDS_PROVIDER"),

  // Use Cases
  SYNC_CARDS_USE_CASE: Symbol.for("SYNC_CARDS_USE_CASE"),
} as const;

export type TokenType = (typeof Token)[keyof typeof Token];
