import { ContainerModule, type interfaces } from "inversify";
import { Db, MongoClient } from "mongodb";
import { Token } from "../config/domain/Token.ts";
import {
  config,
  type DatabaseConfig,
} from "../config/infrastructure/config.ts";

export async function createMongoClient({ container }: interfaces.Context) {
  const { username, password, host, port } = container.get<DatabaseConfig>(
    Token.DB_CONFIG
  );
  return new MongoClient(`mongodb://${username}:${password}@${host}:${port}`);
}

export async function createDb({ container }: interfaces.Context) {
  const client = await container.getAsync(MongoClient);
  const { database } = container.get<DatabaseConfig>(Token.DB_CONFIG);
  return client.db(database);
}

export const mongoModule = new ContainerModule((bind) => {
  bind(MongoClient).toDynamicValue(createMongoClient);
  bind(Db).toDynamicValue(createDb);
  bind(Token.DB_CONFIG).toConstantValue(config.db);
});
