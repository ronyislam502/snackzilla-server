import httpStatus from "http-status";
import QueryBuilder from "../../builder/queryBuilder";
import AppError from "../../errors/AppError";
import { ORDER_STATUS, PAYMENT_STATUS, TOrder } from "./order.interface";
import { Order } from "./order.model";
import { Food } from "../food/food.model";
import { User } from "../user/user.model";
import { initiatePayment } from "../payment/payment.utils";
import config from "../../config";


const createOrderIntoDB = async (payload: TOrder) => {
  const { user, foods } = payload;

  const userExists = await User.findById(user)

  if (!userExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");
  }

  const isAddressComplete = 
    userExists.address && 
    userExists.address.street && 
    userExists.address.city && 
    userExists.address.postalCode && 
    userExists.address.country;

  if (!userExists.phone || !isAddressComplete) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      "Profile incomplete. Please ensure phone and full address (street, city, postal code, country) are updated in your profile."
    );
  }


  try {
    const foodDetails = [];
    let totalPrice = 0;
    let totalQuantity = 0;

    for (const item of foods) {
      const isFood = await Food.findById(item?.food);

      if (!isFood) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          `this food ${item.food} not found`
        );
      }

      foodDetails.push({
        food: isFood._id,
        quantity: item.quantity,
      });

      totalPrice += parseFloat((isFood?.price * item?.quantity).toFixed(2));
      totalQuantity += item?.quantity;
    }

    const tax = parseFloat((totalPrice * 0.1).toFixed(2));
    const grandAmount = totalPrice + tax;

    const transactionId = `SZ${Date.now()}`;

    const order = new Order({
      user,
      foods: foodDetails,
      tax,
      totalPrice,
      totalQuantity,
      grandAmount,
      status: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      transactionId,
      statusHistory: [{ status: ORDER_STATUS.PENDING, updatedAt: new Date() }]
    });

    // console.log("order", order)

    await order.save();

    const paymentData = {
      transactionId,
      user,
      grandAmount,
    };

    const payment = await initiatePayment(paymentData);

    if (!payment) {
      throw new Error("Payment initialization failed to generate a URL.");
    }

    return payment;
  } catch (error: unknown) {
    console.error("Order or Payment Error:", error);
    const err = error as { statusCode?: number; message?: string };
    throw new AppError(
      err.statusCode || httpStatus.FORBIDDEN,
      `Order creation failed: ${err?.message || "Internal Server Error"}`
    );
  }
};

const allOrdersFromDB = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(
    Order.find()
      .populate("user", "name email phone address")
      .populate({
        path: "foods.food",
        populate: {
          path: "category",
          model: "Category",
        },
      }),
    query
  )
    .search(["user.name", "user.email", ])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await orderQuery.countTotal();
  const data = await orderQuery.modelQuery;


  return { meta, data };
};


const singleOrderFromDB = async (id: string) => {
  const result = await Order.findById(id)
    .populate("user", "name email phone address avatar")
    .populate({
      path: "foods.food",
      model: "Food",
      populate: {
        path: "category",
        model: "Category",
        select: "name",
      },
    });
  
  return result;
};


const updateOrderIntoDB = async (id: string, payload: Partial<TOrder>) => {
  const isOrderExists = await Order.findById(id);

  if (!isOrderExists) {
    throw new AppError(httpStatus.NOT_FOUND, "this Order not found");
  }

  const updateData: Record<string, unknown> = { ...payload };
  if (payload.status && payload.status !== isOrderExists.status) {
    updateData.$push = {
      statusHistory: { status: payload.status, updatedAt: new Date() },
    };
  }

  const result = await Order.findByIdAndUpdate(isOrderExists._id, updateData, {
    new: true,
    runValidators: true,
  });

  return result;
};

const myOrdersByEmail = async (
  email: string,
  query: Record<string, unknown>
) => {
  const isCustomerExists = await User.findOne({ email });

  if (!isCustomerExists) {
    throw new AppError(httpStatus.NOT_FOUND, "This customer not found");
  }

  const orderQuery = new QueryBuilder(
    Order.find({ user: isCustomerExists._id })
      .populate("user", "name email phone")
      .populate({
        path: "foods.food",
        populate: {
          path: "category",
          model: "Category",
          select: "name",
        },
      }),
    query
  )
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await orderQuery.countTotal();
  const data = await orderQuery.modelQuery;

  return { meta, data };
};

const cancelUnpaidOrdersFromDB = async () => {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);

  const result = await Order.updateMany(
    {
      paymentStatus: PAYMENT_STATUS.PENDING,
      status: ORDER_STATUS.PENDING,
      createdAt: { $lt: tenMinAgo },
    },
    {
      $set: {
        status: ORDER_STATUS.CANCELLED,
        paymentStatus: PAYMENT_STATUS.CANCELED,
      },
    }
  );

  return result;
};


const pendingOrdersFromDB = async (query: Record<string, unknown>) => {
  const status = {
    paymentStatus: PAYMENT_STATUS.PENDING,
    status: ORDER_STATUS.PENDING,
  }
  const pendingQueryBuilder = new QueryBuilder(Order.find(status).populate({
        path: "foods.food",
        populate: {
          path: "category",
          model: "Category",
          select: "name",
        },
      }), query).sort()
    .paginate();
  
  const meta = await pendingQueryBuilder.countTotal();
  const data = await pendingQueryBuilder.modelQuery;

  return {
    meta, data
  }
};

const unshippedOrdersFromDB = async (query: Record<string, unknown>) => {
  const status = {
    paymentStatus: PAYMENT_STATUS.PAID,
    status: ORDER_STATUS.UNSHIPPED,
  }
  const unshippedQueryBuilder = new QueryBuilder(Order.find(status).populate({
        path: "foods.food",
        populate: {
          path: "category",
          model: "Category",
          select: "name",
        },
      }), query).search(["transactionId"]).filter().sort()
    .paginate().fields();
  
  const meta = await unshippedQueryBuilder.countTotal();
  const data = await unshippedQueryBuilder.modelQuery;

  return {
    meta, data
  }
};

const shippedOrdersFromDB = async (query: Record<string, unknown>) => {
  const status = {
    paymentStatus: PAYMENT_STATUS.PAID,
    status: ORDER_STATUS.SHIPPED,
  }
  const shippedQueryBuilder = new QueryBuilder(Order.find(status).populate({
        path: "foods.food",
        populate: {
          path: "category",
          model: "Category",
          select: "name",
        },
      }), query).search(["transactionId"]).filter().sort()
    .paginate().fields();
  
  const meta = await shippedQueryBuilder.countTotal();
  const data = await shippedQueryBuilder.modelQuery;

  return {
    meta, data
  }
};

const cancelOrdersFromDB = async (query: Record<string, unknown>) => {
  const status = {
    paymentStatus: PAYMENT_STATUS.CANCELED,
    status: ORDER_STATUS.CANCELLED,
  }
  const cancelQueryBuilder = new QueryBuilder(Order.find(status).populate({
        path: "foods.food",
        populate: {
          path: "category",
          model: "Category",
          select: "name",
        },
      }), query).search(["transactionId"]).filter().sort()
    .paginate().fields();
  
  const meta = await cancelQueryBuilder.countTotal();
  const data = await cancelQueryBuilder.modelQuery;

  return {
    meta, data
  }
};

const deliveredOrdersFromDB = async (query: Record<string, unknown>) => {
  const status = {
    paymentStatus: PAYMENT_STATUS.PAID,
    status: ORDER_STATUS.DELIVERED,
  }
  const deliveredQueryBuilder = new QueryBuilder(Order.find(status).populate({
        path: "foods.food",
        populate: {
          path: "category",
          model: "Category",
          select: "name",
        },
      }), query).search(["transactionId"]).filter().sort()
    .paginate().fields();
  
  const meta = await deliveredQueryBuilder.countTotal();
  const data = await deliveredQueryBuilder.modelQuery;

  return {
    meta, data
  }
};



const trackOrderByTrackingId = async (identifier: string) => {
  const query: Record<string, unknown> = {
    $or: [
      { trackingId: identifier },
      { transactionId: identifier },
    ]
  };

  // Check if identifier is a valid MongoDB ObjectId
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    (query.$or as Array<Record<string, unknown>>).push({ _id: identifier });
  }

  const result = await Order.findOne(query)
    .populate("user", "name email phone address avatar")
    .populate({
      path: "foods.food",
      model: "Food",
      populate: {
        path: "category",
        model: "Category",
        select: "name",
      },
    });

  if (result) {
    (result as unknown as { invoiceLink: string }).invoiceLink = `${config.live_url_server}/api/v1/orders/invoice/${result._id}`;
  }

  return result;
};

export const OrderServices = {
  createOrderIntoDB,
  allOrdersFromDB,
  singleOrderFromDB,
  updateOrderIntoDB,
  myOrdersByEmail,
  cancelUnpaidOrdersFromDB,
  pendingOrdersFromDB,
  unshippedOrdersFromDB,
  shippedOrdersFromDB,
  cancelOrdersFromDB,
  deliveredOrdersFromDB,
  trackOrderByTrackingId
};
