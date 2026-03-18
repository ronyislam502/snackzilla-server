import { Types } from "mongoose";

export type TFeedback = {
  food: Types.ObjectId;
  feedback: string;
  rating: number;
};

export type TFoodReview = {
  user: Types.ObjectId;
  order: Types.ObjectId;
  feedbacks: TFeedback[];
};
