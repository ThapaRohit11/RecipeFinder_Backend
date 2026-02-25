import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { FavoriteService } from "../services/favorite.service";
import { RecipeService } from "../services/recipe.service";

const favoriteService = new FavoriteService();
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

export class FavoriteController {
  async addFavorite(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await favoriteService.addFavorite(req.user.id, req.params.recipeId);

      return res.status(201).json({
        success: true,
        message: "Recipe added to favorites",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async removeFavorite(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await favoriteService.removeFavorite(req.user.id, req.params.recipeId);

      return res.status(200).json({
        success: true,
        message: "Recipe removed from favorites",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getFavorites(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const favorites = await favoriteService.getFavorites(req.user.id);

      const recipes = favorites.map((fav) => {
        if (fav.recipeId && typeof fav.recipeId === "object") {
          return toRecipeResponse(fav.recipeId);
        }
        return null;
      }).filter(Boolean);

      return res.status(200).json({
        success: true,
        data: recipes,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async isFavorited(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const isFavorited = await favoriteService.isFavorited(req.user.id, req.params.recipeId);

      return res.status(200).json({
        success: true,
        data: { isFavorited },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
