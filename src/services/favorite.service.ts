import { FavoriteRepository } from "../repositories/favorite.repository";
import { RecipeRepository } from "../repositories/recipe.repository";
import { HttpError } from "../errors/http-error";

const favoriteRepository = new FavoriteRepository();
const recipeRepository = new RecipeRepository();

export class FavoriteService {
  async addFavorite(userId: string, recipeId: string) {
    // Check if recipe exists
    const recipe = await recipeRepository.getRecipeById(recipeId);
    if (!recipe) {
      throw new HttpError(404, "Recipe not found");
    }

    // Check if already favorited
    const isAlreadyFavorited = await favoriteRepository.isFavorited(userId, recipeId);
    if (isAlreadyFavorited) {
      throw new HttpError(400, "Recipe is already in favorites");
    }

    await favoriteRepository.addFavorite(userId, recipeId);
  }

  async removeFavorite(userId: string, recipeId: string) {
    // Check if recipe exists
    const recipe = await recipeRepository.getRecipeById(recipeId);
    if (!recipe) {
      throw new HttpError(404, "Recipe not found");
    }

    // Check if it was favorited
    const isFavorited = await favoriteRepository.isFavorited(userId, recipeId);
    if (!isFavorited) {
      throw new HttpError(400, "Recipe is not in favorites");
    }

    await favoriteRepository.removeFavorite(userId, recipeId);
  }

  async getFavorites(userId: string) {
    return favoriteRepository.getFavoritesByUser(userId);
  }

  async isFavorited(userId: string, recipeId: string): Promise<boolean> {
    return favoriteRepository.isFavorited(userId, recipeId);
  }
}
