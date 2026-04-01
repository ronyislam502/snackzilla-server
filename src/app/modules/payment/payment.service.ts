import sendEmail from "../../utilities/sendEmail";
import {
  paymentEmailTemplate,
  paymentSuccessTemplate,
} from "../../utilities/template";
import { ORDER_STATUS, PAYMENT_STATUS, TOrder } from "../order/order.interface";
import { Order } from "../order/order.model";
import { User } from "../user/user.model";
import { verifyPayment } from "./payment.utils";
import { generateInvoicePDF, TPopulatedOrder } from "../order/order.utils";
import { uploadToCloudinary } from "../../config/cloudinary.config";

const confirmPaymentIntoDB = async (transactionId: string, status: string) => {
  let order: TPopulatedOrder | null = null;

  try {
    const verifiedRes = await verifyPayment(transactionId);

    if (verifiedRes && verifiedRes?.pay_status === "Successful") {
      order = (await Order.findOneAndUpdate(
        { transactionId },
        {
          paymentStatus: PAYMENT_STATUS.PAID,
          status: ORDER_STATUS.UNSHIPPED,
        },
        { new: true, runValidators: true }
      )
        .populate("user", "name email address phone")
        .populate({ path: "foods.food", select: "name price image" })) as unknown as TPopulatedOrder;

      if (order?.user) {
        const customer = await User.findById(order?.user);
        
        // Generate PDF Buffer
        const pdfBuffer = await generateInvoicePDF(order);
        
        // Upload to Cloudinary
        const uploadResult = (await uploadToCloudinary(pdfBuffer, `invoice_${transactionId}`)) as { secure_url: string };
        
        // Save Link to Order
        await Order.findByIdAndUpdate((order as TPopulatedOrder)._id, { invoiceLink: uploadResult.secure_url });
        (order as TPopulatedOrder).invoiceLink = uploadResult.secure_url;

        const emailHtml = await paymentEmailTemplate(order as unknown as TOrder);
        sendEmail(customer?.email as string, "Payment success", emailHtml);

        // Simulation: Mark as SHIPPED after 1 minute, then DELIVERED after another 1 minute
        setTimeout(async () => {
          try {
            await Order.findByIdAndUpdate((order as TPopulatedOrder)?._id, {
              status: ORDER_STATUS.SHIPPED,
              $push: { statusHistory: { status: ORDER_STATUS.SHIPPED, updatedAt: new Date() } }
            });

            setTimeout(async () => {
              try {
                await Order.findByIdAndUpdate((order as TPopulatedOrder)?._id, {
                  status: ORDER_STATUS.DELIVERED,
                  $push: { statusHistory: { status: ORDER_STATUS.DELIVERED, updatedAt: new Date() } }
                });
              } catch (err) {
                console.error("Simulation Delivery update error:", err);
              }
            }, 60000); // 1 minute later -> DELIVERED (Total 2 minutes)
          } catch (err) {
            console.error("Simulation Shipping update error:", err);
          }
        }, 60000); // 1 minute later -> SHIPPED
      }
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
  }

  return paymentSuccessTemplate(status, order as unknown as TOrder);
};

export const PaymentServices = {
  confirmPaymentIntoDB,
};
