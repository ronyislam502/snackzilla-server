import { Types } from "mongoose";

export const Food_ROLE = {
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
  tags?: string[];
  ingredients?: string[];
  nutrition?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  allergens?: string[];
  isVegetarian?: boolean;
  isSpicy?: boolean;
};
