import { Db, MongoClient } from "mongodb";
import { testMongoConfig } from "./testMongoConfig.ts";

export async function setupTestDb(): Promise<{ client: MongoClient; db: Db }> {
  const { username, password, host, port, database } = testMongoConfig;
  const uri = `mongodb://${username}:${password}@${host}:${port}`;

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(database);

  return { client, db };
}

export async function teardownTestDb(
  client: MongoClient,
  db: Db
): Promise<void> {
  await db.dropDatabase();
  await client.close();
}

export async function clearDatabase(db: Db): Promise<void> {
  const collections = await db.listCollections().toArray();
  await Promise.all(
    collections.map((collection) =>
      db.collection(collection.name).deleteMany({})
    )
  );
}
