import express from 'express';
import Customer from '../models/customer.js';
import Order from '../models/order.js'; 
import { auth, authorize } from '../middlewares/auth.js';
import type { Request, Response } from 'express';

const router = express.Router();

// 🔹 POST /api/v1/customers — create customer (telecaller & admin)
router.post('/', auth, authorize('admin', 'telecaller'), async (req: Request, res: Response) => {
  try {
    const { name, gst, billing, shipping, sameAsBilling, phones, email, remarks } = req.body;

    // Generate unique customer ID like CTS-0001
    const count = await Customer.countDocuments();
    const uniqueId = `CTS-${(count + 1).toString().padStart(4, '0')}`;

    const customer = await Customer.create({
      name,
      gst,
      billing,
      shipping,
      sameAsBilling,
      phones,
      email,
      remarks,
      uniqueId,
      createdBy: req.user!.id,
    });

    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (err) {
    res.status(500).json({ message: 'Error creating customer', error: err });
  }
});


// GET /api/customers?page=1&limit=10
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const customers = await Customer.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments();

    res.json({
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ message: 'Error fetching customers', error: err });
  }
});

router.get('/all', async (req: Request, res: Response) => {
  try {

    const total = await Customer.countDocuments();

    res.json({
      total
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ message: 'Error fetching customers', error: err });
  }
});




// 🔹 GET /api/v1/customers/:id — with order history
router.get('/:id', auth, authorize('admin', 'telecaller'), async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
    res.json({ customer, orderHistory: orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customer', error: err });
  }
});

// 🔹 PUT /api/v1/customers/:id — edit customer
router.put('/:id', auth, authorize('admin', 'telecaller'), async (req: Request, res: Response) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Customer not found' });

    res.json({ message: 'Customer updated successfully', customer: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating customer', error: err });
  }
});

export default router;
