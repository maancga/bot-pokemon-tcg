import { config } from "../../../config/infrastructure/config.ts";
import type { Logger } from "../domain/Logger.ts";

export class ConsoleLogger implements Logger {
  static create() {
    return new ConsoleLogger();
  }

  info(message: string, ...args: unknown[]): void {
    console.log(`ℹ️  ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`❌ ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`⚠️  ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (config.app.nodeEnv !== "production") {
      console.debug(`🔍 ${message}`, ...args);
    }
  }
}
