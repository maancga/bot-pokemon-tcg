import {
  config,
  type DatabaseConfig,
} from "../config/infrastructure/config.ts";

export const testMongoConfig: DatabaseConfig = {
  ...config.db,
  database: `test-${process.env.VITEST_POOL_ID || "0"}`,
};
