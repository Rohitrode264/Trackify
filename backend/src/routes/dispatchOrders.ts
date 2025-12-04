import express from 'express';
import mongoose from 'mongoose';
import { auth, authorize } from '../middlewares/auth.js';
import Order from '../models/order.js';
import { sendMail } from '../jobs/mailer.js';
import customer from '../models/customer.js';

const router = express.Router();

// 🚚 Get dispatch-ready orders
router.get('/', auth, authorize('dispatch', 'admin'), async (req, res) => {
  const orders = await Order.find({ status: 'ready_for_dispatch' }).populate('customer');
  res.json({ success: true, data: orders });
});

// 🚀 Dispatch order
router.post('/:id/dispatch', auth, authorize('dispatch', 'admin'), async (req, res) => {
  const { courierName, lrNumber, trackingNumber, trackingUrl } = req.body;
  const order = await Order.findById(req.params.id).populate('customer');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const customerId = order.customer;
  console.log(customerId);
  const customerDetails = await customer.findOne({ _id: customerId });
  // Convert string to ObjectId
  // const userId = new mongoose.Types.ObjectId(req.user!.id);

  // order.dispatchDetails = {
  //   courierName,
  //   lrNumber,
  //   trackingNumber,
  //   trackingUrl,
  //   dispatchDate: new Date(),
  //   dispatchedBy: userId
  // };

  // order.status = 'dispatched';
  // order.audit.push({ user: userId, action: 'dispatched order', at: new Date() });
  // await order.save();

  const email = customerDetails?.email || "";
  console.log(email);

  await sendMail(
    email,
    `Order ${order.orderId} Dispatched - Citspray Aroma Science`,
    `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Citspray Aroma Science</h2>
    <h3>Order Update: Dispatched</h3>
    <p>Hello ${customerDetails?.name},</p>
    <p>Your order <b>#${order.orderId}</b> has been dispatched successfully!</p>

    <div style="background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 6px;">
        <p><b>Tracking Number:</b> ${trackingNumber}</p>
        <p><b>Courier Service:</b> ${courierName}</p>
        <p>You can track your shipment here: 
            <a href="${trackingUrl}" style="color: #2563eb; text-decoration: none;">Track Package</a>
        </p>
    </div>

    <p>Thank you for shopping with us. We hope you enjoy your purchase!</p>
    
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px;">© 2024 Citspray Aroma Science. All rights reserved.</p>
</div>`
  );

  res.json({ success: true, data: customerDetails, order });
});

// 📦 Update order status (e.g., delivered)
router.patch('/:id/status', auth, authorize('dispatch', 'admin'), async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const userId = new mongoose.Types.ObjectId(req.user!.id);
  order.status = status;
  order.audit.push({ user: userId, action: `status changed to ${status}`, at: new Date() });
  await order.save();

  res.json({ success: true, data: order });
});

export default router;
