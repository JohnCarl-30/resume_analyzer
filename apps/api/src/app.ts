import express from "express";
import cors from "cors";

import { resolveAppOrigins } from "./config/app-origins.js";
import { apiRouter } from "./routes/index.js";
import { privateApiCacheHeaders } from "./middlewares/cache-control.js";
import { errorHandler } from "./middlewares/error-handler.js";

export const app = express();

const allowedOrigins = new Set(resolveAppOrigins());

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
