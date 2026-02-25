import express, { Router } from "express";
import { FavoriteController } from "../controllers/favorite.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = express.Router();
const favoriteController = new FavoriteController();

// Add recipe to favorites
router.post("/:recipeId", authMiddleware, (req, res) => {
  favoriteController.addFavorite(req, res);
});

// Remove recipe from favorites
router.delete("/:recipeId", authMiddleware, (req, res) => {
  favoriteController.removeFavorite(req, res);
});

// Get user's favorites
router.get("/", authMiddleware, (req, res) => {
  favoriteController.getFavorites(req, res);
});

// Check if recipe is favorited
router.get("/:recipeId/status", authMiddleware, (req, res) => {
  favoriteController.isFavorited(req, res);
});

export default router;
