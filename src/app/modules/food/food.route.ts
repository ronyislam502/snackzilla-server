import { Router } from "express";
import { FoodControllers } from "./food.controller";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { validateRequest } from "../../middlewares/validateRequest";
import { FoodValidations } from "./food.validation";

const router = Router();

router.post(
  "/create-food",
  multerUpload.single("image"),
  parseBody,
  validateRequest(FoodValidations.updateFoodSchema),
  FoodControllers.createFood
);

router.get("/", FoodControllers.allFoods);

router.get("/food/:id", FoodControllers.singleFood);

router.patch(
  "/update/:id",
  multerUpload.single("image"),
  parseBody,
  validateRequest(FoodValidations.updateFoodSchema),
  FoodControllers.updateFood
);

router.delete("/delete/:id", FoodControllers.deleteFood);

export const FoodRoutes = router;
