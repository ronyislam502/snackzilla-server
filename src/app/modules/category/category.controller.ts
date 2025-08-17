import httpStatus from "http-status";
import { TImageFile } from "../../interface/image.interface";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { CategoryServices } from "./category.service";

const createCategory = catchAsync(async (req, res) => {
  const result = await CategoryServices.createCategoryIntoDB(
    req.file as TImageFile,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const allCategories = catchAsync(async (req, res) => {
  const result = await CategoryServices.allCategoriesFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});

const singleCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryServices.singleCategoryFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

export const CategoryControllers = {
  createCategory,
  allCategories,
  singleCategory,
};
