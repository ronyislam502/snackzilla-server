import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { Order } from "../order/order.model";
import { Food } from "../food/food.model";
import { Review } from "./review.model";
import { TFoodReview } from "./review.interface";

const createReviewIntoDB = async (payload: TFoodReview) => {
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

  // Map feedbacks to individual review documents and validate foods belong to the order
  const orderFoodIds = isOrder.foods.map(f => f.food.toString());

  const reviewDocs = payload.feedbacks.map((item) => {
    if (!orderFoodIds.includes(item.food.toString())) {
      throw new AppError(httpStatus.BAD_REQUEST, `Food with id ${item.food} was not part of this order`);
    }

    return {
      user: payload.user,
      order: payload.order,
      food: item.food,
      feedback: item.feedback,
      rating: item.rating,
    };
  });

  // Validate all foods exist
  for (const review of reviewDocs) {
    const isFood = await Food.findById(review.food);
    if (!isFood) {
      throw new AppError(httpStatus.NOT_FOUND, `Food with id ${review.food} not found`);
    }
  }

  const result = await Review.insertMany(reviewDocs);
  return result;
};

const getAllReviewsFromDB = async () => {
  const result = await Review.find().populate("user").populate("food").populate("order");
  return result;
};

const getReviewsByFoodIdFromDB = async (foodId: string) => {
  const reviews = await Review.find({ food: foodId })
    .populate("user", "name avatar")
    .populate("food", "name image")
    .sort({ createdAt: -1 });

  // Calculate average rating and total reviews
  const stats = await Review.aggregate([
    {
      $match: { food: new Food.base.Types.ObjectId(foodId) },
    },
    {
      $group: {
        _id: "$food",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return {
    reviews,
    averageRating: stats.length > 0 ? parseFloat(stats[0].averageRating.toFixed(1)) : 0,
    totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
  };
};

const deleteReviewFromDB = async (id: string) => {
  const result = await Review.findByIdAndDelete(id);
  return result;
};

export const ReviewServices = {
  createReviewIntoDB,
  getAllReviewsFromDB,
  getReviewsByFoodIdFromDB,
  deleteReviewFromDB,
};
