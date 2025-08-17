import { z } from "zod";

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string(),
  }),
});

const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
  }),
});

export const CategoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
