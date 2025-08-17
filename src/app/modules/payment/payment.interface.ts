import { Types } from "mongoose";

export type TPayment = {
  user: Types.ObjectId;
  grandAmount: number;
  transactionId: string;
};
