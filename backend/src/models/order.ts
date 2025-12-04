// models/order.ts
import { Schema, model, Document, Types } from 'mongoose';

type GSTPercent = 0 | 5 | 12 | 18;
type OrderStatus = 'created' | 'admin_review' | 'packed' | 'dispatched' | 'delivered';

export interface IOrderItem {
  productName: string;
  qty: number;
  unit?: string;
  rate?: number;
  amount?: number;
  isGstApplicable: boolean;
  gstPercent?: GSTPercent;
  gstAmount?: number;
  // NEW: formulation fields (entered by Admin only)
  formulation?: string;                 // secret text entered by Admin per item
  formulationAddedBy?: Types.ObjectId;  // admin user id
  formulationAddedAt?: Date;
  formulationVisible?: boolean;         // per-item visibility toggle (defaults false)
  images?: string[];                    // packaging images per item (cloudinary urls)
}

export interface IOrder extends Document {
  orderId: string;
  customer: Types.ObjectId;
  createdBy: Types.ObjectId; // telecaller who created
  items: IOrderItem[];
  shippingCharge?: number;
  showFormulationToPackaging?: boolean; // order-level toggle set by admin
  modeOfDispatch?: string;
  status: OrderStatus;
  audit: Array<{ user: Types.ObjectId; action: string; at: Date }>;
  packagedBy?: string;
  packedImages?: string[]; // full order images
  dispatchDetails?: {
    courierName?: string;
    lrNumber?: string;
    trackingNumber?: string;
    dispatchDate?: Date;
    trackingUrl?: string;
    dispatchedBy?: Types.ObjectId;
  };
  totals: {
    subTotal: number;
    totalGst: number;
    shippingTax?: number;
    grandTotal: number;
  };
}

const OrderItemSchema = new Schema<IOrderItem>({
  productName: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  unit: { type: String },
  rate: { type: Number },
  amount: { type: Number },
  isGstApplicable: { type: Boolean, default: false },
  gstPercent: { type: Number, enum: [0,5,12,18], default: 0 },
  gstAmount: { type: Number, default: 0 },

  // formulation fields (admin only)
  formulation: { type: String, default: null }, // admin writes string here
  formulationAddedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  formulationAddedAt: { type: Date, default: null },
  formulationVisible: { type: Boolean, default: false },

  images: [{ type: String }]
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [OrderItemSchema], default: [] },

  shippingCharge: { type: Number, default: 0 },
  showFormulationToPackaging: { type: Boolean, default: false },

  modeOfDispatch: { type: String },
  status: { type: String, enum: ['created','admin_review','packed','dispatched','delivered'], default: 'created' },

  audit: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String },
    at: { type: Date, default: Date.now }
  }],

  packagedBy: { type: String },
  packedImages: [{ type: String }],

  dispatchDetails: {
    courierName: { type: String },
    lrNumber: { type: String },
    trackingNumber: { type: String },
    dispatchDate: { type: Date },
    trackingUrl: { type: String },
    dispatchedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },

  totals: {
    subTotal: { type: Number, required: true, default: 0 },
    totalGst: { type: Number, required: true, default: 0 },
    shippingTax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 }
  }
}, { timestamps: true });

export default model<IOrder>('Order', OrderSchema);
