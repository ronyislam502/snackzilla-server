import { Order } from "../order/order.model";
import { Types } from "mongoose";
import { User } from "../user/user.model";

interface DashboardFilter {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}

export const AdminStatisticsFromDB = async (filter: DashboardFilter) => {
  //  Base match for orders

  const match: any = {
    status: {
      $in: [
        "PENDING",
        "UNSHIPPED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ],
    },
  };

  if (filter.startDate && filter.endDate) {
    match.createdAt = { $gte: filter.startDate, $lte: filter.endDate };
  }

  //  Order status counts
  const rawOrderStatusCounts = await Order.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const allStatuses = [
    "PENDING",
    "UNSHIPPED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ];
  const orderStatusCounts: Record<string, number> = {};
  allStatuses.forEach((status) => {
    const found = rawOrderStatusCounts.find((order) => order._id === status);
    orderStatusCounts[status] = found ? found.count : 0;
  });

  // Revenue calculations (exclude CANCELLED & REFUNDED)

  const revenueData = await Order.aggregate([
    {
      $match: {
        ...match,
        status: { $nin: ["CANCELLED"] },
        paymentStatus: { $ne: "REFUNDED" },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$grandAmount" },
        totalRevenueWithoutTax: { $sum: "$totalPrice" },
        totalTax: { $sum: "$tax" },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  // Category-wise sales

  const categoryWise = await Order.aggregate([
    {
      $match: {
        ...match,
        status: { $nin: ["CANCELLED"] },
        paymentStatus: { $ne: "REFUNDED" },
      },
    },
    { $unwind: "$foods" },
    {
      $lookup: {
        from: "foods",
        localField: "foods.food",
        foreignField: "_id",
        as: "food",
      },
    },
    { $unwind: "$food" },
    {
      $lookup: {
        from: "categories",
        localField: "food.category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $match: filter.categoryId
        ? { "category._id": new Types.ObjectId(filter.categoryId) }
        : {},
    },
    {
      $group: {
        _id: "$category._id",
        categoryName: { $first: "$category.name" },
        totalOrders: { $sum: "$foods.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$foods.quantity", "$food.price"] },
        },
      },
    },
  ]);

  // Food-wise sales
  const foodWise = await Order.aggregate([
    {
      $match: {
        ...match,
        status: { $nin: ["CANCELLED"] },
        paymentStatus: { $ne: "REFUNDED" },
      },
    },
    { $unwind: "$foods" },
    {
      $lookup: {
        from: "foods",
        localField: "foods.food",
        foreignField: "_id",
        as: "food",
      },
    },
    { $unwind: "$food" },
    {
      $lookup: {
        from: "categories",
        localField: "food.category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $match: filter.categoryId
        ? { "category._id": new Types.ObjectId(filter.categoryId) }
        : {},
    },
    {
      $group: {
        _id: "$food._id",
        foodName: { $first: "$food.name" },
        categoryName: { $first: "$category.name" },
        totalOrders: { $sum: "$foods.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$foods.quantity", "$food.price"] },
        },
      },
    },
  ]);
  return {
    orderStatusCounts,
    revenueData,
    categoryWise,
    foodWise,
  };
};

interface UserDashboardFilter {
  startDate?: Date;
  endDate?: Date;
}

export const UserStatisticsFromDB = async (
  email: string,
  filter: UserDashboardFilter
) => {
  const user = await User.findOne({ email: email }).lean();
  if (!user) {
    throw new Error("User not found");
  }
  const match: any = {
    status: { $ne: "CANCELLED" }, // exclude cancelled
  };

  if (filter.startDate && filter.endDate) {
    match.createdAt = { $gte: filter.startDate, $lte: filter.endDate };
  }

  const result = await Order.aggregate([
    { $match: match },
    { $unwind: "$foods" },

    // populate food details
    {
      $lookup: {
        from: "foods",
        localField: "foods.food",
        foreignField: "_id",
        as: "food",
      },
    },
    { $unwind: "$food" },

    // populate category details
    {
      $lookup: {
        from: "categories",
        localField: "food.category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },

    // group by category
    {
      $group: {
        _id: "$category._id",
        categoryName: { $first: "$category.name" },
        totalOrders: { $sum: "$foods.quantity" },
        totalSpend: {
          $sum: { $multiply: ["$foods.quantity", "$food.price"] },
        },
      },
    },
  ]);

  // Separate aggregation for total spend, refund, tax, food-wise

  const totals = await Order.aggregate([
    { $match: match },
    { $unwind: "$foods" },
    {
      $lookup: {
        from: "foods",
        localField: "foods.food",
        foreignField: "_id",
        as: "food",
      },
    },
    { $unwind: "$food" },
    {
      $lookup: {
        from: "categories",
        localField: "food.category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },

    {
      $group: {
        _id: null,
        totalSpend: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "REFUNDED"] }, 0, "$grandAmount"],
          },
        },
        totalSpendWithoutTax: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "REFUNDED"] }, 0, "$totalPrice"],
          },
        },
        totalTax: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "REFUNDED"] }, 0, "$tax"],
          },
        },
        totalRefundAmount: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "REFUNDED"] }, "$grandAmount", 0],
          },
        },
        foodWise: {
          $push: {
            foodId: "$food._id",
            foodName: "$food.name",
            categoryName: "$category.name",
            quantity: "$foods.quantity",
            spend: { $multiply: ["$foods.quantity", "$food.price"] },
            refunded: {
              $cond: [{ $eq: ["$paymentStatus", "REFUNDED"] }, true, false],
            },
          },
        },
      },
    },
  ]);

  const foodWiseMap: Record<string, any> = {};
  if (totals[0]?.foodWise) {
    for (const food of totals[0].foodWise) {
      if (!foodWiseMap[food.foodId]) {
        foodWiseMap[food.foodId] = {
          foodName: food.foodName,
          categoryName: food.categoryName,
          totalOrders: 0,
          totalSpend: 0,
        };
      }
      if (!food.refunded) {
        foodWiseMap[food.foodId].totalOrders += food.quantity;
        foodWiseMap[food.foodId].totalSpend += food.spend;
      }
    }
  }

  return {
    totalSpend: totals[0]?.totalSpend || 0,
    totalSpendWithoutTax: totals[0]?.totalSpendWithoutTax || 0,
    totalTax: totals[0]?.totalTax || 0,
    totalRefundAmount: totals[0]?.totalRefundAmount || 0,
    categoryWise: result,
    foodWise: Object.values(foodWiseMap),
  };
};

export const DashboardServices = {
  AdminStatisticsFromDB,
  UserStatisticsFromDB,
};
