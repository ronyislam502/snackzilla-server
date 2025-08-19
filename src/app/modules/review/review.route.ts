import { Router } from "express";
import { ReviewControllers } from "./review.controller";

const router = Router();

router.post("/create-review", ReviewControllers.createReview);

router.get("/", ReviewControllers.allReviews);

router.patch("/update/:id", ReviewControllers.updateReview);

export const ReviewRoutes = router;
