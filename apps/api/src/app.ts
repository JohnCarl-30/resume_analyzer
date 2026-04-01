import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middlewares/error-handler.js";

export const app = express();

app.use(
  cors({
    origin: env.APP_ORIGIN,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRouter);
app.use(errorHandler);
