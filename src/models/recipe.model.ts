import mongoose, { Document, Schema } from "mongoose";

export interface IRecipe extends Document {
  title: string;
  description: string;
  image: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export const RecipeModel = mongoose.model<IRecipe>("Recipe", RecipeSchema);
