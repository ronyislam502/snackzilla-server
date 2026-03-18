import { Router } from "express";
import { FoodControllers } from "./food.controller";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { validateRequest } from "../../middlewares/validateRequest";
import { FoodValidations } from "./food.validation";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.const";

const router = Router();

router.post(
  "/create-food",
  auth(USER_ROLE.ADMIN),
  multerUpload.single("image"),
  parseBody,
  validateRequest(FoodValidations.createFoodSchema),
  FoodControllers.createFood
);

router.get("/", FoodControllers.allFoods);

router.get("/food/:id", FoodControllers.singleFood);


router.patch(
  "/update/:id",
  auth(USER_ROLE.ADMIN),
  multerUpload.single("image"),
  parseBody,
  validateRequest(FoodValidations.updateFoodSchema),
  FoodControllers.updateFood
);

router.delete("/delete/:id", auth(USER_ROLE.ADMIN), FoodControllers.deleteFood);

export const FoodRoutes = router;
