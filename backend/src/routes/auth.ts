import express, { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import user from '../models/user.js';
import bcrypt from 'bcryptjs';
import { sendMail } from '../jobs/mailer.js';
import crypto from 'crypto';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

router.post('/signupman', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);
    const response = user.create({
      name, email, password: hashedPass,
      role, department
    });
    if (!response)
      res.status(500).json({ message: "Couldn't process the request at the moment." });

    res.status(200).json({
      Message: "User Created"
    })
  }
  catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error
    })
  }

})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP in user document (you might want to add OTP fields to user schema)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP via email
    await sendMail(
      email,
      'Password Reset OTP - Trackify by Citspray',
      `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Trackify by Citspray</h2>
                <h3>Password Reset Request</h3>
                <p>Hello ${user.name},</p>
                <p>You requested to reset your password. Use the following OTP to proceed:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 4px; margin: 0;">${otp}</h1>
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">© 2024 Citspray Aroma Science. All rights reserved.</p>
            </div>
            `
    );

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate temporary token for password reset
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.json({
      message: 'OTP verified successfully',
      resetToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET!) as any;

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordOTP = '';
    user.resetPasswordExpires = new Date(0);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
});

export default router;
