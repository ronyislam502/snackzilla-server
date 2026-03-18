import httpStatus from "http-status";
import QueryBuilder from "../../builder/queryBuilder";
import AppError from "../../errors/AppError";
import { TImageFile } from "../../interface/image.interface";
import { UserSearchableFields } from "./user.const";
import { Types } from "mongoose";
import { TUser } from "./user.interface";
import { User } from "./user.model";

const createUserIntoDB = async (avatar: TImageFile, payload: TUser) => {
  const file = avatar;
  payload.avatar = file?.path;

  const result = await User.create(payload);
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
  const user = await User.findOne({ email }).lean();

  if (!user) {
    return null;
  }

  return {
    ...user,
    hasPassword: !!user.password,
  };
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
  if (file) {
    payload.avatar = file?.path;
  }


  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const toggleFavoriteIntoDB = async (userId: string, foodId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const foodObjectId = new Types.ObjectId(foodId);
  const isFavorite = user.favorites.some((id) => id.equals(foodObjectId));

  let result;
  if (isFavorite) {
    result = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: foodObjectId } },
      { new: true }
    );
  } else {
    result = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: foodObjectId } },
      { new: true }
    );
  }

  return result;
};

const getFavoritesFromDB = async (email: string) => {
  const result = await User.findOne({ email }).populate("favorites");
  return result?.favorites || [];
};

export const UserServices = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  toggleFavoriteIntoDB,
  getFavoritesFromDB,
};
