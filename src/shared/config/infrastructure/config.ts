import { z } from "zod";
import { ConfigurationError } from "../../errors/domain/ConfigurationError.ts";

// Zod schemas for runtime validation
const databaseConfigSchema = z.object({
  uri: z.string().optional(), // MongoDB Atlas connection string (mongodb+srv://...)
  host: z.string().optional(),
  port: z.number().int().positive().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
}).refine(
  (data) => {
    // Either uri must be provided, or all individual fields
    return data.uri || (data.host && data.username && data.password && data.database);
  },
  {
    message: "Either MONGODB_URI or individual DB fields (host, username, password, database) must be provided",
  }
);

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

const notificationConfigSchema = z.object({
  discordWebhookUrl: z.string().url("Discord webhook must be a valid URL"),
});

const configSchema = z.object({
  app: appConfigSchema,
  db: databaseConfigSchema,
  scheduler: schedulerConfigSchema,
  notifications: notificationConfigSchema,
});

// TypeScript types inferred from schemas
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;
export type AppConfig = z.infer<typeof appConfigSchema>;
export type SchedulerConfig = z.infer<typeof schedulerConfigSchema>;
export type NotificationConfig = z.infer<typeof notificationConfigSchema>;
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
      uri: process.env.MONGODB_URI, // MongoDB Atlas connection string
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "27017", 10),
      username: process.env.DB_USERNAME || "pokemon",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_DATABASE || "pokemon_tcg",
    },
    scheduler: {
      cronSchedule: process.env.CRON_SCHEDULE || "*/1 * * * *",
      syncOnStartup: process.env.SYNC_ON_STARTUP || true,
    },
    notifications: {
      discordWebhookUrl:
        process.env.DISCORD_WEBHOOK_URL ||
        "https://discord.com/api/webhooks/1439408027567394880/OlKxRwrVaUJzo2KpffdEkoFtT2zc8M0Y_Giz2Peenk8PS0CkJlnUOIiL1qbE4cEri-gl",
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
