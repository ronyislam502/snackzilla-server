import httpStatus from "http-status";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { ServiceReviewServices } from "./serviceReview.service";

const createServiceReview = catchAsync(async (req, res) => {
  const result = await ServiceReviewServices.createServiceReviewIntoDB(
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service review successfully",
    data: result,
  });
});

const allServiceReviews = catchAsync(async (req, res) => {
  const result = await ServiceReviewServices.getAllServiceReviewsFromDB(
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateServiceReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceReviewServices.updateServiceReviewIntoDB(
    id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service review updated successfully",
    data: result,
  });
});

export const ServiceReviewControllers = {
  createServiceReview,
  allServiceReviews,
  updateServiceReview,
};
