import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { FoodRoutes } from "../modules/food/food.route";
import { OrderRoutes } from "../modules/order/order.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { DashboardRoutes } from "../modules/dashboard/dashboard.route";
import { ServiceReviewRoutes } from "../modules/serviceReview/serviceReview.route";
import { BlogRoutes } from "../modules/blog/blog.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { ReservationRoutes } from "../modules/reservation/reservation.route";
import { ContactRoutes } from "../modules/contact/contact.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/foods",
    route: FoodRoutes,
  },
  {
    path: "/blogs",
    route: BlogRoutes,
  },
  {
    path: "/orders",
    route: OrderRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
  {
    path: "/service-reviews",
    route: ServiceReviewRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/reservations",
    route: ReservationRoutes,
  },
  {
    path: "/contacts",
    route: ContactRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
