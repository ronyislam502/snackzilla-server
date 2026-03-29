import { PaymentServices } from '../modules/payment/payment.service';
import { Order } from '../modules/order/order.model';
import mongoose from 'mongoose';
import config from '../config';

async function verify() {
  await mongoose.connect(config.database_url as string);

  const order = await Order.findOne().populate('user').populate('foods.food');
  
  if (!order) {
    process.exit(0);
  }

  try {
    await PaymentServices.confirmPaymentIntoDB(order.transactionId, 'success');
    const updatedOrder = await Order.findById(order._id);
    
    if (updatedOrder?.invoiceLink) {
      console.log('SUCCESS: Invoice link generated and saved.');
    } else {
      console.log('FAILED: No invoice link found.');
    }

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
