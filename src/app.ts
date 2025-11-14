import type { Hono } from "hono";
import { Token } from "./config/domain/Token.ts";
import { container } from "./container.ts";

export const app = await container.getAsync<Hono>(Token.APP);
