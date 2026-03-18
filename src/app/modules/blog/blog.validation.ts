import { z } from "zod";

const createBlogSchema = z.object({
  body: z.object({
    user: z.string(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
     tags: z
    .array(z.string().min(1, "Tag cannot be empty"))
  }),
});

const updateBlogSchema = z.object({
  body: z.object({
    user: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
     tags: z
    .array(z.string().optional())
  }),
});


export const BlogValidations = {
    createBlogSchema,
    updateBlogSchema
}