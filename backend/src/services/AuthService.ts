import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as bcyrpt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { register, login } from "../utils/AuthUtil";
import * as fs from "fs";
import cloudinary from "../config";

const prisma = new PrismaClient();

export default new (class AuthService {
  private readonly AuthRepository = prisma.user;

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body;
      const { error } = register.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      const isMailRegisted = await this.AuthRepository.count({
        where: { email: body.email },
      });
      if (isMailRegisted > 0)
        return res.status(400).json({ message: "Email already registed!" });

      const hashPassword = await bcyrpt.hash(body.password, 10);

      const id = uuidv4();
      const usernameUUIDpart = id.substring(0, 8).replace(/-/g, "");
      const uconvert = `user_${usernameUUIDpart}_${body.fullname.replace(
        /\s/g,
        "_"
      )}`;

      const file =
        "https://res.cloudinary.com/dklgstji2/image/upload/v1715134148/circle/as72cdi1attcqypjrk3l.jpg";
      const result = await cloudinary.uploader.upload(file, {
        folder: "circle",
      });
      const imageURL: string = result.secure_url;

      const Auth = await this.AuthRepository.create({
        data: {
          username: uconvert,
          fullname: body.fullname,
          email: body.email,
          password: hashPassword,
          avatar: imageURL,
          bio: "",
          createdAt: new Date(),
        },
      });

      return res.status(201).json({
        code: 201,
        message: "Register success",
        data: Auth,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body;
      const { value, error } = login.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      const isMailRegisted = await this.AuthRepository.findFirst({
        where: { email: body.email },
      });
      if (!isMailRegisted)
        return res.status(409).json({ message: "Email isn't registed!" });

      const isMatchPassword = await bcyrpt.compare(
        value.password,
        isMailRegisted.password
      );
      if (!isMatchPassword)
        return res.status(409).json({ message: "Incorect password!" });

      const User = {
        id: isMailRegisted.ID,
        password: isMailRegisted.password,
        username: isMailRegisted.username,
        fullname: isMailRegisted.fullname,
        avatar: isMailRegisted.avatar,
        bio: isMailRegisted.bio,
      };

      const token = jwt.sign({ User }, "SECRET_KEY", { expiresIn: 999999 });

      return res.status(200).json({
        code: 200,
        message: "Login success",
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async check(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.AuthRepository.findUnique({
        where: {
          ID: res.locals.loginSession.User.id,
        },
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({
        code: 200,
        message: "User have token",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      res.locals.loginSession.destroy;

      return res.status(200).json({
        code: 200,
        message: "Logout Success",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to logout" });
    }
  }
})();
