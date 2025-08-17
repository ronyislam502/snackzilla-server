import { TImageFile } from "../../interface/image.interface";
import { TCategory } from "./category.interface";
import { Category } from "./category.model";

const createCategoryIntoDB = async (icon: TImageFile, payload: TCategory) => {
  if (icon && icon.path) {
    payload.icon = icon.path;
  }

  const result = await Category.create(payload);

  return result;
};

const allCategoriesFromDB = async () => {
  const result = await Category.find();
  return result;
};

const singleCategoryFromDB = async (id: string) => {
  const result = await Category.findById(id);

  return result;
};

export const CategoryServices = {
  createCategoryIntoDB,
  allCategoriesFromDB,
  singleCategoryFromDB,
};
