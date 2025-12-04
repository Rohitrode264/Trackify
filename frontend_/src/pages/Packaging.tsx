import { useState, useEffect } from "react";
import axios from "axios";
import Button from "../components/Button";
import {
  Package,
  Upload,
  User,
  Phone,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  PackageCheck,
  Clock,
  Download,
} from "lucide-react";
import { BaseUrl } from "../config/BaseUrl.config";
import { generateOrderBillPDF } from "../utils/pdfGenerator";
import type { Order as FullOrder } from "../hooks/useFetchOrders";

// ================================
//          TYPES
// ================================
interface OrderItem {
  productName: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  isGstApplicable?: boolean;
  gstPercent?: number;
  gstAmount?: number;
  formulation?: string | null;
  images?: string[];
}

interface Order {
  _id: string;
  orderId: string;
  customer: {
    _id?: string;
    name: string;
    phones?: string[];
    email?: string;
  };
  items: OrderItem[];
  status: string;
  packedImages: string[];
  createdAt: string;
  totals?: {
    subTotal: number;
    totalGst: number;
    shippingTax?: number;
    grandTotal: number;
  };
  shippingCharge?: number;
}

// ================================
//          ORDER CARD (MOBILE FIRST)
// ================================
const OrderCard = ({ order, onPackage }: { order: Order; onPackage: any }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">
              {order.orderId}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <span className="flex items-center px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
          <Clock className="w-3.5 h-3.5 mr-1" />
          Packaging
        </span>
      </div>

      {/* CUSTOMER INFO */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {order.customer.name}
          </span>
        </div>

        {order.customer.phones?.[0] && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {order.customer.phones[0]}
            </span>
          </div>
        )}
      </div>

      {/* ITEMS */}
      <div className="flex items-center gap-2 mb-5">
        <ShoppingBag className="w-4 h-4 text-gray-400" />
        <p className="text-sm text-gray-600">
          {order.items.length} items to pack
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="md"
          className="flex-1 py-2 text-sm font-medium rounded-lg flex justify-center gap-2 border-gray-300 hover:bg-green-50 hover:text-green-600 hover:border-green-400"
          onClick={(e) => {
            e.stopPropagation();
            // Convert to FullOrder format for PDF
            const subtotal = order.items.reduce((sum, item) => sum + (item.amount || 0), 0);
            const totalGst = order.items.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
            const shippingCharge = order.shippingCharge || 0;
            const grandTotal = order.totals?.grandTotal || subtotal + totalGst + shippingCharge;

            const fullOrder: FullOrder = {
              ...order,
              customer: {
                _id: order.customer._id || '',
                name: order.customer.name,
                phones: order.customer.phones,
                email: order.customer.email,
              },
              items: order.items.map((item) => ({
                productName: item.productName,
                qty: item.qty,
                unit: item.unit,
                rate: item.rate,
                amount: item.amount,
                isGstApplicable: item.isGstApplicable ?? false,
                gstPercent: item.gstPercent ?? 0,
                gstAmount: item.gstAmount ?? 0,
                formulation: item.formulation ?? null,
                images: item.images ?? [],
              })),
              totals: order.totals ? {
                subTotal: order.totals.subTotal,
                totalGst: order.totals.totalGst,
                shippingTax: order.totals.shippingTax ?? 0,
                grandTotal: order.totals.grandTotal,
              } : {
                subTotal: subtotal,
                totalGst: totalGst,
                shippingTax: 0,
                grandTotal: grandTotal,
              },
              shippingCharge: shippingCharge,
              createdBy: { _id: '', name: '', email: '' },
              showFormulationToPackaging: false,
              audit: [],
              updatedAt: order.createdAt, // Use createdAt as fallback for updatedAt
            };
            generateOrderBillPDF(fullOrder);
          }}
        >
          <Download className="w-4 h-4" />
          Download Bill
        </Button>
        <Button
          variant="primary"
          size="md"
          className="flex-1 py-2 text-base font-medium rounded-lg flex justify-center gap-2"
          onClick={() => onPackage(order)}
        >
          <Camera className="w-5 h-5" />
          Start Packaging
        </Button>
      </div>
    </div>
  );
};

// ================================
//          PACKAGING MODAL
// ================================
const PackagingModal = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setPreviewUrls([]);
      setError("");
    }
  }, [isOpen]);

  // add image
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length + files.length > 5) {
      setError("Max 5 images allowed");
      return;
    }

    setSelectedFiles((p) => [...p, ...files]);

    files.forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setPreviewUrls((p) => [...p, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  // upload
  const handleSubmit = async (orderId: string) => {
    if (selectedFiles.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("images", file));

      await axios.post(
        `${BaseUrl}/v1/orders/${order?._id}/pack`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: localStorage.getItem("auth_token"),
          },
        }
      );
      const status="packed";
      await axios.patch(`${BaseUrl}/v1/orders/${orderId}/status`,
        {status},
        {
          headers: {
            Authorization: localStorage.getItem('auth_token')
          }
        })
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50">
      <div className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-300 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PackageCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Package Order</h2>
              <p className="text-xs text-gray-500">{order.orderId}</p>
            </div>  
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* ITEMS */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              Items to Pack
            </h3>

            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {item.productName}
                  </p>
                  <span className="text-sm font-semibold">
                    {item.qty} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              Upload Images
            </h3>

            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-blue-50 transition">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Tap to upload photos
                </p>
                <p className="text-xs text-gray-500">Max 5 images</p>
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* PREVIEW */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => {
                      setSelectedFiles((f) => f.filter((_, i) => i !== index));
                      setPreviewUrls((f) => f.filter((_, i) => i !== index));
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="success"
            className="flex-1"
            loading={uploading}
            disabled={selectedFiles.length === 0}
            onClick={()=>handleSubmit(order._id)}
          >
            Mark as Packed
          </Button>
        </div>
      </div>
    </div>
  );
};

// ================================
//          MAIN PAGE
// ================================
export const Packaging = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BaseUrl}/v1/orders`, {
        headers: { Authorization: localStorage.getItem("auth_token") },
      });

      const all = res.data.data || [];
      const filtered = all.filter((o: any) => o.status === "admin_review");
      setOrders(filtered);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-300 shadow-sm sticky top-0 z-30">
        <div className="px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl   shadow-sm">
                <Package className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  Packaging
                </h1>
                <p className="text-[12px] sm:text-sm text-gray-500">
                  Package orders and upload images
                </p>
              </div>
            </div>

            {orders.length > 0 && (
              <div className="text-right ">
                <p className="text-[12px] text-gray-500">Order(s)</p>
                <p className="text-xl font-bold text-blue-600">
                  {orders.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 animate-spin rounded-full"></div>
            <p className="mt-3 text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center h-64 flex flex-col items-center justify-center text-red-600">
            <AlertCircle className="w-10 h-10 mb-2 text-red-400" />
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center h-64 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No orders to package</p>
            <p className="text-gray-400 text-sm mt-1">
              All orders have been packaged
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onPackage={() => {
                  setSelectedOrder(order);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <PackagingModal
        order={selectedOrder}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchOrders}
      />
    </div>
  );
};
