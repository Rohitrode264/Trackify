import express from 'express';
import { auth, authorize } from '../middlewares/auth.js';
import Order from '../models/order.js';
import { upload } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

const router = express.Router();

// 📦 Get packaging orders
router.get('/', auth, authorize('packaging', 'admin'), async (req, res) => {
  const orders = await Order.find({ status: 'packaging' }).populate('customer');
  res.json({ success: true, data: orders });
});

// 🧾 Get order details
router.get('/:id', auth, authorize('packaging', 'admin'), async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer');
  if (!order) return res.status(404).json({ message: 'Not found' });

  if (!order.showFormulationToPackaging) {
    order.items.forEach((i: any) => (i.formulation = undefined));
  }

  res.json({ success: true, data: order });
});

// 📸 Upload packaging images
router.post('/:id/pack', auth, authorize('packaging', 'admin'), upload.array('images', 5), async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  const images = (req.files as Express.Multer.File[]).map(f => (f as any).path);
  order.packedImages = images;
  order.packagedBy = req.user!.id;
  order.status = 'packed';
  const userId=new mongoose.Types.ObjectId(req.user!.id);
  order.audit.push({ user: userId, action: 'packed order', at: new Date() });
  await order.save();

  res.json({ success: true, data: order });
});

export default router;
