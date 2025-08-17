import express from "express";
import { UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "./user.const";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { UserValidations } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = express.Router();

router.post(
  "/create-user",
  multerUpload.single("avatar"),
  parseBody,
  validateRequest(UserValidations.createUserValidationSchema),
  UserControllers.createUser
);

router.get("/", UserControllers.getAllUsers);

router.get(
  "/user/:email",
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  UserControllers.getSingleUser
);

router.patch(
  "/update/:id",
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  multerUpload.single("avatar"),
  parseBody,
  validateRequest(UserValidations.updateUserValidationSchema),
  UserControllers.updateUser
);

export const UserRoutes = router;
