import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Package, 
  ClipboardList, 
  RefreshCw,
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingBag,
  Truck,
  CreditCard,
  FileText,
  IndianRupee
} from "lucide-react";
import Button from "../components/Button";
import { useOrders, type Order as FetchedOrder } from '../hooks/useFetchOrders';
import { useCustomerDetails } from "../hooks/useFetchCustomerDetails";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import ViewOrderDetails from "../components/PopUps/ViewOrderDetails";
import { StatusBadge } from "./admin/Order";

export const CustomerDetails: React.FC = () => {
  const searchId = useParams().id;
  const navigate = useNavigate();
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<FetchedOrder | null>(null);
  const { customerDetails, loading, error } = useCustomerDetails(searchId || "");

  const customer = customerDetails?.customer;
  const orders = customerDetails?.orderHistory || [];

  // Calculate stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.totals?.grandTotal || 0), 0);
  const completedOrders = orders.filter((order: any) => order.status === "delivered").length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
                <p className="text-sm text-gray-500 mt-1">
                  View complete customer information and order history
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              size="md"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-8 py-6">
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading customer details...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-red-50 rounded-full mb-4">
              <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {!loading && customer && (
          <div className="space-y-6">
            {/* Customer Info Card */}
            <section className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              {/* Header with Avatar */}
              <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                      {customer.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{customer.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">{customer.uniqueId}</p>
                      {customer.gst && (
                        <div className="flex items-center gap-1 mt-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">GST: {customer.gst}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                  )}
                  {customer.phones?.map((phone: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addresses */}
              <div className="px-6 py-4 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Building className="w-5 h-5 text-blue-600" />
                    Billing Address
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {customer.billing.addressLine1}
                    {customer.billing.addressLine2 && `, ${customer.billing.addressLine2}`}
                    <br />
                    {customer.billing.city}, {customer.billing.state}
                    <br />
                    {customer.billing.pincode}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Shipping Address
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {customer.shipping.addressLine1}
                    {customer.shipping.addressLine2 && `, ${customer.shipping.addressLine2}`}
                    <br />
                    {customer.shipping.city}, {customer.shipping.state}
                    <br />
                    {customer.shipping.pincode}
                  </p>
                </div>
              </div>
            </section>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <IndianRupee className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{completedOrders}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Order History */}
            <section className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                  Order History
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({orders.length} {orders.length === 1 ? 'order' : 'orders'})
                  </span>
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No orders found</p>
                  <p className="text-gray-400 text-sm mt-1">This customer hasn't placed any orders yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((order: any) => (
                    <div
                      key={order._id}
                      className="p-6 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{order.orderId}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-500 text-xs">Total Amount</p>
                            <p className="font-semibold text-gray-900">
                              ₹{order.totals?.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-500 text-xs">Items</p>
                            <p className="font-semibold text-gray-900">{order.items.length}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-500 text-xs">Shipping</p>
                            <p className="font-semibold text-gray-900">
                              ₹{order.shippingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-500 text-xs">Subtotal</p>
                            <p className="font-semibold text-gray-900">
                              ₹{order.totals?.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      <ViewOrderDetails
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder || undefined}
      />
    </div>
  );
};