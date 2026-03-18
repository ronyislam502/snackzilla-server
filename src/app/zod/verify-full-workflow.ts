import { PaymentServices } from '../modules/payment/payment.service';
import { Order } from '../modules/order/order.model';
import mongoose from 'mongoose';
import config from '../config';

async function verify() {
  await mongoose.connect(config.database_url as string);
  // console.log('Connected to DB');

  // Find a test order or create a mock one
  const order = await Order.findOne().populate('user').populate('foods.food');
  
  if (!order) {
    // console.log('No order found to test with.');
    process.exit(0);
  }

  // console.log('Testing with Order:', order.transactionId);

  try {
    
    
    // console.log('Simulating payment confirmation...');
    const result = await PaymentServices.confirmPaymentIntoDB(order.transactionId, 'success');
    
    const updatedOrder = await Order.findById(order._id);
    // console.log('Updated Order Invoice Link:', updatedOrder?.invoiceLink);
    
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
