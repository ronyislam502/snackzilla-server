import { Router } from "express";
import { PaymentControllers } from "./payment.controller";
import { USER_ROLE } from "../user/user.const";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/confirm",
  PaymentControllers.confirmPayment
);

router.get(
  "/confirm",
  PaymentControllers.confirmPayment
);

export const PaymentRoutes = router;
