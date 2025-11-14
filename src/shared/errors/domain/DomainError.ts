import type { DomainErrorCode } from "./DomainErrorCode.ts";

export class DomainError extends Error {
  public readonly code: DomainErrorCode;
  constructor(message: string, code: DomainErrorCode) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
