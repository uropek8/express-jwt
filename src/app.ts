import express from "express";
import cors from "cors";
import jwt from "express-jwt";
import { UserRoutes } from "./routes/user";
import { Database } from "./connection/mongo";
import { config } from "./config";

export class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    // this.mongo();
  }

  public config(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors());
    this.app.use(jwt({ secret: config.jwt.secretAccess, algorithms: ["sha1", "RS256", "HS256"] }).unless({path: ['/sign_up', '/login', '/refresh']}));
  }

  public routes(): void {
    this.app.use(new UserRoutes().router);
  }

  public async mongo() {
    await Database.initialize(config.db.url, config.db.name, config.db.options);
  }

  public start() {
    this.app.listen(config.server.port, () => {
      console.log(`Server listening at http://localhost:${config.server.port}`);
    });
    this.mongo();
  }
}
