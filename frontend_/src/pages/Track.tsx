import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, CheckCircle, Truck, Workflow } from 'lucide-react';
import Logo from '../components/Logo';
import { BaseUrl } from '../config/BaseUrl.config';
import { useParams, useNavigate } from 'react-router-dom';

type OrderStatus = 'created' | 'admin_review' | 'packed' | 'dispatched';

interface DispatchDetails {
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
}

interface BackendDispatchDetails {
  courierName: string;
  lrNumber: string;
  trackingNumber: string;
  dispatchDate: string;
  trackingUrl: string;
  dispatchedBy: string;
}

interface BackendResponse {
  orderStatus: OrderStatus;
  orderDispatchDetails?: BackendDispatchDetails;
}

const OrderTracking: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('created');
  const [orderDispatchDetails, setOrderDispatchDetails] = useState<DispatchDetails | undefined>(undefined);
  const [animatedStep, setAnimatedStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchTracking = async () => {
      try {
        setError('');
        const res = await axios.get<BackendResponse>(`${BaseUrl}/v1/orders/track/${orderId}`);
        setOrderStatus(res.data.orderStatus);

        if (res.data.orderStatus === 'dispatched' && res.data.orderDispatchDetails) {
          setOrderDispatchDetails({
            carrier: res.data.orderDispatchDetails.courierName,
            trackingNumber: res.data.orderDispatchDetails.trackingNumber,
            estimatedDelivery: new Date(res.data.orderDispatchDetails.dispatchDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            trackingUrl: res.data.orderDispatchDetails.trackingUrl
          });
        }
      } catch (err) {
        console.error("Tracking error:", err);
        setError('Unable to locate order. Please verify your Order ID.');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [orderId]);

  const statusConfig = {
    created: {
      label: 'Order Placed',
      description: 'Your order has been confirmed and is being prepared.',
      icon: CheckCircle,
      index: 0
    },
    admin_review: {
      label: 'Processing',
      description: 'We are verifying and preparing your order.',
      icon: Workflow,
      index: 1
    },
    packed: {
      label: 'Packed',
      description: 'Your order is packed and ready for dispatch.',
      icon: Package,
      index: 2
    },
    dispatched: {
      label: 'Dispatched',
      description: 'Your package is on its way to you.',
      icon: Truck,
      index: 3
    }
  };

  const currentStatusIndex = statusConfig[orderStatus].index;

  useEffect(() => {
    if (loading || !orderId) return;

    let step = 0;
    const interval = setInterval(() => {
      if (step <= currentStatusIndex) {
        setAnimatedStep(step);
        step++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [currentStatusIndex, loading, orderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchOrderId.trim()) {
      navigate(`/track/${searchOrderId.trim()}`);
      setSearchOrderId('');
    }
  };

  const statuses = Object.entries(statusConfig);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-300">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Logo />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4 border-slate-300">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Track Order</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder="Enter Order ID"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Track
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Tracking Card */}
        {orderId && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-4 text-white">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <p className="text-xs text-blue-100 mb-1">Order ID</p>
                  <p className="font-semibold text-lg">{orderId}</p>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{statusConfig[orderStatus].label}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4 sm:p-6">
              {statuses.map(([key, status], index) => {
                const Icon = status.icon;
                const isCompleted = animatedStep >= index;
                const isCurrent = currentStatusIndex === index;

                return (
                  <div key={key} className="relative mb-8 last:mb-0">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isCompleted
                              ? 'bg-linear-to-br from-blue-600 to-indigo-600 shadow-md scale-110'
                              : 'bg-gray-200 scale-90'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 transition-colors duration-500 ${
                              isCompleted ? 'text-white' : 'text-gray-400'
                            }`}
                          />
                        </div>

                        {index < statuses.length - 1 && (
                          <div className="w-0.5 h-16 mt-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`w-full bg-linear-to-b from-blue-600 to-indigo-600 transition-all duration-700 ${
                                animatedStep > index ? 'h-full' : 'h-0'
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className={`transition-all duration-500 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{status.label}</h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                Current
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{status.description}</p>

                          {/* Dispatch Details */}
                          {key === 'dispatched' && orderDispatchDetails && isCompleted && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                              <h4 className="text-sm font-semibold text-blue-900 mb-2">Shipping Details</h4>
                              <div className="space-y-1.5 text-xs">
                                {orderDispatchDetails.carrier && (
                                  <p className="text-blue-800">
                                    <span className="font-medium">Carrier:</span> {orderDispatchDetails.carrier}
                                  </p>
                                )}
                                {orderDispatchDetails.trackingNumber && (
                                  <p className="text-blue-800">
                                    <span className="font-medium">Tracking:</span> {orderDispatchDetails.trackingNumber}
                                  </p>
                                )}
                                {orderDispatchDetails.estimatedDelivery && (
                                  <p className="text-blue-800">
                                    <span className="font-medium">Dispatched:</span> {orderDispatchDetails.estimatedDelivery}
                                  </p>
                                )}
                                {orderDispatchDetails.trackingUrl && (
                                  <a
                                    href={orderDispatchDetails.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                  >
                                    Track with Carrier
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notice */}
            {orderStatus === 'dispatched' && (
              <div className="bg-amber-50 border-t border-amber-200 p-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">Tracking Update</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      This is temporary internal tracking. You will receive a detailed tracking link via email once the package is handed over to the delivery partner.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!orderId && !error && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Track Your Order</h2>
            <p className="text-sm text-gray-600">Enter your Order ID above to view tracking details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;