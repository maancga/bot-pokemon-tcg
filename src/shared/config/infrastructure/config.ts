import { z } from "zod";
import { ConfigurationError } from "../../errors/domain/ConfigurationError.ts";

// Zod schemas for runtime validation
const databaseConfigSchema = z.object({
  host: z.string().min(1, "Database host is required"),
  port: z.number().int().positive("Database port must be a positive integer"),
  username: z.string().min(1, "Database username is required"),
  password: z.string().min(1, "Database password is required"),
  database: z.string().min(1, "Database name is required"),
});

const appConfigSchema = z.object({
  port: z
    .number()
    .int()
    .positive("Port must be a positive integer")
    .max(65535, "Port must be less than 65535"),
  nodeEnv: z.enum(["development", "production", "test"], {
    errorMap: () => ({
      message: "NODE_ENV must be one of: development, production, test",
    }),
  }),
});

const schedulerConfigSchema = z.object({
  cronSchedule: z
    .string()
    .min(1, "Cron schedule is required")
    .regex(/^[^\s]+(\s+[^\s]+){4}$/, "Invalid cron schedule format"),
  syncOnStartup: z.boolean(),
});

const configSchema = z.object({
  app: appConfigSchema,
  db: databaseConfigSchema,
  scheduler: schedulerConfigSchema,
});

// TypeScript types inferred from schemas
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;
export type AppConfig = z.infer<typeof appConfigSchema>;
export type SchedulerConfig = z.infer<typeof schedulerConfigSchema>;
export type Config = z.infer<typeof configSchema>;

/**
 * Load and validate configuration from environment variables
 * Throws ConfigurationError if validation fails
 */
function loadConfig(): Config {
  const rawConfig = {
    app: {
      port: Number.parseInt(process.env.PORT || "3000", 10),
      nodeEnv: process.env.NODE_ENV || "development",
    },
    db: {
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "27017", 10),
      username: process.env.DB_USERNAME || "pokemon",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_DATABASE || "pokemon_tcg",
    },
    scheduler: {
      cronSchedule: process.env.CRON_SCHEDULE || "0 */6 * * *",
      syncOnStartup: process.env.SYNC_ON_STARTUP === "true",
    },
  };

  const result = configSchema.safeParse(rawConfig);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");

    throw new ConfigurationError(`Configuration validation failed: ${errors}`);
  }

  return result.data;
}

export const config: Config = loadConfig();
