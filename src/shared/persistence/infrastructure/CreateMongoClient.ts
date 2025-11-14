import { ContainerModule, type ResolutionContext } from "inversify";
import { Db, MongoClient } from "mongodb";
import { Token } from "../../config/domain/Token.ts";
import {
  config,
  type DatabaseConfig,
} from "../../config/infrastructure/config.ts";

export async function createMongoClient(context: ResolutionContext) {
  const { username, password, host, port } = context.get<DatabaseConfig>(
    Token.DB_CONFIG
  );
  return new MongoClient(`mongodb://${username}:${password}@${host}:${port}`);
}

export async function createDb(context: ResolutionContext) {
  const client = await context.getAsync(MongoClient);
  const { database } = context.get<DatabaseConfig>(Token.DB_CONFIG);
  return client.db(database);
}

export const mongoModule = new ContainerModule(({ bind }) => {
  bind(Token.DB_CONFIG).toConstantValue(config.db);
  bind(MongoClient).toDynamicValue(createMongoClient);
  bind(Db).toDynamicValue(createDb);
});
