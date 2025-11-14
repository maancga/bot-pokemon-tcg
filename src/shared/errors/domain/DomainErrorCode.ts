export const DomainErrorCode = {
  INVALID_CONFIGURATION: "INVALID_CONFIGURATION",
} as const;

export type DomainErrorCode =
  (typeof DomainErrorCode)[keyof typeof DomainErrorCode];
