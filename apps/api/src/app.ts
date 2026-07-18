import express from "express";
import cors from "cors";

import { resolveAppOrigins } from "./config/app-origins.js";
import { apiRouter } from "./routes/index.js";
import { privateApiCacheHeaders } from "./middlewares/cache-control.js";
import { errorHandler } from "./middlewares/error-handler.js";

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = new Set(resolveAppOrigins());

      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", privateApiCacheHeaders, apiRouter);
app.use(errorHandler);
