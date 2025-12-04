// routes/order.ts
import express from 'express';
import { auth, authorize } from '../middlewares/auth.js';
import { upload } from '../utils/cloudinary.js';
import * as orderController from '../controllers/order.js';

const router = express.Router();

// GET /api/v1/orders/:id - Get single order with role-based formulation visibility
router.get('/:id', auth, orderController.getOrder);

// GET /api/v1/orders - List orders with filters (date range, status, telecaller for admin)
router.get('/', auth, orderController.listOrders);

// POST /api/v1/orders - Telecaller creates order (status = created)
router.post('/', auth, authorize('telecaller','admin'), orderController.createOrder);

// PUT /api/v1/orders/:id - Admin edits or assigns formulation + change status
router.put('/:id', auth, authorize('admin'), orderController.updateOrder);

// POST /api/v1/orders/:id/assign-formulation - Admin assigns formulation per item
router.post('/:id/assign-formulation', auth, authorize('admin'), orderController.assignFormulation);

// POST /api/v1/orders/:id/pack - Packaging portal - upload images, packedBy, mark packed
router.post(
    '/:id/pack',
    auth,
    authorize('packaging', 'admin'),
    upload.array('images', 10),
    (req, _res, next) => {
        const files = (req.files as any[]) || [];
        if (files.length) {
            const imageUrls = files.map((f: any) => f.path || f.secure_url || f.url).filter(Boolean);
            if (imageUrls.length) {
                // Ensure controller receives images in body
                (req as any).body = { ...req.body, images: imageUrls };
            }
        }
        next();
    },
    orderController.packOrder
);

// POST /api/v1/orders/:id/dispatch - Dispatch portal - add courier, LR/tracking, set dispatched
router.post('/:id/dispatch', auth, authorize('dispatch','admin'), orderController.dispatchOrder);

// PATCH /api/v1/orders/:id/status - Change status (records audit)
router.patch('/:id/status', auth, authorize('admin', 'packaging', 'dispatch'), orderController.updateStatus);

// GET /api/v1/orders/:id/manifest - Return packed images, dispatch details for user email
router.get('/:id/manifest', auth, orderController.getManifest);

router.get('/track/:orderId',orderController.trackOrder);

export default router;

