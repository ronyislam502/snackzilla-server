import httpStatus from "http-status";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { DashboardServices, TimeFilter } from "./dashboard.service";

const AdminStatistics = catchAsync(async (req, res) => {
  // console.log("DEBUG: AdminStatistics request received", req.query);
  const result = await DashboardServices.AdminStatisticsFromDB(req.query);
  // console.log("DEBUG: AdminStatistics result success:", !!result);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin statistics fetched successfully",
    data: result,
  });
});

const UserStatistics = catchAsync(async (req, res) => {
  const { email } = req.params;
  // console.log("DEBUG: UserStatistics request received for email:", email, req.query);
  const result = await DashboardServices.UserStatisticsFromDB(email, req.query);
  // console.log("DEBUG: UserStatistics result success:", !!result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User statistics fetched successfully",
    data: result,
  });
});

const topSellingFoods = catchAsync(async (req, res) => {
  const filter = (req.query.filter as string) || "monthly";
  const result = await DashboardServices.topSellingFoodsFromDB(filter as TimeFilter);


  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Top selling foods",
    data: result,
  });
});



export const DashboardControllers = {
  AdminStatistics,
  UserStatistics,
  topSellingFoods
};
