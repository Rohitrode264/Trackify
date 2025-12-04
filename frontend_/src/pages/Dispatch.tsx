/** FULLY UPDATED DISPATCH PAGE — MATCHES NEW ADMIN REVIEW UI **/
import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../components/Button";
import {
  Truck,
  User,
  Phone,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  PackageCheck,
  ImageIcon,
} from "lucide-react";
import { BaseUrl } from "../config/BaseUrl.config";

/* ---------------- TYPES ---------------- */
interface DispatchDetails {
  courierName: string;
  lrNumber: string;
  trackingNumber: string;
  trackingUrl: string;
}

interface OrderItem {
  productName: string;
  qty: number;
  unit: string;
}

interface Order {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    phones?: string[];
    email?: string;
  };
  items: OrderItem[];
  status: string;
  packedImages: string[];
  createdAt: string;
  totals: {
    grandTotal: number;
  };
}

/* ---------------- CARD COMPONENT ---------------- */
const DispatchOrderCard: React.FC<{
  order: Order;
  onDispatch: (o: Order) => void;
  onViewImages: (imgs: string[]) => void;
}> = ({ order, onDispatch, onViewImages }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all overflow-hidden">

      <div className="p-5 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg shadow-sm">
              <PackageCheck className="w-5 h-5 text-green-600" />
            </div>

            <div>
              <p className="font-semibold text-gray-900">{order.orderId}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Ready
          </span>
        </div>

        {/* Customer */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-400" />
            <p className="font-medium text-gray-900">{order.customer.name}</p>
          </div>

          {order.customer.phones?.[0] && (
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600">{order.customer.phones[0]}</p>
            </div>
          )}
        </div>

        {/* Items + Amount */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {order.items.length} items
            </span>
          </div>

          <p className="font-semibold text-gray-900">
            ₹{order.totals.grandTotal.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Packed Images */}
        {order.packedImages?.length > 0 && (
          <button
            onClick={() => onViewImages(order.packedImages)}
            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            View {order.packedImages.length} packed images
          </button>
        )}

        {/* Button */}
        <Button
          variant="success"
          className="w-full"
          onClick={() => onDispatch(order)}
        >
          <Send className="w-4 h-4" />
          Dispatch Order
        </Button>
      </div>
    </div>
  );
};

/* ---------------- IMAGE VIEWER ---------------- */
const ImageViewer: React.FC<{
  images: string[];
  open: boolean;
  onClose: () => void;
}> = ({ images, open, onClose }) => {
  const [index, setIndex] = useState(0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <button className="absolute top-5 right-5 p-3" onClick={onClose}>
        <X className="text-white w-7 h-7" />
      </button>

      <img
        src={images[index]}
        className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
      />

      {images.length > 1 && (
        <div className="absolute bottom-5 flex gap-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full ${
                index === i ? "bg-white" : "bg-white/40"
              }`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- DISPATCH MODAL ---------------- */
const DispatchModal: React.FC<{
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ order, open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<DispatchDetails>({
    courierName: "",
    lrNumber: "",
    trackingNumber: "",
    trackingUrl: "",
  });

  const [loading, setLoading] = useState(false);

  if (!open || !order) return null;

  const submit = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${BaseUrl}/v1/orders/${order._id}/dispatch`,
        formData,
        { headers: { Authorization: localStorage.getItem("auth_token")! } }
      );
      onSuccess();
      onClose();
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-linear-to-r from-green-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Truck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                Dispatch Order
              </p>
              <p className="text-sm text-gray-500">{order.orderId}</p>
            </div>
          </div>

          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Courier Name"
            onChange={(e) =>
              setFormData({ ...formData, courierName: e.target.value })
            }
          />
          <input
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="LR Number"
            onChange={(e) =>
              setFormData({ ...formData, lrNumber: e.target.value })
            }
          />
          <input
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Tracking Number"
            onChange={(e) =>
              setFormData({ ...formData, trackingNumber: e.target.value })
            }
          />
          <input
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Tracking URL"
            onChange={(e) =>
              setFormData({ ...formData, trackingUrl: e.target.value })
            }
          />

          <Button variant="success" className="w-full" onClick={submit}>
            {loading ? "Dispatching..." : "Dispatch Now"}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN PAGE ---------------- */
export const Dispatch: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [showViewer, setShowViewer] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BaseUrl}/v1/orders`, {
        headers: { Authorization: localStorage.getItem("auth_token")! },
      });
      const all = data.data || [];
      setOrders(all.filter((o: Order) => o.status === "packed"));
    } catch (e) {
      setError("Failed to fetch orders");
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-linear-to-b from-gray-50 to-white">

      {/* HEADER */}
      {/* Header */}
<div className="bg-white border-b border-gray-200 shadow-sm">
  <div className="px-8 py-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      
      {/* Left: Icon + Title */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-green-50 text-green-600 shadow-sm">
          <Truck className="w-7 h-7" />   {/* keeping your icon */}
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dispatch Orders
          </h1>
          <p className="text-sm text-gray-600">
            Manage and dispatch ready orders with tracking details
          </p>
        </div>
      </div>

      {/* Right: Count Box */}
      {orders && orders.length > 0 && (
        <div className="flex flex-col items-start md:items-end">
          <p className="text-3xl font-bold text-green-600 leading-none">
            {orders.length}
          </p>
          <p className="text-sm text-gray-500 tracking-wide">
            Ready to dispatch
          </p>
        </div>
      )}

    </div>
  </div>
</div>


      {/* MAIN CONTENT */}
      <div className="flex-1 px-8 py-6 overflow-auto">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-72">
            <div className="animate-spin h-14 w-14 border-4 border-gray-200 border-t-green-600 rounded-full mb-4"></div>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-72">
            <div className="p-4 bg-red-50 rounded-full mb-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-72">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <CheckCircle2 className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No orders ready</p>
            <p className="text-gray-400 text-sm">All orders dispatched</p>
          </div>
        )}

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((o) => (
            <DispatchOrderCard
              key={o._id}
              order={o}
              onDispatch={(o) => setSelected(o)}
              onViewImages={(imgs) => {
                setViewerImages(imgs);
                setShowViewer(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* MODALS */}
      <DispatchModal
        order={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onSuccess={fetch}
      />

      <ImageViewer
        images={viewerImages}
        open={showViewer}
        onClose={() => setShowViewer(false)}
      />
    </div>
  );
};
