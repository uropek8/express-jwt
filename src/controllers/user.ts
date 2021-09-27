import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { UserService } from "../services/user";
import { TokenService } from "../services/token";
import { config } from "../config";
import UserModel from "../models/user";
import TokenModel from "../models/token";
import { getRandomExpires } from "../helpers/expire";

interface IResponse {
  body: {
    access_token: string;
    refresh_token: string;
  };
  statusCode: number;
}

interface IRequest {
  email: string;
  password: string;
}

export class UserController {
  async register(req: Request<any, any, IRequest, IRequest>, res: Response) {
    const { email, password } = req?.body;
    const userService = new UserService();

    if (await userService.list({ email })) {
      res.status(409).json({ message: "Email has already been taken!" });
    }

    await userService.add({ email, password: bcrypt.hashSync(password) });

    res.json({ message: "User was created!" });
  }

  public async login(req: Request<any, any, IRequest, IRequest>, res: Response) {
    const { email, password } = req?.query;
    const userService = new UserService();
    const tokenService = new TokenService();
    const user = (await userService.find({ email })) as UserModel;

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Incorrect email or password!" });
    }

    const expiresIn: number = getRandomExpires(30, 61);
    const accessToken = jwt.sign({ id: user._id?.toString() }, config.jwt.secretAccess, {
      expiresIn,
    });
    const userToken = (await tokenService.find({
      userId: user._id?.toString(),
    })) as TokenModel;

    let response: IResponse;

    if (!userToken) {
      const refreshToken = jwt.sign({ id: user._id?.toString() }, config.jwt.secretRefresh, {
        expiresIn: config.jwt.refreshExp,
      });

      await tokenService.add({
        token: refreshToken,
        userId: user._id?.toString(),
      });

      response = {
        body: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
        statusCode: 200,
      };
    } else {
      response = {
        body: {
          access_token: accessToken,
          refresh_token: userToken.token,
        },
        statusCode: 200,
      };
    }


    res.json(response);
  }

  public async refresh(req: Request, res: Response) {
    const refreshToken = req?.headers?.authorization?.split(" ")[1];
    const tokenService = new TokenService();
    const dbToken = (await tokenService.find({ token: refreshToken })) as TokenModel;
    
    if (!dbToken) {
      return res.status(404).json({ message: "Incorrecrt refresh token!" });
    }
    
    await tokenService.remove({ token: refreshToken });
    
    const expiresIn: number = getRandomExpires(30, 61);
    const accessToken = jwt.sign({ id: dbToken.userId }, config.jwt.secretAccess, {
      expiresIn,
    });
    const userToken = (await tokenService.find({ userId: dbToken.userId })) as TokenModel;

    let response: IResponse;

    if (!userToken) {
      const refreshToken = jwt.sign({ id: dbToken.userId }, config.jwt.secretRefresh, {
        expiresIn: config.jwt.refreshExp,
      });

      await tokenService.add({
        token: refreshToken,
        userId: dbToken.userId,
      });

      response = {
        body: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
        statusCode: 200,
      };
    } else {
      response = {
        body: {
          access_token: accessToken,
          refresh_token: userToken.token,
        },
        statusCode: 200,
      };
    }

    res.json(response);
  }

  public async me(req: Request, res: Response) {
    const { url } = req;
    const requestNum = url.replace("/me", "");

    res.json({
      request_num: requestNum,
      data: {
        username: "login из токена пользователя",
      },
    });
  }
}
