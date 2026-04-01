import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TLoginUser } from "./auth.interface";
import { createToken, verifyToken } from "./auth.utilities";
import config from "../../config";
import bcrypt from "bcrypt";
import { JwtPayload } from "jsonwebtoken";
import { USER_STATUS } from "../user/user.const";
import sendEmail from "../../utilities/sendEmail";
import { TUser } from "../user/user.interface";

const getTokensAfterAuthentication = async (user: TUser) => {

  const jwtPayload = {
    user: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.access_token_secret as string,
    config.access_token_expire_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.refresh_token_secret as string,
    config.refresh_token_expire_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const loginUserFromDB = async (payload: TLoginUser) => {
  const user = await User.isUserExistsByEmail(payload?.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
  }

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password as string))) {
    throw new AppError(httpStatus.FORBIDDEN, "Password does not match");
  }
  
  const { accessToken, refreshToken } = await getTokensAfterAuthentication(user);

  return {
    accessToken,
    user,
    refreshToken,
  };
};

const googleLoginFromDB = async (payload:TUser) => {
  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      avatar: payload.avatar,
      role: "USER",
      isVerified: true,
      auths: [
        {
          provider: "google",
          providerId: payload.email, 
        },
      ],
    });
  }

  const jwtPayload = {
    user: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.access_token_secret as string,
    config.access_token_expire_in as string
  );

   const refreshToken = createToken(
    jwtPayload,
    config.refresh_token_secret as string,
    config.refresh_token_expire_in as string
   );
  

  return {
    accessToken,
    refreshToken,
  };
};

const changePasswordIntoDB = async (
  userData: JwtPayload,
  payload: { oldPassword?: string; newPassword: string }
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
  }

  //checking if the password is correct
  if (user.password && !payload.oldPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Old password is required to change password");
  }

  if (user.password && !(await User.isPasswordMatched(payload.oldPassword!, user.password as string))) {
    throw new AppError(httpStatus.FORBIDDEN, "Password does not match");
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      email: userData.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );

  return {
    message: "password change successfully",
  };
};

const refreshTokenFromDB = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(
    token,
    config.refresh_token_secret as string
  ) as JwtPayload;

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
  }

  const jwtPayload = {
    email: user?.email,
    role: user?.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.access_token_secret as string,
    config.access_token_expire_in as string
  );

  return {
    accessToken,
  };
};

const forgetPasswordFromDB = async (email: string) => {
  const isUser = await User.isUserExistsByEmail(email);

  if (!isUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isDelete = isUser.isDeleted;

  if (isDelete) {
    throw new AppError(httpStatus.FORBIDDEN, "this user is deleted");
  }

  const userStatus = isUser.status;
  if (userStatus === USER_STATUS.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "this user is blocked");
  }

  const jwtPayload = {
    email: isUser.email,
    role: isUser.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.access_token_secret as string,
    config.reset_pass_token_expire_in as string
  );

  const resetPassLink = `${config?.reset_pass_link}?email=${isUser.email}&token=${resetToken}`;

  const subject = "Reset Password";

  const emailHtml = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #1e40af;">Reset Your Password</h2>
      <p>Dear ${isUser?.name},</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <p style="text-align: center;">
        <a href="${resetPassLink}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
      </p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <p>Thanks,<br/>The Support Team</p>
    </div>
  </div>
`;
  const result = await sendEmail(isUser?.email, subject, emailHtml);

  // console.log(result)
  
  return result;
};

const resetPasswordFromDB = async (
  payload: { email: string; newPassword: string },
  token: string
) => {
  // console.log({ payload, token });

  const isUser = await User.isUserExistsByEmail(payload.email);

  if (!isUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isDelete = isUser.isDeleted;

  if (isDelete) {
    throw new AppError(httpStatus.FORBIDDEN, "this user is deleted");
  }

  const userStatus = isUser.status;
  if (userStatus === USER_STATUS.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "this user is blocked");
  }

  const isTokenValid = verifyToken(token, config.access_token_secret as string);

  if (!isTokenValid) {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  const hashPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      email: isTokenValid.email,
      role: isTokenValid.role,
    },
    {
      password: hashPassword,
      passwordChangedAt: new Date(),
    }
  );
};

const register = async (payload: TUser) => {
  const user = await User.create(payload);
  const { accessToken, refreshToken } = await getTokensAfterAuthentication(user);

  return {
    accessToken,
    refreshToken,
    user,
  };
};

export const AuthServices = {
  getTokensAfterAuthentication,
  loginUserFromDB,
  changePasswordIntoDB,
  refreshTokenFromDB,
  forgetPasswordFromDB,
  resetPasswordFromDB,
  googleLoginFromDB,
  register,
};
