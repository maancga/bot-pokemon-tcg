import { ContainerModule, type ResolutionContext } from "inversify";
import { Db, MongoClient } from "mongodb";
import { Token } from "../../config/domain/Token.ts";
import {
  config,
  type DatabaseConfig,
} from "../../config/infrastructure/config.ts";

export async function createMongoClient(context: ResolutionContext) {
  const dbConfig = context.get<DatabaseConfig>(Token.DB_CONFIG);

  // Use MONGODB_URI if available (for MongoDB Atlas), otherwise build from individual fields
  const connectionString = dbConfig.uri
    ? dbConfig.uri
    : `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}`;

  return new MongoClient(connectionString);
}

export async function createDb(context: ResolutionContext) {
  const client = await context.getAsync(MongoClient);
  const dbConfig = context.get<DatabaseConfig>(Token.DB_CONFIG);

  // Extract database name from URI if using MongoDB Atlas, otherwise use database field
  let databaseName: string;
  if (dbConfig.uri) {
    // Extract database name from URI (mongodb+srv://user:pass@host/DATABASE?options)
    const match = dbConfig.uri.match(/\/([^/?]+)(\?|$)/);
    databaseName = match ? match[1] : "pokemon_tcg";
  } else {
    databaseName = dbConfig.database || "pokemon_tcg";
  }

  return client.db(databaseName);
}

export const mongoModule = new ContainerModule(({ bind }) => {
  bind(Token.DB_CONFIG).toConstantValue(config.db);
  bind(MongoClient).toDynamicValue(createMongoClient);
  bind(Db).toDynamicValue(createDb);
});
