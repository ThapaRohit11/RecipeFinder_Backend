import { Response } from "express";
import mongoose from "mongoose";
import { UserService } from "../services/user.service";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/user.dto";
import { AuthRequest } from "../middlewares/auth.middleware";

const userService = new UserService();

export class AdminController {
  // POST /api/admin/users - Create a new user with optional image
  async createUser(req: AuthRequest, res: Response) {
    try {
      const parsedData = AdminCreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
      const newUser = await userService.adminCreateUser(parsedData.data, imagePath);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // GET /api/admin/users - Get all users
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const users = await userService.getAllUsers();

      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
        count: users.length,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // GET /api/admin/users/:id - Get a specific user by ID
  async getUserById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }
      
      const user = await userService.getUserById(id);

      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // PUT /api/admin/users/:id - Update a user with optional image
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }
      
      const parsedData = AdminUpdateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
      const updatedUser = await userService.adminUpdateUser(id, parsedData.data, imagePath);

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // DELETE /api/admin/users/:id - Delete a user
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }
      
      const result = await userService.deleteUser(id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
