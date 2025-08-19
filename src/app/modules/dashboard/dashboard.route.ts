import { Router } from "express";
import { DashboardControllers } from "./dashboard.controller";

const router = Router();

router.get("/admin-stats", DashboardControllers.AdminStatistics);

router.get("/user-stats/:email", DashboardControllers.UserStatistics);

export const DashboardRoutes = router;
