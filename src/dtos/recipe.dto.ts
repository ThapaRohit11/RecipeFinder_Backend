import { z } from "zod";

export const CreateRecipeDTO = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export type CreateRecipeDTO = z.infer<typeof CreateRecipeDTO>;

export const UpdateRecipeDTO = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
});

export type UpdateRecipeDTO = z.infer<typeof UpdateRecipeDTO>;
