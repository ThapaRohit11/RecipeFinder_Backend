import { Request, Response } from "express";
import { CreateRecipeDTO, UpdateRecipeDTO } from "../dtos/recipe.dto";
import { AuthRequest } from "../middlewares/auth.middleware";
import { RecipeService } from "../services/recipe.service";

const recipeService = new RecipeService();

const getAuthorName = (author: { firstName?: string; lastName?: string; username?: string }) => {
  const fullName = `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim();
  return fullName || author.username || "Unknown";
};

const toRecipeResponse = (recipe: any) => {
  const author = recipe.createdBy || {};

  return {
    id: recipe._id.toString(),
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.image,
    authorName: getAuthorName(author),
    authorUsername: author.username || "unknown",
    authorEmail: author.email || "",
    createdAt: recipe.createdAt,
  };
};

export class RecipeController {
  async createRecipe(req: AuthRequest, res: Response) {
    try {
      const parsed = CreateRecipeDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsed.error,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Recipe image is required",
        });
      }

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const imagePath = `/uploads/recipe/${req.file.filename}`;
      const recipe = await recipeService.createRecipe(parsed.data, imagePath, req.user.id);

      return res.status(201).json({
        success: true,
        message: "Recipe created successfully",
        data: recipe ? toRecipeResponse(recipe) : null,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllRecipes(req: Request, res: Response) {
    try {
      const recipes = await recipeService.getAllRecipes();

      return res.status(200).json({
        success: true,
        data: recipes.map((recipe) => toRecipeResponse(recipe)),
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getRecipeById(req: Request, res: Response) {
    try {
      const recipe = await recipeService.getRecipeById(req.params.id);

      return res.status(200).json({
        success: true,
        data: toRecipeResponse(recipe),
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMyRecipes(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const recipes = await recipeService.getRecipesByUser(req.user.id);

      return res.status(200).json({
        success: true,
        data: recipes.map((recipe) => toRecipeResponse(recipe)),
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateRecipe(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = UpdateRecipeDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsed.error,
        });
      }

      if (!parsed.data.title && !parsed.data.description) {
        return res.status(400).json({
          success: false,
          message: "At least one field is required",
        });
      }

      const updatedRecipe = await recipeService.updateRecipe(req.params.id, req.user.id, parsed.data);

      return res.status(200).json({
        success: true,
        message: "Recipe updated successfully",
        data: toRecipeResponse(updatedRecipe),
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteRecipe(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const result = await recipeService.deleteRecipe(req.params.id, req.user.id);

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
