import express from "express";
import mongoose from "mongoose";

import logger from "../utils/logger.js";

const router = express.Router();

mongoose
  .connect(
    `mongodb+srv://${process.env.username}:${process.env.password}@sandbox.vaxh3kz.mongodb.net/e-comm?retryWrites=true&w=majority`
  )
  .then(() => logger.info("Connected!"))
  .catch((e) => logger.info("Failed to connect to DB...", e));

router.get("/", (req, res) => {
  res.send("User Microservice running....");

  logger.info("Testing logger", req);
});

router.get("/health", (req, res) => {
  res.send("Ok");

  logger.info("Testing logger", req);
});

export default router;
