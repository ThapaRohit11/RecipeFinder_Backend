import { Router } from "express";
import { RecipeController } from "../controllers/recipe.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { recipeUpload } from "../config/multer.config";

const router = Router();
const recipeController = new RecipeController();

router.get("/", recipeController.getAllRecipes.bind(recipeController));
router.get("/my", authMiddleware, recipeController.getMyRecipes.bind(recipeController));
router.get("/:id", recipeController.getRecipeById.bind(recipeController));
router.post("/", authMiddleware, recipeUpload.single("image"), recipeController.createRecipe.bind(recipeController));
router.patch("/:id", authMiddleware, recipeUpload.single("image"), recipeController.updateRecipe.bind(recipeController));
router.delete("/:id", authMiddleware, recipeController.deleteRecipe.bind(recipeController));

export default router;
