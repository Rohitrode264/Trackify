// models/user.ts
import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { Role } from '../types.js';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
  createdBy?: Schema.Types.ObjectId; // admin who created
  resetPasswordOTP?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'telecaller', 'packaging', 'dispatch'], required: true },
  department: { type: String },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });


export default model<IUser>('User', UserSchema);
