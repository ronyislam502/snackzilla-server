import { Types } from "mongoose";

export const ORDER_STATUS = {
  PENDING: "PENDING",
  UNSHIPPED: "UNSHIPPED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  SUCCEEDED: "SUCCEEDED",
  REFUNDED: "REFUNDED",
  CANCELED: "CANCELED",
} as const;

export type TOrder = {
  user: Types.ObjectId;
  foods: { food: Types.ObjectId; quantity: number }[];
  tax: number;
  totalPrice: number;
  totalQuantity: number;
  grandAmount: number;
  status: keyof typeof ORDER_STATUS;
  paymentStatus: keyof typeof PAYMENT_STATUS;
  transactionId: string;
};
