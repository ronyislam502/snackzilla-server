import httpStatus from "http-status";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { AuthServices } from "./auth.service";
import config from "../../config";
import AppError from "../../errors/AppError";
import { TUser } from "../user/user.interface";

const loginUser = catchAsync(async (req, res) => {
  const user = req.user as TUser;
  const result = await AuthServices.getTokensAfterAuthentication(user);

  const { accessToken, refreshToken } = result;

  // res.cookie("accessToken", accessToken, {
  //   secure: config.NODE_ENV === "production",
  //   httpOnly: true,
  //   sameSite: config.NODE_ENV === "production" ? "none" : "lax",
  //   maxAge: 15 * 60 * 1000,
  // });

  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${user?.name} logged in successfully`,

    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;

  const result = await AuthServices.changePasswordIntoDB(
    req.user as TUser,
    passwordData
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password updated successfully!",
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshTokenFromDB(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token retrieved successfully!",
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await AuthServices.forgetPasswordFromDB(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Please check your email",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, "Something went wrong !");
  }

  const result = await AuthServices.resetPasswordFromDB(
    req.body,
    token as string
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully!",
    data: result,
  });
});

const googleAuth = catchAsync(async (req, res) => {

  let redirectTo = req.query.state ? req.query.state as string : ""

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }

  const result = await AuthServices.googleLoginFromDB(req.user as TUser);
  
  const { accessToken, refreshToken } = result;
  const url=config?.client_url as string

  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

   const redirectUrl = `${url}/google-success?accessToken=${accessToken}`;

   res.redirect(`${redirectUrl}${redirectTo ? `&redirect=${redirectTo}` : ""}`);

})

const register = catchAsync(async (req, res) => {
  const result = await AuthServices.register(req.body);
  const { accessToken, refreshToken, user } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully",
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    },
  });
});

export const AuthControllers = {
  loginUser,
  register,
  googleAuth,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
