import config from "../../config";
import { PAYMENT_STATUS } from "../order/order.interface";
import { Order } from "../order/order.model";
import { verifyPayment } from "./payment.utils";

const confirmPaymentIntoDB = async (transactionId: string, status: string) => {
  const verifiedRes = await verifyPayment(transactionId);

  if (verifiedRes && verifiedRes?.pay_status === "Successful") {
    await Order.findOneAndUpdate(
      { transactionId },
      {
        paymentStatus: PAYMENT_STATUS.PAID,
      },
      { new: true }
    );
  }

  const successTemplate = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .failed {
            color: #f44336;
          }
          .success {
            color: #4CAF50;
          }
          .redirect-link {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            color: #fff;
          }
          .failed-link {
            background-color: #f44336;
          }
          .success-link {
            background-color: #4CAF50;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="${status === "failed" ? "failed" : "success"}">
            Payment ${status === "failed" ? "Failed" : "Successful"}
          </h1>
          <a href="${config.client_live_url_page}"class="redirect-link ${status === "failed" ? "failed-link" : "success-link"}">
            ${status === "failed" ? "Retry Payment" : "Explore more"}
          </a>
        </div>
      </body>
    </html>
  `;

  console.log("tem", successTemplate);

  return successTemplate;
};

export const PaymentServices = {
  confirmPaymentIntoDB,
};
