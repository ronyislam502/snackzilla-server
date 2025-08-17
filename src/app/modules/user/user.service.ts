import httpStatus from "http-status";
import QueryBuilder from "../../builder/queryBuilder";
import AppError from "../../errors/AppError";
import { TImageFile } from "../../interface/image.interface";
import { UserSearchableFields } from "./user.const";
import { TUser } from "./user.interface";
import { User } from "./user.model";

const createUserIntoDB = async (avatar: TImageFile, payload: TUser) => {
  const file = avatar;
  payload.avatar = file?.path;

  const result = await User.create(payload);

  console.log("res", result);

  return result;
};

const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .fields()
    .paginate()
    .sort()
    .filter()
    .search(UserSearchableFields);

  const meta = await userQuery.countTotal();
  const data = await userQuery.modelQuery;

  return {
    meta,
    data,
  };
};

const getSingleUserFromDB = async (email: string) => {
  const user = await User.find({ email });

  return user;
};

const updateUserIntoDB = async (
  id: string,
  avatar: TImageFile,
  payload: Partial<TUser>
) => {
  const existingUser = await User.findById(id);

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const file = avatar;
  payload.avatar = file?.path;

  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const UserServices = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
};
