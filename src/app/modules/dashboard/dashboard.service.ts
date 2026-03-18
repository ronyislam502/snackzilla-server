import { Order } from "../order/order.model";
import { Types } from "mongoose";
import { User } from "../user/user.model";
import { PAYMENT_STATUS } from "../order/order.interface";

// interface DashboardFilter {
//   startDate?: Date;
//   endDate?: Date;
//   categoryId?: string;
// }

// const calculateProgress = (current: number, prev: number) => {
//   if (prev > 0) return ((current - prev) / prev) * 100;
//   if (current > 0) return 100;
//   return 0;
// };

// const AdminStatisticsFromDB = async (filter: DashboardFilter) => {
//   // ==== Base Match ====
//   const match: any = {
//     status: {
//       $in: [
//         "PENDING",
//         "UNSHIPPED",
//         "SHIPPED",
//         "DELIVERED",
//         "CANCELLED",
//         "REFUNDED",
//       ],
//     },
//   };

//   if (filter.startDate && filter.endDate) {
//     match.createdAt = { $gte: filter.startDate, $lte: filter.endDate };
//   }

//   // ==== Order Status Counts ====
//   const rawOrderStatusCounts = await Order.aggregate([
//     { $match: match },
//     { $group: { _id: "$status", count: { $sum: 1 } } },
//   ]);

//   const allStatuses = [
//     "PENDING",
//     "UNSHIPPED",
//     "SHIPPED",
//     "DELIVERED",
//     "CANCELLED",
//     "REFUNDED",
//   ];
//   const orderStatusCounts: Record<string, number> = {};
//   allStatuses.forEach((status) => {
//     const found = rawOrderStatusCounts.find((order) => order._id === status);
//     orderStatusCounts[status] = found ? found.count : 0;
//   });

//   // ==== Revenue Calculations (exclude CANCELLED & REFUNDED) ====
//   const revenueData = await Order.aggregate([
//     {
//       $match: {
//         ...match,
//         status: { $nin: ["CANCELLED"] },
//         paymentStatus: { $ne: "REFUNDED" },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalRevenue: { $sum: "$grandAmount" },
//         totalRevenueWithoutTax: { $sum: "$totalPrice" },
//         totalTax: { $sum: "$tax" },
//         totalOrders: { $sum: 1 },
//       },
//     },
//   ]);

//   // ==== Daily Revenue + Progress ====
//   const dailyRevenue = await Order.aggregate([
//     {
//       $match: {
//         ...match,
//         status: { $nin: ["CANCELLED"] },
//         paymentStatus: { $ne: "REFUNDED" },
//       },
//     },
//     {
//       $group: {
//         _id: {
//           day: { $dayOfMonth: "$createdAt" },
//           month: { $month: "$createdAt" },
//           year: { $year: "$createdAt" },
//         },
//         totalRevenue: { $sum: "$grandAmount" },
//       },
//     },
//     { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
//   ]);

//   const dailyWithProgress = dailyRevenue.map((day, idx) => {
//     if (idx === 0) return { ...day, progress: 0 };
//     const prevRevenue = dailyRevenue[idx - 1].totalRevenue || 0;
//     return {
//       ...day,
//       progress: calculateProgress(day.totalRevenue, prevRevenue),
//     };
//   });

//   // ==== Monthly Revenue + Progress ====
//   const monthlyRevenue = await Order.aggregate([
//     {
//       $match: {
//         ...match,
//         status: { $nin: ["CANCELLED"] },
//         paymentStatus: { $ne: "REFUNDED" },
//       },
//     },
//     {
//       $group: {
//         _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
//         totalRevenue: { $sum: "$grandAmount" },
//       },
//     },
//     { $sort: { "_id.year": 1, "_id.month": 1 } },
//   ]);

//   const monthlyWithProgress = monthlyRevenue.map((month, idx) => {
//     if (idx === 0) return { ...month, progress: 0 };
//     const prevRevenue = monthlyRevenue[idx - 1].totalRevenue || 0;
//     return {
//       ...month,
//       progress: calculateProgress(month.totalRevenue, prevRevenue),
//     };
//   });

//   // ==== Yearly Revenue + Progress ====
//   const yearlyRevenue = await Order.aggregate([
//     {
//       $match: {
//         ...match,
//         status: { $nin: ["CANCELLED"] },
//         paymentStatus: { $ne: "REFUNDED" },
//       },
//     },
//     {
//       $group: {
//         _id: { year: { $year: "$createdAt" } },
//         totalRevenue: { $sum: "$grandAmount" },
//       },
//     },
//     { $sort: { "_id.year": 1 } },
//   ]);

//   const yearlyWithProgress = yearlyRevenue.map((year, idx) => {
//     if (idx === 0) return { ...year, progress: 0 };
//     const prevRevenue = yearlyRevenue[idx - 1].totalRevenue || 0;
//     return {
//       ...year,
//       progress: calculateProgress(year.totalRevenue, prevRevenue),
//     };
//   });

//   // ==== Category-wise sales ====
//   const categoryWiseRaw = await Order.aggregate([
//     {
//       $match: {
//         ...match,
//         status: { $nin: ["CANCELLED"] },
//         paymentStatus: { $ne: "REFUNDED" },
//       },
//     },
//     { $unwind: "$foods" },
//     {
//       $lookup: {
//         from: "foods",
//         localField: "foods.food",
//         foreignField: "_id",
//         as: "food",
//       },
//     },
//     { $unwind: "$food" },
//     {
//       $lookup: {
//         from: "categories",
//         localField: "food.category",
//         foreignField: "_id",
//         as: "category",
//       },
//     },
//     { $unwind: "$category" },
//     {
//       $match: filter.categoryId
//         ? { "category._id": new Types.ObjectId(filter.categoryId) }
//         : {},
//     },
//     {
//       $group: {
//         _id: "$category._id",
//         categoryName: { $first: "$category.name" },
//         totalOrders: { $sum: "$foods.quantity" },
//         totalRevenue: {
//           $sum: { $multiply: ["$foods.quantity", "$food.price"] },
//         },
//       },
//     },
//     { $sort: { totalRevenue: -1 } }, // Highest selling category first
//   ]);

//   const categoryWise = categoryWiseRaw.map((cat, idx) => {
//     if (idx === 0) return { ...cat, progress: 0 };
//     const prevRevenue = categoryWiseRaw[idx - 1].totalRevenue || 0;
//     return {
//       ...cat,
//       progress: calculateProgress(cat.totalRevenue, prevRevenue),
//     };
//   });

//   // ==== Food-wise sales ====
//   const foodWiseRaw = await Order.aggregate([
//     {
//       $match: {
//         ...match,
//         status: { $nin: ["CANCELLED"] },
//         paymentStatus: { $ne: "REFUNDED" },
//       },
//     },
//     { $unwind: "$foods" },
//     {
//       $lookup: {
//         from: "foods",
//         localField: "foods.food",
//         foreignField: "_id",
//         as: "food",
//       },
//     },
//     { $unwind: "$food" },
//     {
//       $lookup: {
//         from: "categories",
//         localField: "food.category",
//         foreignField: "_id",
//         as: "category",
//       },
//     },
//     { $unwind: "$category" },
//     {
//       $match: filter.categoryId
//         ? { "category._id": new Types.ObjectId(filter.categoryId) }
//         : {},
//     },
//     {
//       $group: {
//         _id: "$food._id",
//         foodName: { $first: "$food.name" },
//         categoryName: { $first: "$category.name" },
//         totalOrders: { $sum: "$foods.quantity" },
//         totalRevenue: {
//           $sum: { $multiply: ["$foods.quantity", "$food.price"] },
//         },
//       },
//     },
//     { $sort: { totalRevenue: -1 } }, // Highest selling food first
//   ]);

//   const foodWise = foodWiseRaw.map((food, idx) => {
//     if (idx === 0) return { ...food, progress: 0 };
//     const prevRevenue = foodWiseRaw[idx - 1].totalRevenue || 0;
//     return {
//       ...food,
//       progress: calculateProgress(food.totalRevenue, prevRevenue),
//     };
//   });

//   // ==== Return All Stats ====
//   return {
//     orderStatusCounts,
//     revenueData: revenueData[0] || {},
//     dailyRevenue: dailyWithProgress,
//     monthlyRevenue: monthlyWithProgress,
//     yearlyRevenue: yearlyWithProgress,
//     categoryWise,
//     foodWise,
//   };
// };


interface DashboardFilter {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}

const calculateProgress = (current: number, prev: number) => {
  if (prev > 0) return ((current - prev) / prev) * 100;
  if (current > 0) return 100;
  return 0;
};

const AdminStatisticsFromDB = async (filter: DashboardFilter) => {
  // ==== Base Match ====
  const match: any = {
    status: {
      $in: ["PENDING", "UNSHIPPED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"],
    },
  };

  if (filter.startDate && filter.endDate) {
    match.createdAt = { 
      $gte: new Date(filter.startDate as unknown as string), 
      $lte: new Date(filter.endDate as unknown as string) 
    };
  }

  // ==== Order Status Counts ====
  const rawOrderStatusCounts = await Order.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const allStatuses = ["PENDING", "UNSHIPPED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
  const orderStatusCounts: Record<string, number> = {};
  allStatuses.forEach((status) => {
    const found = rawOrderStatusCounts.find((order) => order._id === status);
    orderStatusCounts[status] = found ? found.count : 0;
  });

  // ==== Revenue Calculations (exclude CANCELLED & REFUNDED) ====
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

  // ==== Daily Revenue + Progress ====
  const dailyRevenue = await Order.aggregate([
    {
      $match: {
        ...match,
        status: { $nin: ["CANCELLED"] },
        paymentStatus: { $ne: "REFUNDED" },
      },
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalRevenue: { $sum: "$grandAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const dailyWithProgress = dailyRevenue.map((day, idx) => {
    if (idx === 0) return { ...day, progress: 0 };
    const prevRevenue = dailyRevenue[idx - 1].totalRevenue || 0;
    return { ...day, progress: calculateProgress(day.totalRevenue, prevRevenue) };
  });

  // ==== Weekly Revenue + Progress ====
  const weeklyRevenue = await Order.aggregate([
    {
      $match: {
        ...match,
        status: { $nin: ["CANCELLED"] },
        paymentStatus: { $ne: "REFUNDED" },
      },
    },
    {
      $group: {
        _id: {
          week: { $isoWeek: "$createdAt" },
          year: { $isoWeekYear: "$createdAt" },
        },
        totalRevenue: { $sum: "$grandAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
  ]);

  const weeklyWithProgress = weeklyRevenue.map((week, idx) => {
    if (idx === 0) return { ...week, progress: 0 };
    const prevRevenue = weeklyRevenue[idx - 1].totalRevenue || 0;
    return { ...week, progress: calculateProgress(week.totalRevenue, prevRevenue) };
  });

  // ==== Monthly Revenue + Progress ====
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        ...match,
        status: { $nin: ["CANCELLED"] },
        paymentStatus: { $ne: "REFUNDED" },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        totalRevenue: { $sum: "$grandAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthlyWithProgress = monthlyRevenue.map((month, idx) => {
    if (idx === 0) return { ...month, progress: 0 };
    const prevRevenue = monthlyRevenue[idx - 1].totalRevenue || 0;
    return { ...month, progress: calculateProgress(month.totalRevenue, prevRevenue) };
  });

  // ==== Yearly Revenue + Progress ====
  const yearlyRevenue = await Order.aggregate([
    {
      $match: {
        ...match,
        status: { $nin: ["CANCELLED"] },
        paymentStatus: { $ne: "REFUNDED" },
      },
    },
    {
      $group: {
        _id: { year: { $year: "$createdAt" } },
        totalRevenue: { $sum: "$grandAmount" },
      },
    },
    { $sort: { "_id.year": 1 } },
  ]);

  const yearlyWithProgress = yearlyRevenue.map((year, idx) => {
    if (idx === 0) return { ...year, progress: 0 };
    const prevRevenue = yearlyRevenue[idx - 1].totalRevenue || 0;
    return { ...year, progress: calculateProgress(year.totalRevenue, prevRevenue) };
  });

  // ==== Category-wise Sales ====
  const categoryWiseRaw = await Order.aggregate([
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
        totalRevenue: { $sum: { $multiply: ["$foods.quantity", "$food.price"] } },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  const categoryWise = categoryWiseRaw.map((cat, idx) => {
    if (idx === 0) return { ...cat, progress: 0 };
    const prevRevenue = categoryWiseRaw[idx - 1].totalRevenue || 0;
    return { ...cat, progress: calculateProgress(cat.totalRevenue, prevRevenue) };
  });

  // ==== Food-wise Sales ====
  const foodWiseRaw = await Order.aggregate([
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
        totalRevenue: { $sum: { $multiply: ["$foods.quantity", "$food.price"] } },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  const foodWise = foodWiseRaw.map((food, idx) => {
    if (idx === 0) return { ...food, progress: 0 };
    const prevRevenue = foodWiseRaw[idx - 1].totalRevenue || 0;
    return { ...food, progress: calculateProgress(food.totalRevenue, prevRevenue) };
  });

  // ==== Return All Stats ====
  return {
    orderStatusCounts,
    revenueData: revenueData[0] || {},
    dailyRevenue: dailyWithProgress,
    weeklyRevenue: weeklyWithProgress, // added weekly revenue
    monthlyRevenue: monthlyWithProgress,
    yearlyRevenue: yearlyWithProgress,
    categoryWise,
    foodWise,
  };
};



type TUserDashboardFilter = {
  startDate?: Date;
  endDate?: Date;
};

export const UserStatisticsFromDB = async (
  email: string,
  filter: TUserDashboardFilter
) => {
  // console.log("user", email);
  const user = await User.findOne({ email: email }).lean();
  if (!user) {
    throw new Error("User not found");
  }
  const match: any = {
    user: user._id,
    status: { $ne: "CANCELLED" }, // exclude cancelled
  };

  if (filter.startDate && filter.endDate) {
    match.createdAt = { 
      $gte: new Date(filter.startDate as unknown as string), 
      $lte: new Date(filter.endDate as unknown as string) 
    };
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
        _id: "$category._id",
        categoryName: { $first: "$category.name" },
        totalOrders: { $sum: "$foods.quantity" },
        totalSpend: {
          $sum: { $multiply: ["$foods.quantity", "$food.price"] },
        },
      },
    },
  ]);

  // ==== Daily Spend + Progress ====
  const dailySpend = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalSpend: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "REFUNDED"] }, 0, "$grandAmount"] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const dailyWithProgress = dailySpend.map((day, idx) => {
    if (idx === 0) return { ...day, progress: 0 };
    const prevSpend = dailySpend[idx - 1].totalSpend || 0;
    return { ...day, progress: calculateProgress(day.totalSpend, prevSpend) };
  });

  // ==== Weekly Spend + Progress ====
  const weeklySpend = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          week: { $isoWeek: "$createdAt" },
          year: { $isoWeekYear: "$createdAt" },
        },
        totalSpend: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "REFUNDED"] }, 0, "$grandAmount"] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
  ]);

  const weeklyWithProgress = weeklySpend.map((week, idx) => {
    if (idx === 0) return { ...week, progress: 0 };
    const prevSpend = weeklySpend[idx - 1].totalSpend || 0;
    return { ...week, progress: calculateProgress(week.totalSpend, prevSpend) };
  });

  // ==== Monthly Spend + Progress ====
  const monthlySpend = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        totalSpend: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "REFUNDED"] }, 0, "$grandAmount"] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthlyWithProgress = monthlySpend.map((month, idx) => {
    if (idx === 0) return { ...month, progress: 0 };
    const prevSpend = monthlySpend[idx - 1].totalSpend || 0;
    return { ...month, progress: calculateProgress(month.totalSpend, prevSpend) };
  });

  // ==== Yearly Spend + Progress ====
  const yearlySpend = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { year: { $year: "$createdAt" } },
        totalSpend: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "REFUNDED"] }, 0, "$grandAmount"] },
        },
      },
    },
    { $sort: { "_id.year": 1 } },
  ]);

  const yearlyWithProgress = yearlySpend.map((year, idx) => {
    if (idx === 0) return { ...year, progress: 0 };
    const prevSpend = yearlySpend[idx - 1].totalSpend || 0;
    return { ...year, progress: calculateProgress(year.totalSpend, prevSpend) };
  });

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
    dailySpend: dailyWithProgress,
    weeklySpend: weeklyWithProgress,
    monthlySpend: monthlyWithProgress,
    yearlySpend: yearlyWithProgress,
    categoryWise: result,
    foodWise: Object.values(foodWiseMap),
  };
};


export type TimeFilter = "daily" | "weekly" | "monthly" | "yearly";

const topSellingFoodsFromDB = async (filter?: TimeFilter) => {
  const now = new Date();
  let startDate: Date | null = null;

  if (filter) {
    switch (filter) {
      case "daily":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
  }

  const matchStage: any = {
    paymentStatus: { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.SUCCEEDED] },
  };

  if (startDate) {
    matchStage.createdAt = { $gte: startDate, $lte: now };
  }

  const topFoods = await Order.aggregate([
    { $match: matchStage },

    { $unwind: "$foods" },

    // 🔗 Lookup from Food collection
    {
      $lookup: {
        from: "foods", // collection name
        localField: "foods.food",
        foreignField: "_id",
        as: "food",
      },
    },
    { $unwind: "$food" },

    {
      $group: {
        _id: "$food._id",
        foodName: { $first: "$food.name" },
        price: { $first: "$food.price" },
        image: { $first: "$food.image" },
        totalQuantity: { $sum: "$foods.quantity" },
        totalRevenue: { $sum: { $multiply: ["$foods.quantity", "$food.price"] } },
      },
    },

    { $sort: { totalQuantity: -1 } },

    {
      $project: {
        _id: 0,
        foodId: "$_id",
        foodName: 1,
        image: 1,
        price: 1,
        totalQuantity: 1,
        totalRevenue: 1,
      },
    },
  ]);

  return topFoods;
};


export const DashboardServices = {
  AdminStatisticsFromDB,
  UserStatisticsFromDB,
  topSellingFoodsFromDB
};
