import { Types } from "mongoose";

export type TServiceReview = {
  user: Types.ObjectId;
  order: Types.ObjectId;
  feedback: string;
  rating: number;
};
