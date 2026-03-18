import { Router } from "express";
import { ReviewControllers } from "./review.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.const";

const router = Router();

router.post("/create-review", auth(USER_ROLE.USER), ReviewControllers.createReview);
router.get("/", ReviewControllers.getAllReviews);
router.get("/food/:foodId", ReviewControllers.getReviewsByFoodId);
router.delete("/delete/:id", auth(USER_ROLE.ADMIN), ReviewControllers.deleteReview);

export const ReviewRoutes = router;
