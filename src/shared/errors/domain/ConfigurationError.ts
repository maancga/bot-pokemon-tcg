import { DomainError } from "./DomainError.ts";
import { DomainErrorCode } from "./DomainErrorCode.ts";

export class ConfigurationError extends DomainError {
  constructor(message: string) {
    super(message, DomainErrorCode.INVALID_CONFIGURATION);
    this.name = "ConfigurationError";
  }
}
