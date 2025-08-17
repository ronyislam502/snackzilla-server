import { z } from "zod";

const createFoodSchema = z.object({
  body: z.object({
    category: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.number().min(0, "Price must be non-negative"),
    preparationTime: z.number().min(0, "Preparation time must be non-negative"),
  }),
});

const updateFoodSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    preparationTime: z.number().optional(),
  }),
});

export const FoodValidations = {
  createFoodSchema,
  updateFoodSchema,
};
