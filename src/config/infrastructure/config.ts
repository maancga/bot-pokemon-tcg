export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
}

export interface SchedulerConfig {
  cronSchedule: string;
  syncOnStartup: boolean;
}

export interface Config {
  app: AppConfig;
  db: DatabaseConfig;
  scheduler: SchedulerConfig;
}

export const config: Config = {
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
