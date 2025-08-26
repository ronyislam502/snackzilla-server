import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TFoodReview } from "./foodReview.interface";
import { Order } from "../order/order.model";
import { FoodReview } from "./foodReview.model";
import { Food } from "../food/food.model";
import QueryBuilder from "../../builder/queryBuilder";

const createFoodReviewIntoDB = async (payload: TFoodReview) => {
  const isUser = await User.findById(payload?.user);

  if (!isUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isOrder = await Order.findById(payload?.order);

  if (!isOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const isFood = await Food.findById(payload?.food);

  if (!isFood) {
    throw new AppError(httpStatus.NOT_FOUND, "Food not found");
  }

  const result = await FoodReview.create(payload);

  return result;
};

const getAllFoodReviewsByFoodFromDB = async (
  id: string,
  query: Record<string, unknown>
) => {
  const isFood = await Food.findById(id);

  if (!isFood) {
    throw new AppError(httpStatus.NOT_FOUND, "Food not found");
  }

  const FoodReviewQuery = new QueryBuilder(
    FoodReview.find({ food: isFood?._id }).populate("user"),
    query
  )
    .sort()
    .paginate();

  const meta = await FoodReviewQuery.countTotal();
  const data = await FoodReviewQuery.modelQuery;

  return { meta, data };
};

const updateFoodReviewIntoDB = async (
  id: string,
  payload: Partial<TFoodReview>
) => {
  const isFoodReview = await FoodReview.findById(id);

  if (!isFoodReview) {
    throw new AppError(httpStatus.NOT_FOUND, "Food review not found");
  }

  const isUser = await User.findById(payload?.user);

  if (!isUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isOrder = await Order.findById(payload?.order);

  if (!isOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const result = await FoodReview.findByIdAndUpdate(
    isFoodReview?._id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  return result;
};

export const FoodReviewServices = {
  createFoodReviewIntoDB,
  getAllFoodReviewsByFoodFromDB,
  updateFoodReviewIntoDB,
};
