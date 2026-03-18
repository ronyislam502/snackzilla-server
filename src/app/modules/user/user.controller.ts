import httpStatus from "http-status";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { UserServices } from "./user.service";
import { TImageFile } from "../../interface/image.interface";

const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUserIntoDB(
    req.file as TImageFile,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Created successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await UserServices.getAllUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: users.meta,
    data: users.data,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await UserServices.getSingleUserFromDB(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved Successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.updateUserIntoDB(
    id,
    req.file as TImageFile,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User update Successfully",
    data: result,
  });
});

const toggleFavorite = catchAsync(async (req, res) => {
  const { foodId } = req.params;
  const userId = (req as any).user._id; 
  const result = await UserServices.toggleFavoriteIntoDB(userId, foodId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Favorite toggled successfully",
    data: result,
  });
});

const getFavorites = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await UserServices.getFavoritesFromDB(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Favorites retrieved successfully",
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  toggleFavorite,
  getFavorites,
};
