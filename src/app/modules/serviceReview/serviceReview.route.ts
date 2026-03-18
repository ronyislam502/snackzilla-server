import { Router } from "express";
import { ServiceReviewControllers } from "./serviceReview.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.const";

const router = Router();

router.post(
  "/create-service-review",auth(USER_ROLE.USER),
  ServiceReviewControllers.createServiceReview
);

router.get("/", ServiceReviewControllers.allServiceReviews);

router.patch("/update/:id",auth(USER_ROLE.USER), ServiceReviewControllers.updateServiceReview);

export const ServiceReviewRoutes = router;
