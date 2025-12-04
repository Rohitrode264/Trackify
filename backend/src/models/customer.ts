// models/customer.ts
import { Schema, model, Document } from 'mongoose';
import { type Address } from '../types.js';

export interface ICustomer extends Document {
    name: string;
    gst?: string;
    billing: Address;
    shipping: Address;
    sameAsBilling: boolean;
    phones: string[];
    email?: string;
    remarks?: string;
    uniqueId: string; // e.g. CTS-0001
    createdBy: Schema.Types.ObjectId; // telecaller
}

const CustomerSchema = new Schema<ICustomer>({
    name: { type: String, required: true },
    gst: { type: String },
    billing: { type: Object, required: true },
    shipping: { type: Object, required: true },
    sameAsBilling: { type: Boolean, default: false },
    phones: [String],
    email: String,
    remarks: String,
    uniqueId: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default model<ICustomer>('Customer', CustomerSchema);
