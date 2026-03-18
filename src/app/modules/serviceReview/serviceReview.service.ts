import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { Order } from "../order/order.model";
import QueryBuilder from "../../builder/queryBuilder";
import { TServiceReview } from "./serviceReview.interface";
import { ServiceReview } from "./serviceReview.model";

const createServiceReviewIntoDB = async (payload: TServiceReview) => {
  const isUser = await User.findById(payload?.user);

  if (!isUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isOrder = await Order.findById(payload?.order);

  if (!isOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  // Ensure the order belongs to the user
  if (isOrder.user.toString() !== payload.user.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only review your own orders");
  }

  // Ensure the order is DELIVERED
  if (isOrder.status !== "DELIVERED") {
    throw new AppError(httpStatus.BAD_REQUEST, "Reviews are only permitted for delivered orders");
  }

  const result = await ServiceReview.create(payload);

  return result;
};

const getAllServiceReviewsFromDB = async (query: Record<string, unknown>) => {
  const reviewsQuery = new QueryBuilder(
    ServiceReview.find().populate("user").populate("order"),
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

const updateServiceReviewIntoDB = async (
  id: string,
  payload: Partial<TServiceReview>
) => {
  const isServiceReview = await ServiceReview.findById(id);

  if (!isServiceReview) {
    throw new AppError(httpStatus.NOT_FOUND, "ServiceReview not found");
  }

  const isUser = await User.findById(payload?.user);

  if (!isUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isOrder = await Order.findById(payload?.order);

  if (!isOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const result = await ServiceReview.findByIdAndUpdate(
    isServiceReview?._id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  return result;
};

export const ServiceReviewServices = {
  createServiceReviewIntoDB,
  getAllServiceReviewsFromDB,
  updateServiceReviewIntoDB,
};
