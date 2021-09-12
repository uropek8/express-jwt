const request = require("supertest");

const createApp = require("../app");
const db = require("../connection/mongo");
const config = require("../config");
const issueToken = require("./helpers/issueToken");
const UserServise = require("../services/user");
const TokenServise = require("../services/token");

const app = createApp();

beforeAll(async () => {
  await db.initialize(config.db.url, config.db.name, config.db.options);
});

afterAll(async () => {
  await db.close(true);
});

test("User can correct registrated", async () => {
  const userService = new UserServise();
  const userData = {
    email: "email_new",
    password: "password_new",
  };
  const response = await request(app).post("/sign_up").send(userData);

  expect(response.status).toBe(200);
  expect(response.body.message === "User was created!").toBeTruthy();

  await userService.remove({ email: userData.email });
});

test("User can correct logined", async () => {
  const userData = {
    email: "email",
    password: "password",
  };
  const response = await request(app).post("/login").query(userData);

  expect(response.status).toBe(200);
  expect(typeof response.body.access_token === "string").toBeTruthy();
  expect(typeof response.body.refresh_token === "string").toBeTruthy();

  const refreshTokenResponse = await request(app)
    .post("/refresh")
    .set("Authorization", `Bearer ${response.body.refresh_token}`);

  expect(refreshTokenResponse.status).toBe(200);
  expect(typeof refreshTokenResponse.body.access_token === "string").toBeTruthy();
  expect(typeof refreshTokenResponse.body.refresh_token === "string").toBeTruthy();
});

test("User get 401 error on expired token", async () => {
  const expiredToken = issueToken({ id: 1 }, { expiresIn: "1ms" });
  const response = await request(app).get("/me2").set("Authorization", `Bearer ${expiredToken}`);

  expect(response.status).toBe(401);
});

test("User can update access token using refresh token", async () => {
  const userService = new UserServise();
  const tokenService = new TokenServise();

  const dbUser = await userService.find({ email: "email" });
  const dbToken = await tokenService.find({ userId: dbUser._id.toString() });
  const response = await request(app)
    .post("/refresh")
    .set("Authorization", `Bearer ${dbToken.token}`);

  expect(response.status).toBe(200);
  expect(typeof response.body.access_token === "string").toBeTruthy();
  expect(typeof response.body.refresh_token === "string").toBeTruthy();
});

test("User get 404 on invalid refresh token", async () => {
  const refreshToken = "INVALID_TOKEN";
  const response = await request(app)
    .post("/refresh")
    .set("Authorization", `Bearer ${refreshToken}`);

  expect(response.status).toBe(404);
});
