import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';
import { Customer } from './pages/admin/Customer';
import { Order } from './pages/admin/Order';
import { CustomerDetails } from './pages/CustomerDetails';
import { AdminReview } from './pages/admin/AdminReview';
import { Packaging } from './pages/Packaging';
import { Dispatch } from './pages/Dispatch';
import { Home } from './pages/Home';
import { Governance } from './pages/Governance';
import { OmsDashboard } from './pages/admin/OmsDashboard';
import { Settings } from './pages/admin/Settings';
import { Finance } from './pages/admin/Finance';
import OrderTrackingPage from './pages/Track';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes with Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />

              {/* Telecaller Routes */}
              <Route path="dashboard" element={<OmsDashboard />} />
              <Route path="customers" element={<Customer />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="orders" element={<Order />} />

              {/* Admin Routes */}
              <Route path="admin/dashboard" element={<OmsDashboard />} />
              <Route path="review" element={<AdminReview />} />
              <Route path="admin/orders" element={<div />} />
              <Route path="admin/users" element={<div />} />
              <Route path="admin/governance" element={<Governance />} />
              <Route path="admin/settings" element={<Settings />} />
              <Route path="admin/finance" element={<Finance />} />
              {/* Packaging Routes */}
              <Route path="packaging" element={<Packaging />} />

              {/* Dispatch Routes */}
              <Route path="dispatch" element={<Dispatch />} />
            </Route>
            <Route path="track/:orderId" element={<OrderTrackingPage />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
