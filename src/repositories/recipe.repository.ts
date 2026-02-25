import { RecipeModel, IRecipe } from "../models/recipe.model";

export class RecipeRepository {
  async createRecipe(data: Partial<IRecipe>): Promise<IRecipe> {
    const recipe = new RecipeModel(data);
    return recipe.save();
  }

  async getAllRecipes(): Promise<IRecipe[]> {
    const recipes = await RecipeModel.find()
      .populate("createdBy", "username firstName lastName email")
      .sort({ createdAt: -1 });

    return recipes.filter((recipe: any) => recipe.createdBy && recipe.createdBy._id);
  }

  async getRecipeById(id: string): Promise<IRecipe | null> {
    const recipe = await RecipeModel.findById(id).populate("createdBy", "username firstName lastName email");

    if (!recipe || !(recipe as any).createdBy || !(recipe as any).createdBy._id) {
      return null;
    }

    return recipe;
  }

  async getRecipesByUser(userId: string): Promise<IRecipe[]> {
    const recipes = await RecipeModel.find({ createdBy: userId })
      .populate("createdBy", "username firstName lastName email")
      .sort({ createdAt: -1 });

    return recipes.filter((recipe: any) => recipe.createdBy && recipe.createdBy._id);
  }

  async updateRecipeById(id: string, data: Partial<IRecipe>): Promise<IRecipe | null> {
    return RecipeModel.findByIdAndUpdate(id, data, { new: true }).populate("createdBy", "username firstName lastName email");
  }

  async deleteRecipeById(id: string): Promise<boolean> {
    const result = await RecipeModel.findByIdAndDelete(id);
    return !!result;
  }

  async getRecipeIdsByUser(userId: string): Promise<string[]> {
    const recipes = await RecipeModel.find({ createdBy: userId }).select("_id").lean();
    return recipes.map((recipe) => recipe._id.toString());
  }

  async deleteRecipesByUser(userId: string): Promise<number> {
    const result = await RecipeModel.deleteMany({ createdBy: userId });
    return result.deletedCount ?? 0;
  }
}
