import {
  config,
  type DatabaseConfig,
} from "../../src/shared/config/infrastructure/config.ts";

export const testMongoConfig: DatabaseConfig = {
  ...config.db,
  database: `test-${process.env.VITEST_POOL_ID || "0"}`,
};
