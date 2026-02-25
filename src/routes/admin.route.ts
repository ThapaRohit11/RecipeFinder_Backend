import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { upload } from "../config/multer.config";

const adminController = new AdminController();
const router = Router();

// Apply auth and admin middleware to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// POST /api/admin/users - Create a new user (with optional image upload)
router.post("/users", upload.single("image"), adminController.createUser.bind(adminController));

// GET /api/admin/users - Get all users
router.get("/users", adminController.getAllUsers.bind(adminController));

// GET /api/admin/users/:id - Get a specific user by ID
router.get("/users/:id", adminController.getUserById.bind(adminController));

// PUT /api/admin/users/:id - Update a user (with optional image upload)
router.put("/users/:id", upload.single("image"), adminController.updateUser.bind(adminController));

// DELETE /api/admin/users/:id - Delete a user
router.delete("/users/:id", adminController.deleteUser.bind(adminController));

export default router;
