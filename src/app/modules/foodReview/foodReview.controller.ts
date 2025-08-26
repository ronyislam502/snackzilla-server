import httpStatus from "http-status";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { FoodReviewServices } from "./foodReview.service";

const createFoodReview = catchAsync(async (req, res) => {
  const result = await FoodReviewServices.createFoodReviewIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Food review created successfully",
    data: result,
  });
});

const AllFoodReviewsByFood = catchAsync(async (req, res) => {
  const { foodId } = req.params;
  const result = await FoodReviewServices.getAllFoodReviewsByFoodFromDB(
    foodId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Food reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateFoodReview = catchAsync(async (req, res) => {
  const { foodId } = req.params;
  const result = await FoodReviewServices.updateFoodReviewIntoDB(
    foodId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Food review update successfully",
    data: result,
  });
});

export const FoodReviewControllers = {
  createFoodReview,
  AllFoodReviewsByFood,
  updateFoodReview,
};
