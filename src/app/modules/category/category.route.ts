import { Router } from "express";
import { CategoryControllers } from "./category.controller";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { FoodControllers } from "../food/food.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.const";

const router = Router();

router.post(
  "/create-category",auth(USER_ROLE.ADMIN),
  multerUpload.single("icon"),
  parseBody,
  CategoryControllers.createCategory
);

router.get("/", CategoryControllers.allCategories);

router.get("/:id", CategoryControllers.singleCategory);

router.get("/category-foods/:categoryId", FoodControllers.allFoodsByCategory);

router.post(
  "/update-category/:id",auth(USER_ROLE.ADMIN),
  multerUpload.single("icon"),
  parseBody,
  CategoryControllers.updateCategory
);

export const CategoryRoutes = router;
