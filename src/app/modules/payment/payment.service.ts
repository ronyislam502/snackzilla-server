import sendEmail from "../../utilities/sendEmail";
import {
  paymentEmailTemplate,
  paymentSuccessTemplate,
} from "../../utilities/template";
import { ORDER_STATUS, PAYMENT_STATUS, TOrder } from "../order/order.interface";
import { Order } from "../order/order.model";
import { User } from "../user/user.model";
import { verifyPayment } from "./payment.utils";

const confirmPaymentIntoDB = async (transactionId: string, status: string) => {
  let order;

  try {
    const verifiedRes = await verifyPayment(transactionId);

    if (verifiedRes && verifiedRes?.pay_status === "Successful") {
      order = await Order.findOneAndUpdate(
        { transactionId },
        {
          paymentStatus: PAYMENT_STATUS.PAID,
          status: ORDER_STATUS.UNSHIPPED,
        },
        { new: true, runValidators: true }
      )
        .populate("user", "name email")
        .populate({ path: "foods.food", select: "name price image" });

      if (order?.user) {
        const customer = await User.findById(order?.user);
        const emailHtml = await paymentEmailTemplate(order);
        sendEmail(customer?.email as string, "Payment success", emailHtml);
      }
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
  }

  return paymentSuccessTemplate(status, order as TOrder);
};

export const PaymentServices = {
  confirmPaymentIntoDB,
};
