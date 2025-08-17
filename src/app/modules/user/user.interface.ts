/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Model } from "mongoose";
import { USER_ROLE, USER_STATUS } from "./user.const";

export type TAddress = {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

export type TUser = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  phone: string;
  role: keyof typeof USER_ROLE;
  status: keyof typeof USER_STATUS;
  address: TAddress;
  passwordChangedAt?: Date;
  isDeleted: boolean;
};

export interface UserModel extends Model<TUser> {
  //instance methods for checking if the user exist
  isUserExistsByEmail(email: string): Promise<TUser>;
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
