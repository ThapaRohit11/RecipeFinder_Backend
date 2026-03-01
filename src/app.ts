import express, { Application, NextFunction, Request, Response } from "express";
import path from "path";

import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import recipeRoutes from "./routes/recipe.route";
import favoriteRoutes from "./routes/favorite.route";
import { HttpError } from "./errors/http-error";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/favorites", favoriteRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new HttpError(404, "Route not found"));
});

app.use((error: Error | HttpError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

export default app;