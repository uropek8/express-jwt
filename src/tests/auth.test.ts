import request from "supertest";
import { Server } from "../app";
import { Database } from "../connection/mongo";
import { config } from "../config";
import { issueToken } from "./helpers/issueToken";
import { UserService } from "../services/user";
import { TokenService } from "../services/token";

let userService: UserService;
let tokenService: TokenService;
let server: Server;

beforeAll(async () => {
  server = new Server();
  
  await Database.initialize(config.db.url, config.db.name, config.db.options);
  
  userService = new UserService();
  tokenService = new TokenService();
});

afterAll(async () => {
  await Database.close(true);
});

test("User can correct registrated", async () => {
  const userData = {
    email: "email_new",
    password: "password_new",
  };
  const response = await request(server.app).post("/sign_up").send(userData);

  expect(response.status).toBe(200);
  expect(response.body.message === "User was created!").toBeTruthy();

  await userService.remove({ email: userData.email });
});

test("User can correct logined", async () => {
  const userData = {
    email: "email",
    password: "password",
  };
  const response = await request(server.app).post("/login").query(userData);

  expect(response.status).toBe(200);
  expect(typeof response.body.body.access_token === "string").toBeTruthy();
  expect(typeof response.body.body.refresh_token === "string").toBeTruthy();

  const refreshTokenResponse = await request(server.app)
    .post("/refresh")
    .set("Authorization", `Bearer ${response.body.body.refresh_token}`);

  expect(refreshTokenResponse.status).toBe(200);
  expect(typeof refreshTokenResponse.body.body.access_token === "string").toBeTruthy();
  expect(typeof refreshTokenResponse.body.body.refresh_token === "string").toBeTruthy();
});

test("User get 401 error on expired token", async () => {
  const expiredToken = issueToken({ id: 1 }, { expiresIn: "1ms" });
  const response = await request(server.app)
    .get("/me2")
    .set("Authorization", `Bearer ${expiredToken}`);

  expect(response.status).toBe(401);
});

test("User can update access token using refresh token", async () => {
  const dbUser = await userService.find({ email: "email" });
  const dbToken = await tokenService.find({ userId: dbUser?._id.toString() });
  const response = await request(server.app)
    .post("/refresh")
    .set("Authorization", `Bearer ${dbToken?.token}`);

  expect(response.status).toBe(200);
  expect(typeof response.body.body.access_token === "string").toBeTruthy();
  expect(typeof response.body.body.refresh_token === "string").toBeTruthy();
});

test("User get 404 on invalid refresh token", async () => {
  const refreshToken = "INVALID_TOKEN";
  const response = await request(server.app)
    .post("/refresh")
    .set("Authorization", `Bearer ${refreshToken}`);

  expect(response.status).toBe(404);
});
