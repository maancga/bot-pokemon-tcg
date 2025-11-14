import type { Logger } from "../domain/Logger.ts";

export class FakeLogger implements Logger {
  logs: string[] = [];

  info(message: string, ...args: unknown[]): void {
    this.logs.push(`[INFO] ${message} ${args.join(" ")}`);
  }

  error(message: string, ...args: unknown[]): void {
    this.logs.push(`[ERROR] ${message} ${args.join(" ")}`);
  }

  warn(message: string, ...args: unknown[]): void {
    this.logs.push(`[WARN] ${message} ${args.join(" ")}`);
  }

  debug(message: string, ...args: unknown[]): void {
    this.logs.push(`[DEBUG] ${message} ${args.join(" ")}`);
  }

  clear(): void {
    this.logs = [];
  }
}
