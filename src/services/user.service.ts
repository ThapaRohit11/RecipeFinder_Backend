import bcryptjs from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { CreateUserDTO, LoginUserDTO, AdminCreateUserDTO, AdminUpdateUserDTO, UpdateProfileDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { RecipeRepository } from "../repositories/recipe.repository";
import { FavoriteRepository } from "../repositories/favorite.repository";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from "../config";

const userRepository = new UserRepository();
const recipeRepository = new RecipeRepository();
const favoriteRepository = new FavoriteRepository();

export class UserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(409, "Email already in use");
    }

    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(409, "Username already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, BCRYPT_SALT_ROUNDS);
    data.password = hashedPassword;

    const newUser = await userRepository.createUser(data);

    const userObj = (newUser as any).toObject ? (newUser as any).toObject() : newUser;
    delete (userObj as any).password;

    return userObj;
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = {
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    delete (userObj as any).password;

    return { token, user: userObj };
  }

  // Admin methods
  async adminCreateUser(data: AdminCreateUserDTO, imagePath?: string) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(409, "Email already in use");
    }

    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(409, "Username already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, BCRYPT_SALT_ROUNDS);
    
    const userData: any = {
      ...data,
      password: hashedPassword,
    };

    if (imagePath) {
      userData.image = imagePath;
    }

    const newUser = await userRepository.createUser(userData);

    const userObj = (newUser as any).toObject ? (newUser as any).toObject() : newUser;
    delete (userObj as any).password;

    return userObj;
  }

  async getAllUsers() {
    const users = await userRepository.getAllUsers();
    return users.map(user => {
      const userObj = (user as any).toObject ? (user as any).toObject() : user;
      delete (userObj as any).password;
      return userObj;
    });
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    delete (userObj as any).password;

    return userObj;
  }

  async adminUpdateUser(id: string, data: AdminUpdateUserDTO, imagePath?: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (data.email && data.email !== user.email) {
      const emailCheck = await userRepository.getUserByEmail(data.email);
      if (emailCheck) {
        throw new HttpError(409, "Email already in use");
      }
    }

    if (data.username && data.username !== user.username) {
      const usernameCheck = await userRepository.getUserByUsername(data.username);
      if (usernameCheck) {
        throw new HttpError(409, "Username already in use");
      }
    }

    const updateData: any = { ...data };
    if (imagePath) {
      updateData.image = imagePath;
    }

    const updatedUser = await userRepository.updateUser(id, updateData);
    if (!updatedUser) {
      throw new HttpError(404, "User not found");
    }

    const userObj = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
    delete (userObj as any).password;

    return userObj;
  }

  async updateUserProfile(id: string, data: UpdateProfileDTO, imagePath?: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (data.email && data.email !== user.email) {
      const emailCheck = await userRepository.getUserByEmail(data.email);
      if (emailCheck) {
        throw new HttpError(409, "Email already in use");
      }
    }

    if (data.username && data.username !== user.username) {
      const usernameCheck = await userRepository.getUserByUsername(data.username);
      if (usernameCheck) {
        throw new HttpError(409, "Username already in use");
      }
    }

    const updateData: any = { ...data };
    if (imagePath) {
      updateData.image = imagePath;
    }

    const updatedUser = await userRepository.updateUser(id, updateData);
    if (!updatedUser) {
      throw new HttpError(404, "User not found");
    }

    const userObj = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
    delete (userObj as any).password;

    return userObj;
  }

  async deleteUser(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const userRecipeIds = await recipeRepository.getRecipeIdsByUser(id);

    await Promise.all([
      favoriteRepository.removeFavoritesByUser(id),
      favoriteRepository.removeFavoritesByRecipeIds(userRecipeIds),
    ]);

    await recipeRepository.deleteRecipesByUser(id);

    const deleted = await userRepository.deleteUser(id);
    if (!deleted) {
      throw new HttpError(500, "Failed to delete user");
    }

    return { message: "User deleted successfully" };
  }
}
