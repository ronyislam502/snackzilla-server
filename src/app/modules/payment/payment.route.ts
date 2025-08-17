import { Router } from "express";
import { PaymentControllers } from "./payment.controller";

const router = Router();

router.post(
  "/confirm",
  //   auth(USER_ROLE.admin, USER_ROLE.user),
  PaymentControllers.confirmPayment
);

export const PaymentRoutes = router;
