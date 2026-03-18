import { Router } from "express";
import { OrderControllers } from "./order.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.const";

const router = Router();

router.post("/create-order",auth(USER_ROLE.USER), OrderControllers.createOrder);

router.get("/",auth(USER_ROLE.ADMIN), OrderControllers.allOrders);

router.get("/pending",auth(USER_ROLE.ADMIN), OrderControllers.pendingOrders);

router.get("/unshipped",auth(USER_ROLE.ADMIN), OrderControllers.unshippedOrders);

router.get("/shipped",auth(USER_ROLE.ADMIN), OrderControllers.shippedOrders);

router.get("/cancel",auth(USER_ROLE.ADMIN), OrderControllers.cancelOrders);

router.get("/delivered",auth(USER_ROLE.ADMIN), OrderControllers.deliveredOrders);

router.get("/my-orders/:email",auth(USER_ROLE.USER, USER_ROLE.ADMIN), OrderControllers.myOrders);

router.get("/order/:id",auth(USER_ROLE.USER, USER_ROLE.ADMIN), OrderControllers.singleOrder);


router.patch("/update/:id", auth(USER_ROLE.ADMIN), OrderControllers.updateOrder);


export const OrderRoutes = router;
