import { model, Schema } from "mongoose";
import { TFood } from "./food.interface";

const FoodSchema = new Schema<TFood>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
    },
    preparationTime: {
      type: Number,
      required: true,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

FoodSchema.pre("find", function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

FoodSchema.pre("findOne", function (next) {
  this.findOne({ isDeleted: { $ne: true } });
  next();
});

FoodSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

FoodSchema.statics.isServiceExists = async function (id: string) {
  const existingService = await Food.findOne({ id });
  return existingService;
};

export const Food = model<TFood>("Food", FoodSchema);
