import mongoose from "mongoose";
import { UserModel } from "../../models/user.model";
import { RecipeModel } from "../../models/recipe.model";
import { FavoriteModel } from "../../models/favorite.model";

let uniqueCounter = 0;

export const createObjectId = () => new mongoose.Types.ObjectId();

export const createUniqueSuffix = (prefix = "test") => `${prefix}-${Date.now()}-${++uniqueCounter}`;

export const clearTestCollections = async (runMarker: string) => {
  const regex = new RegExp(runMarker, "i");

  const users = await UserModel.find(
    {
      $or: [{ email: { $regex: regex } }, { username: { $regex: regex } }],
    },
    { _id: 1 },
  ).lean();

  const recipes = await RecipeModel.find(
    {
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
        { image: { $regex: regex } },
      ],
    },
    { _id: 1 },
  ).lean();

  const userIds = users.map((user) => user._id);
  const recipeIds = recipes.map((recipe) => recipe._id);

  const favoriteOr: Array<Record<string, unknown>> = [];
  if (userIds.length) {
    favoriteOr.push({ userId: { $in: userIds } });
  }
  if (recipeIds.length) {
    favoriteOr.push({ recipeId: { $in: recipeIds } });
  }

  if (favoriteOr.length) {
    await FavoriteModel.deleteMany({ $or: favoriteOr });
  }

  if (recipeIds.length) {
    await RecipeModel.deleteMany({ _id: { $in: recipeIds } });
  }

  if (userIds.length) {
    await UserModel.deleteMany({ _id: { $in: userIds } });
  }
};