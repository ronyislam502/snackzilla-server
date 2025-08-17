import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { Category } from "../category/category.model";
import { TFood } from "./food.interface";
import { TImageFile } from "../../interface/image.interface";
import { Food } from "./food.model";
import QueryBuilder from "../../builder/queryBuilder";

const createFoodIntoDB = async (image: TImageFile, payload: TFood) => {
  const isCategoryExists = await Category.findById(payload?.category);
  console.log(isCategoryExists);

  if (!isCategoryExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (image && image.path) {
    payload.image = image.path;
  }

  const result = await Food.create(payload);

  return result;
};

const allFoodsFromDB = async (query: Record<string, unknown>) => {
  const foodQuery = new QueryBuilder(Food.find().populate("category"), query)
    .search(["category.name", "name", "description"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await foodQuery.countTotal();
  const data = await foodQuery.modelQuery;

  return { meta, data };
};

const allFoodsByCategoryFromDB = async (
  categoryId: string,
  query: Record<string, unknown>
) => {
  const isCategoryExists = await Category.findById(categoryId);

  if (!isCategoryExists) {
    throw new AppError(httpStatus.NOT_FOUND, "This category not found");
  }

  const foodCategoryQuery = new QueryBuilder(
    Food.find({ category: isCategoryExists?._id }).populate("category"),
    query
  )
    .search(["name"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await foodCategoryQuery.countTotal();
  const data = await foodCategoryQuery.modelQuery;

  return { meta, data };
};

const singleFoodFromDB = async (id: string) => {
  const result = await Food.findById(id).populate("category");

  return result;
};

const updateFoodIntoDB = async (
  id: string,
  image: TImageFile,
  payload: Partial<TFood>
) => {
  const isFoodExists = await Food.findById(id);

  if (!isFoodExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Food not found");
  }

  if (image && image.path) {
    payload.image = image.path;
  }

  const result = await Food.findByIdAndUpdate(isFoodExists._id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteFoodFromDB = async (id: string) => {
  const result = await Food.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    { new: true }
  ).populate("category");

  return result;
};

export const FoodServices = {
  createFoodIntoDB,
  allFoodsFromDB,
  singleFoodFromDB,
  deleteFoodFromDB,
  updateFoodIntoDB,
  allFoodsByCategoryFromDB,
};
