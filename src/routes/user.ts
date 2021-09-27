import { Router } from "express";
import { UserController } from "../controllers/user";

export class UserRoutes {
  router: Router;

  public userController: UserController = new UserController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.post("/sign_up", this.userController.register);
    this.router.post("/login", this.userController.login);
    this.router.post("/refresh", this.userController.refresh);
    this.router.get("/me[0-9]", this.userController.me);
  }
}
