import httpStatus from "http-status";
import { TImageFile } from "../../interface/image.interface";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { FoodServices } from "./food.service";

const createFood = catchAsync(async (req, res) => {
  const result = await FoodServices.createFoodIntoDB(
    req.file as TImageFile,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Food created successfully",
    data: result,
  });
});

const allFoods = catchAsync(async (req, res) => {
  const result = await FoodServices.allFoodsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Foods retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const allFoodsByCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const result = await FoodServices.allFoodsByCategoryFromDB(
    categoryId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Foods retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const singleFood = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FoodServices.singleFoodFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Foods retrieved successfully",
    data: result,
  });
});

const updateFood = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FoodServices.updateFoodIntoDB(
    id,
    req.file as TImageFile,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Food update successfully",
    data: result,
  });
});

const deleteFood = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FoodServices.deleteFoodFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Foods deleted successfully",
    data: result,
  });
});

export const FoodControllers = {
  createFood,
  allFoods,
  singleFood,
  updateFood,
  deleteFood,
  allFoodsByCategory,
};
