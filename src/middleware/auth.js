const jwt = require("jsonwebtoken");

const secret = require("../utils/secret");
const User = require("../models/user");
const { default: logger } = require("../utils/logger");

module.exports = (req, res, next) => {
  const authorization = req.get("Authorization");

  if (!authorization) {
    res.status(401).send("Unauthorized - Authorization header is missing");
  }

  const token = authorization.startsWith("Bearer ") && authorization.slice(7);

  if (token) {
    try {
      const data = jwt.verify(token, secret.key);

      const user = User.findOne({ email: data.data.email }).lean();

      if (!user) {
        res.status(401).send(`Unauthorized`);
        return;
      }

      next();
    } catch (err) {
      logger.error("Token verification failed", err);
      res.status(401).send(`Unauthorized - ${err.name}`);
    }
  } else {
    res.status(401).send("Unauthorized - auth token is missing");
  }
};
