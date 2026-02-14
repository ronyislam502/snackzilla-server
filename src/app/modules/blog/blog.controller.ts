import httpStatus from "http-status";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { FoodServices } from "../food/food.service";
import { TImageFile } from "../../interface/image.interface";
import { BlogServices } from "./blog.service";

const createBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.createBlogIntoDB(
    req.file as TImageFile,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog created successfully",
    data: result,
  });
});

const allBlogs = catchAsync(async (req, res) => {
  const result = await BlogServices.allBlogsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blogs retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});


const singleBlog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BlogServices.singleBlogFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog retrieved successfully",
    data: result,
  });
});

const updateBlog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BlogServices.updateBlogIntoDB(
    id,
    req.file as TImageFile,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog updated successfully",
    data: result,
  });
});

const deleteBlog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BlogServices.deleteBlogFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog deleted successfully",
    data: result,
  });
});

export const BlogControllers = {
  createBlog,
  allBlogs,
  singleBlog,
  updateBlog,
  deleteBlog,
};