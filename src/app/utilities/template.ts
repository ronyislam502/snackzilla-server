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
        (item) => {
          const populatedItem = item as unknown as { food: { image: string; name: string; price: number }; quantity: number };
          return `
            <div style="display: flex; align-items: center; gap: 16px; padding: 12px; background: #111; border-radius: 12px; margin-bottom: 12px; border: 1px solid #1a1a1a;">
              <img src="${populatedItem.food.image}" alt="${populatedItem.food.name}" width="60" height="60" style="border-radius: 10px; object-fit: cover;"/>
              <div style="flex: 1;">
                <div style="color: #fff; font-weight: 600; font-size: 16px;">${populatedItem.food.name}</div>
                <div style="color: #b3b3b3; font-size: 14px;">Qty: ${populatedItem.quantity}</div>
              </div>
              <div style="color: #fff; font-weight: 700; font-size: 16px;">
                $${(populatedItem.food.price * populatedItem.quantity).toFixed(2)}
              </div>
            </div>`;
        }
      )
      .join("");

    orderDetailsHtml = `
      <div style="text-align: left; margin-top: 32px;">
        <h3 style="color: #fff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid #1a1a1a; padding-bottom: 8px;">Order Details</h3>
        <p style="color: #b3b3b3; margin-bottom: 20px;">Hi ${customer?.name}, your payment was ${status === "failed" ? "unsuccessful" : "successful"}.</p>
        <div style="margin-bottom: 24px;">
          ${foodList}
        </div>
        
        <div style="background: #111; padding: 20px; border-radius: 12px; border: 1px solid #1a1a1a;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #b3b3b3;">
            <span>Subtotal</span>
            <span>$${order.totalPrice.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #b3b3b3;">
            <span>Tax (10%)</span>
            <span>$${order.tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #1a1a1a; pt: 12px; margin-top: 12px; font-weight: 800; font-size: 20px; color: ${status === "failed" ? "#ff3333" : "#00ff80"};">
            <span>Grand Total</span>
            <span>$${order.grandAmount.toFixed(2)}</span>
          </div>
        </div>

        <p style="color: #666; font-size: 13px; margin-top: 20px; text-align: center;">Transaction ID: ${order.transactionId}</p>
        
        ${order.invoiceLink ? `
          <div style="margin-top: 24px; text-align: center;">
            <a href="${order.invoiceLink}" target="_blank" style="display: inline-block; padding: 12px 24px; border: 1px solid #333; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Download Invoice PDF</a>
          </div>` : ""}
      </div>
    `;
  }

  const isFailed = status === "failed";
  const themeColor = isFailed ? "#ff3333" : "#00ff80";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #000;
            color: #fff;
            margin: 0;
            padding: 0;
            line-height: 1.5;
          }
          .main-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #0a0a0a;
            border: 1px solid #1a1a1a;
            border-radius: 24px;
            padding: 48px;
            text-align: center;
          }
          .status-icon {
            font-size: 64px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 8px;
            color: ${themeColor};
          }
          .subtitle {
            color: #b3b3b3;
            font-size: 16px;
            margin-bottom: 32px;
          }
          .cta-button {
            display: block;
            margin-top: 40px;
            padding: 18px;
            background-color: ${themeColor};
            color: #000;
            text-decoration: none;
            border-radius: 14px;
            font-weight: 800;
            font-size: 16px;
            transition: opacity 0.2s;
          }
        </style>
      </head>
      <body>
        <div class="main-container">
          <div class="status-icon">
            ${isFailed ? "❌" : "✅"}
          </div>
          <h1 class="title">
            Payment ${isFailed ? "Failed" : "Successful"}
          </h1>
          <p class="subtitle">
            ${isFailed ? "We couldn't process your payment. Please try again." : "Thank you for your purchase! Your order is being prepared."}
          </p>
          
          ${orderDetailsHtml}
          
          <a href="${config?.client_url}" class="cta-button">
            ${isFailed ? "Retry Payment" : "Back to SnackZilla"}
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
    <div style="font-family: 'Inter', -apple-system, sans-serif; padding: 40px 20px; background: #000; color: #fff;">
      <div style="max-width: 600px; margin: auto; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 24px; padding: 48px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
        <div style="font-size: 64px; margin-bottom: 24px;">🎉</div>
        <h2 style="color: #00ff80; font-size: 32px; font-weight: 800; margin-bottom: 8px;">Payment Received!</h2>
        <p style="color: #b3b3b3; font-size: 16px; margin-bottom: 32px;">Hi ${customer?.name}, your snack delivery is being processed.</p>
        
        <div style="background: #111; padding: 24px; border-radius: 16px; border: 1px solid #1a1a1a; text-align: left; margin: 32px 0;">
          <p style="color: #fff; font-weight: 600; margin-bottom: 8px;">Order Reference</p>
          <p style="color: #666; font-family: monospace; font-size: 14px; margin: 0;">${transactionId}</p>
        </div>

        ${(order as { invoiceLink?: string }).invoiceLink ? `
          <div style="margin: 40px 0;">
            <a href="${(order as { invoiceLink?: string }).invoiceLink}" style="display: block; padding: 18px; background: #00ff80; color: #000; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 16px;">Download Your Invoice</a>
          </div>
        ` : `<p style="color: #666; font-size: 14px;">Preparing your invoice. We'll send it shortly.</p>`}
        
        <p style="color: #444; font-size: 13px; margin-top: 32px;">
          Thank you for choosing <strong>SnackZilla</strong>. Stay hungry!
        </p>
      </div>
    </div>
  `;
};
