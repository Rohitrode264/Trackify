import { Modal, ModalHeader } from './Modal';
import type { Order } from '../../hooks/useFetchOrders';

interface ViewOrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
}

export default function ViewOrderDetails({ isOpen, onClose, order }: ViewOrderDetailsProps) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader 
        title="Order Details"
        onClose={onClose}
      />
  <div className="p-6 space-y-6 overflow-auto max-h-[70vh]">
        {/* Order Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Order ID</label>
              <p className="font-medium text-gray-900">{order.orderId}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <p className="font-medium text-gray-900">{order.status}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Created At</label>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Last Updated</label>
              <p className="font-medium text-gray-900">
                {new Date(order.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="font-medium text-gray-900">{order.customer.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="font-medium text-gray-900">
                {order.customer.phones?.join(', ') || 'N/A'}
              </p>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium text-gray-900">{order.customer.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">{item.productName}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Quantity</label>
                    <p className="font-medium text-gray-900">{item.qty} {item.unit}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Rate</label>
                    <p className="font-medium text-gray-900">₹{item.rate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Amount</label>
                    <p className="font-medium text-gray-900">₹{item.amount}</p>
                  </div>
                  {item.isGstApplicable && (
                    <>
                      <div>
                        <label className="text-sm text-gray-600">GST %</label>
                        <p className="font-medium text-gray-900">{item.gstPercent}%</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">GST Amount</label>
                        <p className="font-medium text-gray-900">₹{item.gstAmount}</p>
                      </div>
                    </>
                  )}
                  {item.formulationVisible && item.formulation && (
                    <div className="col-span-3">
                      <label className="text-sm text-gray-600">Formulation</label>
                      <p className="font-medium text-gray-900">{item.formulation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{order.totals.subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST Total</span>
              <span className="font-medium">₹{order.totals.totalGst.toLocaleString()}</span>
            </div>
            {order.shippingCharge ? (
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">₹{order.shippingCharge.toLocaleString()}</span>
              </div>
            ) : null}
            <div className="flex justify-between pt-2 border-t font-semibold text-lg">
              <span>Grand Total</span>
              <span>₹{order.totals.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        {order.audit && order.audit.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
            <div className="space-y-3">
              {order.audit.map((entry, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                  <div>
                    <p className="text-gray-900">{entry.action}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}