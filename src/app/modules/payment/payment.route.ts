import { Router } from "express";
import { PaymentControllers } from "./payment.controller";
import { USER_ROLE } from "../user/user.const";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/confirm", auth(USER_ROLE.USER),
  PaymentControllers.confirmPayment
);


export const PaymentRoutes = router;
