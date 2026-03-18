import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { BlogControllers } from "./blog.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { BlogValidations } from "./blog.validation";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.const";



const router = Router();

router.post(
  "/create-blog", auth( USER_ROLE.ADMIN),
  multerUpload.single("image"),
  parseBody,
  validateRequest(BlogValidations.createBlogSchema),
  BlogControllers.createBlog
);

router.get("/", BlogControllers.allBlogs);

router.get("/blog/:id", BlogControllers.singleBlog);

router.patch(
  "/update/:id",
  multerUpload.single("image"),
  parseBody,
  validateRequest(BlogValidations.updateBlogSchema),
  BlogControllers.updateBlog
);

router.delete("/delete/:id", BlogControllers.deleteBlog);

export const BlogRoutes = router;