import express from 'express';
import { auth, authorize } from '../middlewares/auth.js';
import Order from '../models/order.js';
import Customer from '../models/customer.js';
import { calcOrderTotals } from '../helper/orderCalculation.js';

const router = express.Router();

// 📦 Create new order (Telecaller)
router.post('/', auth, authorize('telecaller', 'admin'), async (req, res) => {
  try {
    const { customer, items, shippingCharge, isOrderGstApplicable } = req.body;

    if (!customer || !items?.length)
      return res.status(400).json({ success: false, message: 'Customer and items are required' });

    // Calculate totals
    const totals = calcOrderTotals(items, shippingCharge, isOrderGstApplicable);

    // Generate new orderId
    const count = await Order.countDocuments();
    const orderId = `ORD-${String(count + 1).padStart(4, '0')}`;

    const order = await Order.create({
      orderId,
      customer,
      createdBy: req.user!.id,
      items,
      shippingCharge,
      totals,
      status: 'created',
      audit: [{ user: req.user!.id, action: 'created order', at: new Date() }],
    });

    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔍 Get all orders for telecaller
router.get('/', auth, authorize('telecaller', 'admin'), async (req, res) => {
  try {
    const filter: any = { createdBy: req.user!.id };
    const { startDate, endDate, status } = req.query;
    if (status) filter.status = status;
    if (startDate && endDate)
      filter.createdAt = { $gte: startDate, $lte: endDate };

    const orders = await Order.find(filter).populate('customer');
    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🧾 Get one order (role-based formulation visibility)
router.get('/:id', auth, authorize('telecaller', 'admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer createdBy');
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user!.role === 'telecaller') {
      order.items.forEach((item: any) => {
        if (!item.formulationVisible) item.formulation = undefined;
      });
    }

    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
