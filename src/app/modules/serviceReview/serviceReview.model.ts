import { model, Schema } from "mongoose";
import { TServiceReview } from "./serviceReview.interface";

const ServiceReviewSchema = new Schema<TServiceReview>(
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

export const ServiceReview = model<TServiceReview>(
  "ServiceReview",
  ServiceReviewSchema
);
