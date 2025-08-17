import { Types } from "mongoose";

export const USER_ROLE = {
  Mild: "Mild",
  Medium: "Medium",
  Hot: "Hot",
} as const;

export type TFood = {
  category: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image?: string;
  preparationTime: number;
  isDeleted: boolean;
};
