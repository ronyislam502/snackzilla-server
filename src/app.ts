import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { OrderServices } from "./app/modules/order/order.service";
import expressSession from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cron from "node-cron";
import "./app/config/passport"
import config from "./app/config";



const app: Application = express();

app.use(expressSession({
  secret: config.express_session_secret as string,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: config.database_url as string }),
  proxy: config.NODE_ENV === "production",
  cookie: {
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: true,
  }
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [config.client_url as string , "http://localhost:3000", "http://localhost:3001"],
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

app.use("/api/v1", router);

const getController = (req: Request, res: Response) => {
  res.send("SnackZilla app");
};

app.get("/", getController);
app.use(globalErrorHandler);
app.use(notFound);

// console.log(process.cwd());

export default app;
