import { model, Schema } from "mongoose";
import { TFeedback } from "./review.interface";
import { Food } from "../food/food.model"; // Added import

// We define a schema for the individual review document
const ReviewSchema = new Schema<TFeedback & { user: Schema.Types.ObjectId; order: Schema.Types.ObjectId }>(
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
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Statics for calculating average ratings
ReviewSchema.statics.calculateAverageRating = async function (foodId: Schema.Types.ObjectId) {
  const stats = await this.aggregate([
    {
      $match: { food: foodId },
    },
    {
      $group: {
        _id: "$food",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Food.findByIdAndUpdate(foodId, {
      rating: parseFloat(stats[0].avgRating.toFixed(1)),
    });
  } else {
    await Food.findByIdAndUpdate(foodId, {
      rating: 4.5, // Default rating if no reviews
    });
  }
};

ReviewSchema.post("save", function () {
  // @ts-expect-error: this.constructor is properly typed as Model in later Mongoose versions but might still flag in some environments
  this.constructor.calculateAverageRating(this.food);
});

// Use pre-remove or post-delete hooks if deletion is implemented, but for now focus on creation.

export const Review = model("Review", ReviewSchema);
