import httpStatus from "http-status";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { OrderServices } from "./order.service";

const createOrder = catchAsync(async (req, res) => {
  const result = await OrderServices.createOrderIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "you have place order! please payment now",
    data: result,
  });
});

const allOrders = catchAsync(async (req, res) => {
  const result = await OrderServices.allOrdersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const singleOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderServices.singleOrderFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieved successfully",
    data: result,
  });
});

const updateOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderServices.updateOrderIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order updated successfully",
    data: result,
  });
});

const myOrders = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await OrderServices.myOrdersByEmail(email, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "my Orders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const OrderControllers = {
  createOrder,
  allOrders,
  myOrders,
  singleOrder,
  updateOrder,
};
