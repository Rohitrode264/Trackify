import jwt from 'jsonwebtoken';
import type { IUser } from '../models/user.js';
export function createToken(user: IUser) {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}
