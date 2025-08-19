import httpStatus from "http-status";
import QueryBuilder from "../../builder/queryBuilder";
import AppError from "../../errors/AppError";
import { ORDER_STATUS, PAYMENT_STATUS, TOrder } from "./order.interface";
import { Order } from "./order.model";
import { Food } from "../food/food.model";
import { User } from "../user/user.model";
import { initiatePayment } from "../payment/payment.utils";

const createOrderIntoDB = async (payload: TOrder) => {
  const { user, foods } = payload;

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
    });

    await order.save();

    const paymentData = {
      transactionId,
      user,
      grandAmount,
    };

    const payment = await initiatePayment(paymentData);

    return payment;
  } catch (error: any) {
    console.log("order-error", error);
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Order creation failed: ${error?.message}`
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
    .search(["user.name", "user.email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await orderQuery.countTotal();
  const data = await orderQuery.modelQuery;

  return { meta, data };
};
const singleOrderFromDB = async (id: string) => {
  const result = await Order.findById(id);

  return result;
};
const updateOrderIntoDB = async (id: string, payload: Partial<TOrder>) => {
  const isOrderExists = await Order.findById(id);

  if (!isOrderExists) {
    throw new AppError(httpStatus.NOT_FOUND, "this Order not found");
  }

  const result = await Order.findByIdAndUpdate(isOrderExists._id, payload, {
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
  console.log(tenMinAgo);

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

export const OrderServices = {
  createOrderIntoDB,
  allOrdersFromDB,
  singleOrderFromDB,
  updateOrderIntoDB,
  myOrdersByEmail,
  cancelUnpaidOrdersFromDB,
};
