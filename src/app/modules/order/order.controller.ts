import httpStatus from "http-status";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { OrderServices } from "./order.service";
import { getIo } from "../../socket/socket";

const createOrder = catchAsync(async (req, res) => {
  const result = await OrderServices.createOrderIntoDB(req.body);

  if (result) {
    const io = getIo();
    // Notify Admin
    io.to("admin").emit("new-order", {
      message: "New order received!",
      order: result
    });
    // Notify User
    io.to(`user-${result.user}`).emit("new-order", {
      message: "Your order has been placed successfully!",
      order: result
    });
  }

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

  if (result) {
    const io = getIo();
    io.to(`user-${result.user}`).emit("order-updated", result);
  }

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


const pendingOrders = catchAsync(async (req, res) => {
  const result = await OrderServices.pendingOrdersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pending Orders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const unshippedOrders = catchAsync(async (req, res) => {
  const result = await OrderServices.unshippedOrdersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Unshipped Orders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const shippedOrders = catchAsync(async (req, res) => {
  const result = await OrderServices.shippedOrdersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shipped Orders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const cancelOrders = catchAsync(async (req, res) => {
  const result = await OrderServices.cancelOrdersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Canceled Orders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const deliveredOrders = catchAsync(async (req, res) => {
  const result = await OrderServices.deliveredOrdersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Delivered  Orders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const trackOrder = catchAsync(async (req, res) => {
  const { trackingId } = req.params;
  const result = await OrderServices.trackOrderByTrackingId(trackingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order tracking info retrieved successfully",
    data: result,
  });
});


export const OrderControllers = {
  createOrder,
  allOrders,
  myOrders,
  singleOrder,
  updateOrder,
  pendingOrders,
  unshippedOrders,
  shippedOrders,
  cancelOrders,
  deliveredOrders,
  trackOrder,
};