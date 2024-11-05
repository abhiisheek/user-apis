import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// import logger from "../utils/logger.js";
import User from "../models/user.js";
import secret from "../utils/secret.js";
import { errorHandler } from "../utils/index.js";

const signup = async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  if (!email || !name || !password) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  User.find({ email })
    .exec()
    .then(
      async (docs) => {
        if (docs?.length) {
          errorHandler(
            res,
            { message: "User already exists. Please try loging in" },
            400
          );
        } else {
          const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            name,
            email,
            password,
            preferences: {},
          });

          await newUser.save();

          const token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
              data: { name: newUser.name, email: newUser.email },
            },
            secret.key
          );

          res.send(token);
        }
      },
      (err) => {
        errorHandler(res, err);
      }
    );
};

const login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    errorHandler(res, { message: "Bad Request - Payload not matching" }, 400);
    return;
  }

  User.find({ email, password })
    .select("name email")
    .exec()
    .then(
      (docs) => {
        if (!docs?.length) {
          res.status(400).send("Login Failed!");
          errorHandler(res, { message: "Login Failed!" }, 400);
        } else {
          const token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
              data: docs[0],
            },
            secret.key
          );

          res.send(token);
        }
      },
      (err) => {
        errorHandler(res, err);
      }
    );
};

const resetPassword = async (req, res) => {
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const authorization = req.get("Authorization");

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  if (!newPassword || !oldPassword) {
    errorHandler(
      res,
      { message: "Bad Request - Payload not matching" },
      400
    );
    return;
  }

  try {
    const data = jwt.verify(token, secret.key);

    const details = await User.findOne({
      email: data.data.email,
      password: oldPassword,
    }).lean();

    if (!details) {
      errorHandler(
        res,
        { message: "User details not matching" },
        400
      );
      return;
    }

    await User.findOneAndUpdate(
      { email: data.data.email },
      {
        password: newPassword,
      },
      {
        new: true,
      }
    );

    res.send("Success");
  } catch (err) {
    errorHandler(res, err);
  }
};

export default {
  signup,
  login,
  resetPassword,
};
