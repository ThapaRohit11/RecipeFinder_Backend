import "dotenv/config";

import mongoose from "mongoose";
import { connectDatabase } from "../database/mongodb";
import { RecipeModel } from "../models/recipe.model";
import { FavoriteModel } from "../models/favorite.model";

async function cleanupOrphanRecipes() {
  await connectDatabase();

  const orphanRecipes = await RecipeModel.aggregate<{ _id: mongoose.Types.ObjectId }>([
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $match: {
        author: { $size: 0 },
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);

  const orphanRecipeIds = orphanRecipes.map((recipe) => recipe._id);

  if (orphanRecipeIds.length === 0) {
    console.log("No orphan recipes found.");
    return;
  }

  const [deletedFavorites, deletedRecipes] = await Promise.all([
    FavoriteModel.deleteMany({ recipeId: { $in: orphanRecipeIds } }),
    RecipeModel.deleteMany({ _id: { $in: orphanRecipeIds } }),
  ]);

  console.log(`Deleted orphan recipes: ${deletedRecipes.deletedCount ?? 0}`);
  console.log(`Deleted related favorites: ${deletedFavorites.deletedCount ?? 0}`);
}

cleanupOrphanRecipes()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Cleanup failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });
