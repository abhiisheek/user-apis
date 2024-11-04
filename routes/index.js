const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

mongoose
  .connect(
    `mongodb+srv://${process.env.username}:${process.env.password}@sandbox.vaxh3kz.mongodb.net/e-comm?retryWrites=true&w=majority`
  )
  .then(() => console.log("Connected!"))
  .catch((e) => console.error("Failed to connect to DB...", e));


router.get("/", function (req, res, next) {
  res.send("User Microservice running....");
});

module.exports = router;
