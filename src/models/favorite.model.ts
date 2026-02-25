import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  recipeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipeId: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
  },
  {
    timestamps: true,
  }
);

// Create a compound unique index to prevent duplicate favorites
FavoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const FavoriteModel = mongoose.model<IFavorite>("Favorite", FavoriteSchema);
