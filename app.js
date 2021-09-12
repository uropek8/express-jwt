require("dotenv").config();

const express = require("express");
const jwtMiddleware = require("express-jwt");
const cors = require("cors");
const db = require("./connection/mongo");

const config = require("./config");

// const usersModule = require("./modules/users");
const authModule = require("./modules/auth");

const createApp = () => {
  const app = express();
  const router = express.Router();

  router.get("/", (req, res) => {
    res.body = "Response is ok";
    res.send(res.body);
  });

  router.use(authModule);
  // router.use("/users", usersModule);

  app.use(router);
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.query());
  // app.use(
  //   jwtMiddleware({ secret: config.jwt.secretAccess, algorithms: ["sha1", "RS256", "HS256"] })
  // );
  app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
      res.status(401).json({ error: err.name + ": " + err.message });
    }
  });

  return app;
};

if (!module.parent) {
  createApp().listen(config.server.port, () => {
    console.log(`Server listening at http://localhost:${config.server.port}`);
  });
  // console.log(config.db.url, config.db.name, config.db.options, config.db.reconnectDelay);
  db.initialize(config.db.url, config.db.name, config.db.options, config.db.reconnectDelay);
}

module.exports = createApp;
