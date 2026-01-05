import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      
      console.log("REGISTER CT:", req.headers["content-type"]);
      console.log("REGISTER BODY:", req.body);

      const parsedData = CreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const newUser = await userService.createUser(parsedData.data);

      return res.status(201).json({
        success: true,
        message: "User Created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      
      console.log("LOGIN CT:", req.headers["content-type"]);
      console.log("LOGIN BODY:", req.body);

      const parsedData = LoginUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const { token, user } = await userService.loginUser(parsedData.data);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}