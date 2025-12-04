import express from 'express';
import User from '../models/user.js';
import { auth, authorize } from '../middlewares/auth.js';
import { sendMail } from '../jobs/mailer.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// POST /api/admin/create-user
router.post('/create-user', auth, authorize('admin'), async (req, res) => {
  const { name, email, password, role, department } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const hashedPass=await bcrypt.hash(password,10);
    console.log("helo0");
    const newUser = await User.create({
      name,
      email,
      password:hashedPass,
      role,
      department,
      createdBy: req.user!.id,
    });
    
    console.log("helo1");
    await sendMail(
      email,
      'Your OMS Login Credentials - Citspray Aroma Science',
`
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Citspray Aroma Science</h2>
    <h3>Welcome to OMS (Order Management System)</h3>
    <p>Hello ${name},</p>
    <p>Your OMS account has been created. Below are your login credentials:</p>
    
    <div style="background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 6px;">
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${password}</p>
        <p><b>Role:</b> ${role}</p>
    </div>
    
    <p>Please log in using the above credentials and change your password after your first login for security reasons.</p>
    <p>You can access the OMS portal at: 
        <a href="trackify.citspray.com" style="color: #2563eb; text-decoration: none;">trackify.citspray.com</a>
    </p>
    
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px;">© 2024 Citspray Aroma Science. All rights reserved.</p>
</div>
`

    );
    console.log("helo2");

    res.status(201).json({ message: 'User created & mailed', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err });
  }
});


// GET /api/admin/users
router.get('/users', auth, authorize('admin'), async (_req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// DELETE /api/admin/user/:id
router.delete('/user/:id', auth, authorize('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

export default router;
