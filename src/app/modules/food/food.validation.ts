import { z } from "zod";

const createFoodSchema = z.object({
  body: z.object({
    category: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.number().min(0, "Price must be non-negative"),
    preparationTime: z.number().min(0, "Preparation time must be non-negative"),
    rating: z.number().optional(),
    tags: z.array(z.string()).optional(),
    ingredients: z.array(z.string()).optional(),
    nutrition: z.object({
      calories: z.number().optional(),
      protein: z.string().optional(),
      carbs: z.string().optional(),
      fat: z.string().optional(),
    }).optional(),
    allergens: z.array(z.string()).optional(),
    isVegetarian: z.boolean().optional(),
    isSpicy: z.boolean().optional(),
  }),
});

const updateFoodSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    preparationTime: z.number().optional(),
    rating: z.number().optional(),
    tags: z.array(z.string()).optional(),
    ingredients: z.array(z.string()).optional(),
    nutrition: z.object({
      calories: z.number().optional(),
      protein: z.string().optional(),
      carbs: z.string().optional(),
      fat: z.string().optional(),
    }).optional(),
    allergens: z.array(z.string()).optional(),
    isVegetarian: z.boolean().optional(),
    isSpicy: z.boolean().optional(),
  }),
});

export const FoodValidations = {
  createFoodSchema,
  updateFoodSchema,
};
