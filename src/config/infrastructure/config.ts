export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface Config {
  db: DatabaseConfig;
}

export const config: Config = {
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "27017", 10),
    username: process.env.DB_USERNAME || "pokemon",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_DATABASE || "pokemon_tcg",
  },
};
