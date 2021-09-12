const express = require("express");
const { compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtMiddleware = require("express-jwt");
const { v4: uuidv4 } = require("uuid");
const { hashSync } = require("bcryptjs");

const config = require("../config");

const UserServise = require("../services/user");
const TokenService = require("../services/token");

const router = express.Router();

const getRandomExpires = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min) + min);
};

const issueTokenPair = async (userId) => {
  // const newRefreshToken = uuidv4();
  const expiresIn = getRandomExpires(30, 61);
  const tokenService = new TokenService();

  const accessToken = jwt.sign({ id: userId }, config.jwt.secretAccess, {
    expiresIn,
  });
  // const refreshToken = newRefreshToken;
  const userToken = await tokenService.find({ userId });

  if (!userToken) {
    const refreshToken = jwt.sign({ id: userId }, config.jwt.secretRefresh, {
      expiresIn: config.jwt.refreshExp,
    });

    await tokenService.add({
      token: refreshToken,
      userId,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  return {
    access_token: accessToken,
    refresh_token: userToken.token,
  };
};

router.post("/sign_up", express.json(), async (req, res) => {
  const { email, password } = req.body;
  const userService = new UserServise();

  if (await userService.list({ email })) {
    return res.status(409).json({ message: "Email has already been taken!" });
  }

  await userService.add({ email, password: hashSync(password) });

  res.json({ message: "User was created!" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.query;
  const userService = new UserServise();
  const user = await userService.find({ email });

  if (!user || !compareSync(password, user.password)) {
    return res.status(401).send();
  }

  res.body = await issueTokenPair(user._id.toString());

  res.json(res.body);
});

router.post("/refresh", async (req, res) => {
  const refreshToken = req.headers.authorization.split(" ")[1];
  const tokenService = new TokenService();
  const dbToken = await tokenService.find({ token: refreshToken });

  if (!dbToken) {
    return res.status(404).json({ message: "Incorrecrt refresh token!" });
  }

  await tokenService.remove({ token: refreshToken });

  res.body = await issueTokenPair(dbToken.userId);

  res.json(res.body);
});

// router.post(
//   "/logout",
//   async (req, res) => {
//     const { id: userId } = res.state.user;

//     await refreshTokenService.remove({
//       userId,
//     });

//     res.body = { success: true };
//   }
// );

router.get(
  "/me[0-9]",
  jwtMiddleware({ secret: config.jwt.secretAccess, algorithms: ["sha1", "RS256", "HS256"] }),
  async (req, res) => {
    const { url } = req;
    const requestNum = url.replace("/me", "");

    res.json({
      request_num: requestNum,
      data: {
        username: "login из токена пользователя",
      },
    });
  }
);

module.exports = router;
