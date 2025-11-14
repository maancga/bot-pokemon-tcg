import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { DomainError } from "../../errors/domain/DomainError.ts";
import type { Logger } from "../../loggers/domain/Logger.ts";
import { getHttpStatusForDomainError } from "./errorMapper.ts";

interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

/**
 * Error handling middleware for Hono
 * Maps domain errors to HTTP responses using the error mapper
 */
export function createErrorMiddleware(logger: Logger) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    try {
      await next();
    } catch (err) {
      // Handle different error types
      if (err instanceof DomainError) {
        return handleDomainError(c, err, logger);
      }

      if (err instanceof ZodError) {
        return handleZodError(c, err, logger);
      }

      if (err instanceof HTTPException) {
        return handleHttpException(c, err, logger);
      }

      // Unknown error - treat as internal server error
      return handleUnknownError(c, err, logger);
    }
  };
}

/**
 * Handle domain errors - uses mapper to get HTTP status
 */
function handleDomainError(
  c: Context,
  error: DomainError,
  logger: Logger
): Response {
  // Map domain error code to HTTP status
  const statusCode = getHttpStatusForDomainError(error.code);

  // Log domain errors with their context
  logger.error(`Domain error: ${error.message}`, {
    code: error.code,
    name: error.name,
  });

  const response: ErrorResponse = {
    error: {
      message: error.message,
      code: error.code,
    },
  };

  return c.json(response, statusCode as any);
}

/**
 * Handle Zod validation errors
 */
function handleZodError(c: Context, error: ZodError, logger: Logger): Response {
  logger.warn("Validation error", { issues: error.errors });

  const response: ErrorResponse = {
    error: {
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    },
  };

  return c.json(response, 400);
}

/**
 * Handle Hono's HTTPException
 */
function handleHttpException(
  c: Context,
  error: HTTPException,
  logger: Logger
): Response {
  logger.warn(`HTTP exception: ${error.message}`, {
    status: error.status,
  });

  const response: ErrorResponse = {
    error: {
      message: error.message,
      code: "HTTP_EXCEPTION",
    },
  };

  return c.json(response, error.status);
}

/**
 * Handle unknown/unexpected errors
 */
function handleUnknownError(
  c: Context,
  error: unknown,
  logger: Logger
): Response {
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error("Unknown error occurred", {
    message,
    error,
    stack,
  });

  const response: ErrorResponse = {
    error: {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
  };

  return c.json(response, 500);
}
