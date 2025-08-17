import { Request, Response } from "express";
import { PaymentServices } from "./payment.service";

const confirmPayment = async (req: Request, res: Response) => {
  const { transactionId, status } = req.query;

  const result = await PaymentServices.confirmPaymentIntoDB(
    transactionId as string,
    status as string
  );

  res.send(result);
};

export const PaymentControllers = { confirmPayment };
