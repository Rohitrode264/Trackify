import express from 'express';
import mongoose from 'mongoose';
import { auth, authorize } from '../middlewares/auth.js';
import Order from '../models/order.js';
import { sendMail } from '../jobs/mailer.js';

const router = express.Router();

//   GET /api/v1/orders — Admin only (filters)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, telecaller, startDate, endDate } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (telecaller) filter.createdBy = telecaller;
    if (startDate && endDate)
      filter.createdAt = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };

    const orders = await Order.find(filter)
      .populate('customer')
      .populate('createdBy')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===============================
   🧾 GET /api/v1/orders/:id — Full details
================================ */
router.get('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('createdBy');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===============================
   ✏️ PUT /api/v1/orders/:id — Edit or change status
================================ */
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, showFormulationToPackaging } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status) order.status = status;
    if (showFormulationToPackaging !== undefined)
      order.showFormulationToPackaging = showFormulationToPackaging;

    order.audit.push({
      user: new mongoose.Types.ObjectId(req.user!.id),
      action: 'admin updated order',
      at: new Date(),
    });

    await order.save();
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===============================
   🧪 POST /api/v1/orders/:id/assign-formulation
================================ */
router.post('/:id/assign-formulation', auth, authorize('admin'), async (req, res) => {
  try {
    const { itemIndex, formulation, visible } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.items[itemIndex]) {
      order.items[itemIndex].formulation = formulation;
      order.items[itemIndex].formulationVisible = visible;
      order.items[itemIndex].formulationAddedBy = new mongoose.Types.ObjectId(req.user!.id);
      order.items[itemIndex].formulationAddedAt = new Date();
    }

    order.showFormulationToPackaging=visible;

    order.audit.push({
      user: new mongoose.Types.ObjectId(req.user!.id),
      action: 'formulation assigned',
      at: new Date(),
    });


    await order.save();
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===============================
   🔁 PATCH /api/v1/orders/:id/status — Change status
================================ */
router.patch('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.audit.push({
      user: new mongoose.Types.ObjectId(req.user!.id),
      action: `status changed to ${status}`,
      at: new Date(),
    });

    await order.save();
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===============================
   📦 GET /api/v1/orders/:id/manifest — Send via Email
================================ */
router.get('/:id/manifest', auth, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const customer: any = order.customer;
    const customerName = customer?.name ?? 'Unknown Customer';
    const customerEmail = customer?.email ?? '';

    const html = `
      <h3>Order Manifest - ${order.orderId}</h3>
      <p>Customer: ${customerName}</p>
      <p>Status: ${order.status}</p>
      <p>Tracking: ${order.dispatchDetails?.trackingNumber || 'N/A'}</p>
    `;

    if (customerEmail) {
      await sendMail(customerEmail, `Manifest for ${order.orderId}`, html);
    }

    res.json({ success: true, message: 'Manifest sent via email' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
