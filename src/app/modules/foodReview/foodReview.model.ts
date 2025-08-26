import { model, Schema } from "mongoose";
import { TFoodReview } from "./foodReview.interface";

const FoodReviewSchema = new Schema<TFoodReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required"],
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "order is required"],
    },
    food: {
      type: Schema.Types.ObjectId,
      ref: "Food",
      required: [true, "food is required"],
    },
    feedback: {
      type: String,
      required: [true, "Feedback is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
    },
  },
  { timestamps: true }
);

export const FoodReview = model<TFoodReview>("FoodReview", FoodReviewSchema);
