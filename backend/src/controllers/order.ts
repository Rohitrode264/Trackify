// controllers/order.ts
import { type Request, type Response } from 'express';
import { Types } from 'mongoose';
import Order from '../models/order.js';
import Customer from '../models/customer.js';
import { sendMail } from '../jobs/mailer.js';
import customer from '../models/customer.js';
import order from '../models/order.js';

// Helper to calculate totals
function calculateTotals(items: any[], shippingCharge = 0) {
    let subTotal = 0;
    let totalGst = 0;

    items.forEach(item => {
        item.amount = (item.qty || 1) * (item.rate || 0);
        if (item.isGstApplicable && item.gstPercent !== undefined) {
            item.gstAmount = (item.amount * item.gstPercent) / 100;
            totalGst += item.gstAmount;
        } else {
            item.gstAmount = 0;
        }
        subTotal += item.amount;
    });

    const grandTotal = subTotal + totalGst + shippingCharge;

    return {
        subTotal,
        totalGst,
        shippingTax: shippingCharge,
        grandTotal
    };
}

// Generate order ID
async function generateOrderId(): Promise<string> {
    const count = (await Order.countDocuments()) || 0;
    const date = new Date().toISOString().split('T')[0]?.replace(/-/g, '') || '';
    return `ORD-${date}-${(count + 1).toString().padStart(4, '0')}`;
}

// Add audit log
function addAudit(order: any, userId: string, action: string) {
    order.audit.push({
        user: userId,
        action,
        at: new Date()
    });
}

// GET /api/v1/orders/:id
export async function getOrder(req: Request, res: Response) {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer')
            .populate('createdBy', 'name email')
            .populate('items.formulationAddedBy', 'name')
            .populate('dispatchDetails.dispatchedBy', 'name')
            .populate('audit.user', 'name role');

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Hide formulation based on user role and visibility settings
        const userRole = req.user?.role;
        if (userRole && userRole !== 'admin') {
            order.items.forEach((item: any) => {
                if (!item.formulationVisible) {
                    item.formulation = undefined;
                    item.formulationAddedBy = undefined;
                    item.formulationAddedAt = undefined;
                }
            });
        }

        res.json(order);
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching order', error: err.message });
    }
}

// GET /api/v1/orders
export async function listOrders(req: Request, res: Response) {
    try {
        const { from, to, status, telecaller, page = 1, limit = 10 } = req.query;
        const query: any = {};

        // Date range filter
        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from as string);
            if (to) query.createdAt.$lte = new Date(to as string);
        }

        // Status filter
        if (status) query.status = status;

        // Telecaller filter (admin only)
        if (telecaller && req.user?.role === 'admin') {
            query.createdBy = telecaller;
        }

        // Non-admin users can only see their own orders
        if (req.user?.role !== 'admin') {
            query.createdBy = req.user?.id;
        }

        const orders = await Order.find(query)
            .populate('customer', 'name phones email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip((+page - 1) * +limit)
            .limit(+limit);

        const total = await Order.countDocuments(query);

        res.json({
            data: orders,
            pagination: { total, page: +page, limit: +limit }
        });
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching orders', error: err.message });
    }
}

// POST /api/v1/orders - Create order (Telecaller)
export async function createOrder(req: Request, res: Response) {
    try {
      const { customer, items, shippingCharge = 0 } = req.body;
      if (!customer || !items) {
        return res.status(400).json({ message: 'Customer and items are required'});
      }
  
      const customerExists = await Customer.findById(customer);
      if (!customerExists) {
        return res.status(404).json({ message: 'Customer not found' });
      }
  
      const orderId = await generateOrderId();
      const totals = calculateTotals(items, shippingCharge);
  
      const order = await Order.create({
        orderId,
        customer,
        createdBy: req.user!.id,
        items,
        shippingCharge,
        status: 'created',
        totals,
        audit: [
          {
            user: req.user!.id,
            action: 'Order created',
            at: new Date()
          }
        ]
      });
  
      // Send confirmation email to customer
      await sendMail(
        customerExists.email!,
        `Order Confirmation - ${orderId}`,
        `<p>Dear ${customerExists.name},</p><p>Your order <strong>${orderId}</strong> has been successfully created.</p><p>Thank you for choosing us!</p>`
      );
  
      await order.populate('customer');
      res.status(201).json({ message: 'Order created successfully', order });
    } catch (err: any) {
      res.status(500).json({ message: 'Error creating order', error: err.message });
    }
  }
  

// PUT /api/v1/orders/:id - Update order (Admin)
export async function updateOrder(req: Request, res: Response) {
    try {
        const { status, modeOfDispatch } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (status) {
            order.status = status;
            addAudit(order, req.user!.id, `Status changed to ${status}`);
        }

        if (modeOfDispatch) order.modeOfDispatch = modeOfDispatch;

        await order.save();
        await order.populate('customer');
        res.json({ message: 'Order updated successfully', order });
    } catch (err: any) {
        res.status(500).json({ message: 'Error updating order', error: err.message });
    }
}

// POST /api/v1/orders/:id/assign-formulation - Assign formulation (Admin)
export async function assignFormulation(req: Request, res: Response) {
    try {
        const { itemIndex, formulation, formulationVisible = false } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (itemIndex === undefined || !formulation) {
            return res.status(400).json({ message: 'itemIndex and formulation are required' });
        }

        if (itemIndex < 0 || itemIndex >= order.items.length) {
            return res.status(400).json({ message: 'Invalid item index' });
        }

        const item = order.items[itemIndex];
        if (!item) return res.status(400).json({ message: 'Invalid item index' });

        item.formulation = formulation;
        item.formulationAddedBy = new Types.ObjectId(req.user!.id);
        item.formulationAddedAt = new Date();
        item.formulationVisible = formulationVisible;

        if (req.body.showFormulationToPackaging !== undefined) {
            order.showFormulationToPackaging = req.body.showFormulationToPackaging;
        }

        addAudit(order, req.user!.id, `Formulation assigned to item ${itemIndex + 1}`);

        await order.save();
        await order.populate('customer');
        res.json({ message: 'Formulation assigned successfully', order });
    } catch (err: any) {
        res.status(500).json({ message: 'Error assigning formulation', error: err.message });
    }
}

// POST /api/v1/orders/:id/pack - Packaging portal
export async function packOrder(req: Request, res: Response) {
    try {
        const { images, packagedBy } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (images) {
            if (order.packedImages) {
                order.packedImages.push(...images);
            } else {
                order.packedImages = images;
            }
        }

        if (packagedBy) order.packagedBy = packagedBy;

        // Update status to ready_for_dispatch if not already
        if (order.status === 'admin_review') {
            order.status = 'packed';
            addAudit(order, req.user!.id, 'Order ready for dispatch');
        }

        addAudit(order, req.user!.id, 'Order packed');

        await order.save();
        res.json({ message: 'Order packed successfully', order });
    } catch (err: any) {
        res.status(500).json({ message: 'Error packing order', error: err.message });
    }
}

// POST /api/v1/orders/:id/dispatch - Dispatch portal
export async function dispatchOrder(req: Request, res: Response) {
    try {
        const { courierName, lrNumber, trackingNumber, trackingUrl } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        const customerId=order.customer;
        const customerDetails=await customer.findOne({_id:customerId});

        order.dispatchDetails = {
            courierName,
            lrNumber,
            trackingNumber,
            trackingUrl,
            dispatchDate: new Date(),
            dispatchedBy: new Types.ObjectId(req.user!.id)
        };

        order.status = 'dispatched';
        addAudit(order, req.user!.id, 'Order dispatched');
        await order.save();
        await order.populate('customer');

        const email=customerDetails?.email ||"";

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
        
        res.json({ message: 'Order dispatched successfully', order });
    } catch (err: any) {
        res.status(500).json({ message: 'Error dispatching order', error: err.message });
    }
}

// PATCH /api/v1/orders/:id/status - Change status
export async function updateStatus(req: Request, res: Response) {
    try {
        const { status } = req.body;
    console.log(status);
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        addAudit(order, req.user!.id, `Status changed to ${status}`);

        await order.save();
        res.json({ message: 'Status updated successfully', order });
    } catch (err: any) {
        res.status(500).json({ message: 'Error updating status', error: err.message });
    }
}

// GET /api/v1/orders/:id/manifest - Get manifest
export async function getManifest(req: Request, res: Response) {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer')
            .populate('dispatchDetails.dispatchedBy', 'name');

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const manifest = {
            orderId: order.orderId,
            customer: order.customer,
            items: order.items.map((item: any) => ({
                productName: item.productName,
                qty: item.qty,
                images: item.images || []
            })),
            packedImages: order.packedImages || [],
            dispatchDetails: order.dispatchDetails,
            packagedBy: order.packagedBy,
            status: order.status
        };

        res.json(manifest);
    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching manifest', error: err.message });
    }
}


export const trackOrder=async (req:Request,res:Response)=>{
    try{
        const {orderId}=req.params;

        const response=await order.find({orderId});
        const orderStatus=response[0]?.status;
        
        if(orderStatus === "dispatched"){
            const orderDispatchDetails=response[0]?.dispatchDetails;
            return res.status(200).json({
                orderStatus:orderStatus,
                orderDispatchDetails
            })    
        }
        res.status(200).json({orderStatus:orderStatus});
        
    }
    catch(error){
        res.status(500).json({
            message:"Internal Server Error"
        })
    }

};

