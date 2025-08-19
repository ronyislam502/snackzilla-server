import httpStatus from "http-status";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { DashboardServices } from "./dashboard.service";

const AdminStatistics = catchAsync(async (req, res) => {
  const result = await DashboardServices.AdminStatisticsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin stats",
    data: result,
  });
});

const UserStatistics = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await DashboardServices.UserStatisticsFromDB(email, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User stats",
    data: result,
  });
});

export const DashboardControllers = {
  AdminStatistics,
  UserStatistics,
};
