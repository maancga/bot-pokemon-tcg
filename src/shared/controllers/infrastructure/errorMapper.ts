import {
  DomainErrorCode,
  type DomainErrorCode as DomainErrorCodeType,
} from "../../errors/domain/DomainErrorCode.ts";

/**
 * Maps domain error codes to HTTP status codes
 * This provides a clean separation between domain and HTTP concerns
 *
 * Add mappings here as new error codes are added to the codebase
 */
export const domainErrorToHttpStatus: Record<DomainErrorCodeType, number> = {
  // Configuration errors -> 500 Internal Server Error
  [DomainErrorCode.INVALID_CONFIGURATION]: 500,
};

/**
 * Get HTTP status code for a domain error code
 * Returns 500 if mapping not found (safe default)
 */
export function getHttpStatusForDomainError(
  code: DomainErrorCodeType
): number {
  return domainErrorToHttpStatus[code] ?? 500;
}
