import { Hono } from "hono";
import { cors } from "hono/cors";

import { resolveAppOrigins } from "./config/app-origins.js";
import { privateApiCacheHeaders } from "./middlewares/cache-control.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { apiRouter } from "./routes/index.js";
import type { AppEnv } from "./types/hono.js";

export const app = new Hono<AppEnv>();

app.use(
  "*",
  cors({
    // Origins are resolved per request so APP_ORIGIN changes take effect
    // without a restart, matching the previous Express behaviour.
    origin: (origin) => {
      if (!origin) {
        return origin;
      }

      return resolveAppOrigins().includes(origin) ? origin : null;
    },
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.use("/api/*", privateApiCacheHeaders);
app.route("/api", apiRouter);

app.onError(errorHandler);
