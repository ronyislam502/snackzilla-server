import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { BlogControllers } from "./blog.controller";



const router = Router();

router.post(
  "/create-blog",
  multerUpload.single("image"),
  parseBody,
//   validateRequest(BlogValidations.updateBlogSchema),
  BlogControllers.createBlog
);

router.get("/", BlogControllers.allBlogs);

router.get("/blog/:id", BlogControllers.singleBlog);

router.patch(
  "/update/:id",
  multerUpload.single("image"),
  parseBody,
//   validateRequest(BlogValidations.updateBlogSchema),
  BlogControllers.updateBlog
);

router.delete("/delete/:id", BlogControllers.deleteBlog);

export const BlogRoutes = router;