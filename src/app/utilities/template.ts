import config from "../config";
import { TOrder } from "../modules/order/order.interface";
import { User } from "../modules/user/user.model";

export const paymentSuccessTemplate = async (
  status: string,
  order?: TOrder
) => {
  let orderDetailsHtml = "";

  if (order) {
    const customer = await User.findById(order.user);

    // Food items as list
    const foodList = order.foods
      .map(
        (item: any) =>
          `<li style="margin-bottom:15px; display:flex; align-items:center;">
             <img src="${item.food.image}" alt="${item.food.name}" width="50" height="50" style="border-radius:5px; margin-right:15px;"/>
             <div>
               <strong>${item.food.name}</strong> x${item.quantity}<br/>
               $${(item.food.price * item.quantity).toFixed(2)}
             </div>
           </li>`
      )
      .join("");

    orderDetailsHtml = `
      <p>Hi ${customer?.name},</p>
      <p>Your payment has been ${status === "failed" ? "unsuccessful" : "successful"}. Here are the order details:</p>
      <ul style="list-style:none; padding:0; margin:0 0 20px 0;">
        ${foodList}
      </ul>
      <p><b>Total Price:</b> $${order.totalPrice.toFixed(2)}</p>
      <p><b>Tax (10%):</b> $${order.tax.toFixed(2)}</p>
      <p><b>Grand Total:</b> $${order.grandAmount.toFixed(2)}</p>
      <p><b>OrderNo:</b> ${order.transactionId}</p>
      ${order.invoiceLink ? `<p><a href="${order.invoiceLink}" target="_blank" style="display:inline-block; margin-top:10px; padding:8px 15px; background:#1e3a8a; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;">Download Invoice</a></p>` : ""}
    `;
  }

  return `
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
            max-width: 600px;
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
          ${orderDetailsHtml}
          <a href="${config?.client_live_url_page}" class="redirect-link ${status === "failed" ? "failed-link" : "success-link"}">
            ${status === "failed" ? "Retry Payment" : "Explore more"}
          </a>
        </div>
      </body>
    </html>
  `;
};

export const paymentEmailTemplate = async (order: TOrder) => {
  const { user, transactionId } = order;

  const customer = await User.findById(user);

  return `
    <div style="font-family: Arial; padding:20px; background:#f4f4f4;">
      <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1); text-align: center;">
        <h2 style="color:#4CAF50;">Payment Successful 🎉</h2>
        <p>Hi ${customer?.name},</p>
        <p>Your payment has been received. You can now download your invoice using the link below:</p>
        
        ${(order as any).invoiceLink ? `
          <div style="margin: 30px 0;">
            <a href="${(order as any).invoiceLink}" style="display:inline-block; padding:12px 25px; background:#1e3a8a; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold; font-size: 16px;">Download Your Invoice</a>
          </div>
        ` : "<p>Preparing your invoice. Please check back soon.</p>"}
        
        <p style="color: #718096; font-size: 12px; margin-top: 20px;">Order Reference: ${transactionId}</p>
        <p>Thank you for ordering with SnackZilla!</p>
      </div>
    </div>
  `;
};
