import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { privateApiCacheHeaders } from "./middlewares/cache-control.js";
import { errorHandler } from "./middlewares/error-handler.js";

export const app = express();

const allowedOrigins = new Set([env.APP_ORIGIN]);

if (env.APP_ORIGIN.startsWith("http://localhost") || env.APP_ORIGIN.startsWith("http://127.0.0.1")) {
  for (const host of ["localhost", "127.0.0.1"]) {
    allowedOrigins.add(`http://${host}:3000`);
    allowedOrigins.add(`http://${host}:3001`);
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", privateApiCacheHeaders, apiRouter);
app.use(errorHandler);
