import httpStatus from "http-status";
import QueryBuilder from "../../builder/queryBuilder";
import AppError from "../../errors/AppError";
import { TImageFile } from "../../interface/image.interface";
import { User } from "../user/user.model";
import { TBlog } from "./blog.interface";
import { Blog } from "./blog.model";

const createBlogIntoDB = async (image: TImageFile,payload: TBlog) => {
    const isUserExists=await User.findById(payload.user)
    if(!isUserExists){
        throw new Error("User does not exist")
    }

    if (image && image.path) {
    payload.image = image.path;
   }

    const result = await Blog.create(payload);
    return result;
}

const allBlogsFromDB = async (query: Record<string, unknown>) => {
  const blogQuery = new QueryBuilder(Blog.find().populate("user", 'avatar name email'), query)
    .search(["user.name", "title", "description"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await blogQuery.countTotal();
  const data = await blogQuery.modelQuery;

  return { meta, data };
};

const singleBlogFromDB = async (id: string) => {
  const result = await Blog.findById(id).populate("user");

  return result;
};

const updateBlogIntoDB = async (
  id: string,
  image: TImageFile,
  payload: Partial<TBlog>
) => {
  const isBlogExists = await Blog.findById(id);

  if (!isBlogExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  if (image && image.path) {
    payload.image = image.path;
  }

  const result = await Blog.findByIdAndUpdate(isBlogExists._id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteBlogFromDB = async (id: string) => {
  const result = await Blog.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    { new: true }
  ).populate("user");

  return result;
};


export const BlogServices = {
    createBlogIntoDB,
    allBlogsFromDB,
    singleBlogFromDB,
    updateBlogIntoDB,
    deleteBlogFromDB
}
