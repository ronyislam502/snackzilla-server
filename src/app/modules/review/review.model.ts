import { model, Schema } from "mongoose";
import { TReview } from "./review.interface";

const CategorySchema = new Schema<TReview>(
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

export const Review = model<TReview>("Review", CategorySchema);
