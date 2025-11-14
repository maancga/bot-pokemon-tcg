import type { Hono } from "hono";
import { container } from "./container.ts";
import { Token } from "./shared/config/domain/Token.ts";

export const app = await container.getAsync<Hono>(Token.APP);
