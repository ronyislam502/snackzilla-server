import { Router } from "express";
import { FoodReviewControllers } from "./foodReview.controller";

const router = Router();

router.post("/create-food-review", FoodReviewControllers.createFoodReview);

router.get("/food/:foodId", FoodReviewControllers.AllFoodReviewsByFood);

router.patch("/update/:foodId", FoodReviewControllers.updateFoodReview);

export const FoodReviewRoutes = router;
