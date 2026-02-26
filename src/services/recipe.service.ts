import mongoose from "mongoose";
import { CreateRecipeDTO, UpdateRecipeDTO } from "../dtos/recipe.dto";
import { HttpError } from "../errors/http-error";
import { RecipeRepository } from "../repositories/recipe.repository";

const recipeRepository = new RecipeRepository();

export class RecipeService {
  async createRecipe(data: CreateRecipeDTO, imagePath: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, "Invalid user id");
    }

    const recipe = await recipeRepository.createRecipe({
      title: data.title.trim(),
      description: data.description.trim(),
      image: imagePath,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    return recipeRepository.getRecipeById(recipe._id.toString());
  }

  async getAllRecipes() {
    return recipeRepository.getAllRecipes();
  }

  async getRecipeById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid recipe id");
    }

    const recipe = await recipeRepository.getRecipeById(id);
    if (!recipe) {
      throw new HttpError(404, "Recipe not found");
    }

    return recipe;
  }

  async getRecipesByUser(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, "Invalid user id");
    }

    return recipeRepository.getRecipesByUser(userId);
  }

  async updateRecipe(id: string, userId: string, data: UpdateRecipeDTO, imagePath?: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid recipe id");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, "Invalid user id");
    }

    const recipe = await recipeRepository.getRecipeById(id);
    if (!recipe) {
      throw new HttpError(404, "Recipe not found");
    }

    if (recipe.createdBy._id.toString() !== userId) {
      throw new HttpError(403, "You can only update your own recipe");
    }

    const updateData: UpdateRecipeDTO = {};
    if (data.title) updateData.title = data.title.trim();
    if (data.description) updateData.description = data.description.trim();

    if (imagePath) {
      (updateData as any).image = imagePath;
    }

    const updatedRecipe = await recipeRepository.updateRecipeById(id, updateData);
    if (!updatedRecipe) {
      throw new HttpError(404, "Recipe not found");
    }

    return updatedRecipe;
  }

  async deleteRecipe(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid recipe id");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, "Invalid user id");
    }

    const recipe = await recipeRepository.getRecipeById(id);
    if (!recipe) {
      throw new HttpError(404, "Recipe not found");
    }

    if (recipe.createdBy._id.toString() !== userId) {
      throw new HttpError(403, "You can only delete your own recipe");
    }

    const deleted = await recipeRepository.deleteRecipeById(id);
    if (!deleted) {
      throw new HttpError(500, "Failed to delete recipe");
    }

    return { message: "Recipe deleted successfully" };
  }
}
