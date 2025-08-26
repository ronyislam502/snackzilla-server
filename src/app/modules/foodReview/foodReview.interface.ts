import { Types } from "mongoose";

export type TFoodReview = {
  user: Types.ObjectId;
  order: Types.ObjectId;
  product: Types.ObjectId;
  feedback: string;
  rating: number;
};
