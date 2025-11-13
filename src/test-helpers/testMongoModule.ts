import { ContainerModule } from "inversify";
import { Db, MongoClient } from "mongodb";
import { Token } from "../config/domain/Token.ts";
import { createDb, createMongoClient } from "../di/mongoModule.ts";
import { testMongoConfig } from "./testMongoConfig.ts";

export const testMongoModule = new ContainerModule((bind) => {
  bind(MongoClient).toDynamicValue(createMongoClient);
  bind(Db).toDynamicValue(createDb);
  bind(Token.DB_CONFIG).toConstantValue(testMongoConfig);
});
