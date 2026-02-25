import { FavoriteModel, IFavorite } from "../models/favorite.model";

export class FavoriteRepository {
  async addFavorite(userId: string, recipeId: string): Promise<IFavorite> {
    const favorite = new FavoriteModel({ userId, recipeId });
    return favorite.save();
  }

  async removeFavorite(userId: string, recipeId: string): Promise<boolean> {
    const result = await FavoriteModel.findOneAndDelete({ userId, recipeId });
    return !!result;
  }

  async isFavorited(userId: string, recipeId: string): Promise<boolean> {
    const favorite = await FavoriteModel.findOne({ userId, recipeId });
    return !!favorite;
  }

  async getFavoritesByUser(userId: string): Promise<IFavorite[]> {
    return FavoriteModel.find({ userId })
      .populate({
        path: "recipeId",
        populate: { path: "createdBy", select: "username firstName lastName email" },
      })
      .sort({ createdAt: -1 });
  }

  async countFavoritesForRecipe(recipeId: string): Promise<number> {
    return FavoriteModel.countDocuments({ recipeId });
  }

  async removeFavoritesByUser(userId: string): Promise<number> {
    const result = await FavoriteModel.deleteMany({ userId });
    return result.deletedCount ?? 0;
  }

  async removeFavoritesByRecipeIds(recipeIds: string[]): Promise<number> {
    if (!recipeIds.length) {
      return 0;
    }

    const result = await FavoriteModel.deleteMany({ recipeId: { $in: recipeIds } });
    return result.deletedCount ?? 0;
  }
}
