/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import config from "../../config";
import dotenv from "dotenv";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import { TPayment } from "./payment.interface";

dotenv.config();

export const initiatePayment = async (paymentData: TPayment) => {
  const customer = await User.findById(paymentData?.user);

  // console.log("customer", customer)
  const address = customer?.address
    ? `${customer?.address?.street}, ${customer?.address?.city}-${customer?.address?.postalCode}, ${customer?.address?.state}, ${customer.address.country}`
    : "";
  try {
    // console.log("Initiating payment with data:", {
    //   store_id: config.store_id,
    //   tran_id: paymentData?.transactionId,
    //   amount: paymentData?.grandAmount,
    //   cus_email: customer?.email,
    // });

    const response = await axios.post(config.payment_url as string, {
      store_id: config.store_id,
      signature_key: config.signature_key,
      tran_id: paymentData?.transactionId,
      success_url: `${config?.live_url_server}/api/payments/confirm?transactionId=${paymentData?.transactionId}&status=success`,
      fail_url: `${config?.live_url_server}/api/payments/confirm?status=failed`,
      cancel_url: config.client_live_url_page,
      desc: "Merchant Registration Payment",
      amount: paymentData?.grandAmount,
      currency: "BDT",
      cus_name: customer?.name,
      cus_email: customer?.email,
      cus_phone: customer?.phone,
      cus_add1: address || "N/A",
      cus_add2: "N/A",
      cus_street: customer?.address?.street || "N/A",
      cus_city: customer?.address?.city || "N/A",
      cus_state: customer?.address?.state || "N/A",
      cus_postcode: customer?.address?.postalCode || "N/A",
      cus_country: customer?.address?.country || "N/A",
      type: "json",
    });

    if (response.data && response.data.result !== "true") {
        console.error("Aamarpay Error:", response.data);
    }

    return response?.data?.payment_url;
  } catch (err: any) {
    throw new AppError(httpStatus.FORBIDDEN, "Payment initiation failed!");
  }
};

export const verifyPayment = async (transactionId: string) => {
  const response = await axios.get(config.payment_verify_url as string, {
    params: {
      store_id: config.store_id,
      signature_key: config.signature_key,
      request_id: transactionId,
      type: "json",
    },
  });

  return response?.data;
};
