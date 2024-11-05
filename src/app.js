import 'dotenv/config'

import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import compression from "compression";
import xss from "xss-clean";
import sanitizer from "express-html-sanitizer";


import rateLimiter from './middleware/rateLimiter.js';

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/user.js";

const { json, urlencoded } = bodyParser;

const sanitizeConfig = {
  allowedTags: ["b", "i", "em", "strong", "a", "p"],
  allowedAttributes: { a: ["href"] },
};


const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(sanitizer(sanitizeConfig));
app.use(rateLimiter);
app.use(xss());
app.use(compression());
app.options("*", cors());
app.disable("x-powered-by");

app.use("/", indexRouter);
app.use("/user", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
