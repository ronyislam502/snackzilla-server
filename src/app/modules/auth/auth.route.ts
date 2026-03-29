import { AuthControllers } from "./auth.controller";
import {
  validateRequest,
  validateRequestCookies,
} from "../../middlewares/validateRequest";
import { AuthValidations } from "./auth.validation";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.const";
import passport from "passport";
import config from "../../config";
import { Router } from "express";

const router =Router();

router.post(
  "/login",
  validateRequest(AuthValidations.loginValidationSchema),
  passport.authenticate('local', { session: false }),
  AuthControllers.loginUser
);

router.post(
  "/register",
  validateRequest(AuthValidations.registerValidationSchema),
  AuthControllers.register
);

router.post(
  "/change-password",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(AuthValidations.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.post(
  "/refresh-token",
  validateRequestCookies(AuthValidations.refreshTokenValidationSchema),
  AuthControllers.refreshToken
);

router.post("/forget-password", AuthControllers.forgetPassword);

router.post("/reset-password", AuthControllers.resetPassword);


router.get("/google", (req, res, next) => {
  const redirect = (req.query.redirect as string) || "/"; // frontend path

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect,
  })(req, res, next);
})

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect:  `${config.client_url}/login?error=There is some issues with your account. Please contact with out support team!`
  }),
  AuthControllers.googleAuth
);





export const AuthRoutes = router;
