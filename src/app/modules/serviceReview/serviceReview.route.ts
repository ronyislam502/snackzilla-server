import { Router } from "express";
import { ServiceReviewControllers } from "./serviceReview.controller";

const router = Router();

router.post(
  "/create-service-review",
  ServiceReviewControllers.createServiceReview
);

router.get("/", ServiceReviewControllers.allServiceReviews);

router.patch("/update/:id", ServiceReviewControllers.updateServiceReview);

export const ReviewRoutes = router;
