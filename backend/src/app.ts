import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/adminUsers.js';
import customerRoutes from './routes/customer.js';
import orderRoutes from './routes/order.js';
import dotenv from 'dotenv';
import { dbConnect } from './srever.js';
const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/orders', orderRoutes);


dbConnect();
app.listen(process.env.PORT||5000,()=>{console.log(`Server running at ${process.env.PORT}`)
})

export default app;