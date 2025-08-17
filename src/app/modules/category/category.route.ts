import { Router } from "express";
import { CategoryControllers } from "./category.controller";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { FoodControllers } from "../food/food.controller";

const router = Router();

router.post(
  "/create-category",
  multerUpload.single("icon"),
  parseBody,
  CategoryControllers.createCategory
);

router.get("/", CategoryControllers.allCategories);

router.get("/:id", CategoryControllers.singleCategory);

router.get("/category-foods/:categoryId", FoodControllers.allFoodsByCategory);

export const CategoryRoutes = router;
