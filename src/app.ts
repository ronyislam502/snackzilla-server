import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { OrderServices } from "./app/modules/order/order.service";
import cron from "node-cron";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

cron.schedule("*/5 * * * *", async () => {
  try {
    await OrderServices.cancelUnpaidOrdersFromDB();
  } catch (err) {
    console.error("Error in cron job:", err);
  }
});

app.use("/api", router);

const getController = (req: Request, res: Response) => {
  res.send("SnackZilla app");
};

app.get("/", getController);
app.use(globalErrorHandler);
app.use(notFound);

// console.log(process.cwd());

export default app;
