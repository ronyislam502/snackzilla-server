import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TReview } from "./review.interface";
import { Order } from "../order/order.model";
import { Review } from "./review.model";
import QueryBuilder from "../../builder/queryBuilder";

const createReviewIntoDB = async (payload: TReview) => {
  const isUser = await User.findById(payload?.user);

  if (!isUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isOrder = await Order.findById(payload?.order);

  if (!isOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const result = await Review.create(payload);

  return result;
};

const getAllReviewsFromDB = async (query: Record<string, unknown>) => {
  const reviewsQuery = new QueryBuilder(
    Review.find().populate("user").populate("order"),
    query
  )
    .paginate()
    .sort();

  const meta = await reviewsQuery.countTotal();
  const data = await reviewsQuery.modelQuery;

  const totalRatings = data?.reduce((sum, review) => sum + review.rating, 0);
  const averageRating =
    data.length > 0 ? (totalRatings / data.length).toFixed(2) : "0.00";

  return { meta, data, averageRating, totalRatings };
};

const updateReviewIntoDB = async (id: string, payload: Partial<TReview>) => {
  const isUser = await User.findById(payload?.user);

  if (!isUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isOrder = await Order.findById(payload?.order);

  if (!isOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const result = await Review.findByIdAndUpdate(isOrder._id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const ReviewServices = {
  createReviewIntoDB,
  getAllReviewsFromDB,
  updateReviewIntoDB,
};
