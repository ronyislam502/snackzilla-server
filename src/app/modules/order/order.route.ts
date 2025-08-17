import { Router } from "express";
import { OrderControllers } from "./order.controller";

const router = Router();

router.post("/create-order", OrderControllers.createOrder);

router.get("/", OrderControllers.allOrders);

router.get("/my-orders/:email", OrderControllers.myOrders);

router.get("/order/:id", OrderControllers.singleOrder);

router.patch("/update/:id", OrderControllers.updateOrder);

export const OrderRoutes = router;
