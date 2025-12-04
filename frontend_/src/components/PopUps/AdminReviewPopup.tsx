import React, { useState, useEffect } from "react";
import {
  X,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  FlaskConical,
  ClipboardList,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  IndianRupee,
  Edit,
  History,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Button from "../Button";
import apiService from "../../services/api";
import type { Order, Customer } from "../../services/api";
import { BaseUrl } from "../../config/BaseUrl.config";

interface AdminReviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  onReviewed: () => void;
}

type TabType = "order" | "past-orders" | "edit-customer" | "edit-order";

const AdminReviewPopup: React.FC<AdminReviewPopupProps> = ({
  isOpen,
  onClose,
  order,
  onReviewed,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("order");
  const [formAll, setFormAll] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loadingPastOrders, setLoadingPastOrders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showFormulationToPackaging, setShowFormulationToPackaging] = useState(false);
  
  // Edit states
  const [customerData, setCustomerData] = useState<Partial<Customer>>({});
  const [orderData, setOrderData] = useState<Partial<Order>>({});

  useEffect(() => {
    if (order) {
      setItems(
        order.items.map((item: any) => ({
          ...item,
          formulation: item.formulation || "",
          formulationVisible: item.formulationVisible ?? true,
          saved: false,
        }))
      );
      setShowFormulationToPackaging(order.showFormulationToPackaging ?? false);
      setCustomerData({
        name: order.customer.name,
        phones: order.customer.phones || [],
        email: order.customer.email,
        gst: order.customer.gst,
        billing: order.customer.billing,
        shipping: order.customer.shipping,
        sameAsBilling: order.customer.sameAsBilling,
        remarks: order.customer.remarks,
      });
      setOrderData({
        shippingCharge: order.shippingCharge,
        modeOfDispatch: order.modeOfDispatch,
      });
    }
  }, [order]);

  useEffect(() => {
    if (isOpen && order && activeTab === "past-orders") {
      loadPastOrders();
    }
  }, [isOpen, order, activeTab]);

  const loadPastOrders = async () => {
    if (!order?.customer?._id) {
      showMessage("Customer ID not found", "error");
      return;
    }
    setLoadingPastOrders(true);
    try {
      const response = await apiService.getCustomer(order.customer._id);
      console.log("Customer response:", response);
      const allOrders = response.orderHistory || [];
      // Filter out current order and sort by date
      const past = allOrders
        .filter((o: Order) => o._id !== order._id)
        .sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setPastOrders(past);
      if (past.length === 0) {
        showMessage("No past orders found for this customer", "error");
      }
    } catch (error: any) {
      console.error("Error loading past orders:", error);
      showMessage(error.response?.data?.message || error.message || "Failed to load past orders", "error");
    } finally {
      setLoadingPastOrders(false);
    }
  };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveAll = () => {
    if (!formAll.trim()) {
      showMessage("Please enter a formulation", "error");
      return;
    }
    const newItems = items.map((item: any) => ({
      ...item,
      formulation: formAll,
      saved: true,
    }));
    setItems(newItems);
    showMessage("Formulation added to all items");
  };

  const handleSaveItem = async (index: number) => {
    if (!order) return;
    const item = items[index];
    if (!item.formulation?.trim()) {
      showMessage("Please enter a formulation", "error");
      return;
    }

    setSaving(true);
    try {
      const response = await apiService.assignFormulation(
        order._id,
        index,
        item.formulation.trim(),
        item.formulationVisible ?? true,
        showFormulationToPackaging
      );
      const newItems = [...items];
      newItems[index].saved = true;
      // Update from response if available
      if (response?.data?.items?.[index]) {
        newItems[index].formulation = response.data.items[index].formulation;
        newItems[index].formulationVisible = response.data.items[index].formulationVisible ?? true;
      } else {
        // Ensure visibility is set
        newItems[index].formulationVisible = item.formulationVisible ?? true;
      }
      setItems(newItems);
      showMessage(`Formulation saved for ${item.productName}`);
    } catch (error: any) {
      console.error("Error saving formulation:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to save formulation";
      showMessage(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleItemVisibility = async (index: number) => {
    if (!order) return;
    const item = items[index];
    const newVisibility = !(item.formulationVisible ?? true);
    
    // If no formulation exists, we can't toggle visibility
    if (!item.formulation?.trim()) {
      showMessage("Please add and save a formulation first", "error");
      return;
    }

    // Optimistically update UI
    const newItems = [...items];
    newItems[index].formulationVisible = newVisibility;
    setItems(newItems);

    try {
      const response = await apiService.assignFormulation(
        order._id,
        index,
        item.formulation.trim(),
        newVisibility,
        showFormulationToPackaging
      );
      
      // Update from response to ensure sync
      if (response?.data?.items?.[index]) {
        newItems[index].formulationVisible = response.data.items[index].formulationVisible ?? newVisibility;
        setItems(newItems);
      }
      
      showMessage(newVisibility ? "Formulation is now visible" : "Formulation is now hidden");
    } catch (error: any) {
      console.error("Error toggling visibility:", error);
      // Revert on error
      newItems[index].formulationVisible = !newVisibility;
      setItems(newItems);
      const errorMsg = error.response?.data?.message || error.message || "Failed to update visibility";
      showMessage(errorMsg, "error");
    }
  };

  const handleToggleShowFormulationToPackaging = async () => {
    if (!order) return;
    const newValue = !showFormulationToPackaging;
    
    // Find an item with formulation to update, or use first item
    const itemToUpdate = items.find((item) => item.formulation?.trim()) || items[0];
    
    if (!itemToUpdate) {
      showMessage("Please add at least one formulation first", "error");
      return;
    }

    const itemIndex = items.indexOf(itemToUpdate);
    setShowFormulationToPackaging(newValue);

    try {
      // Update via assign-formulation endpoint with showFormulationToPackaging
      await apiService.assignFormulation(
        order._id,
        itemIndex,
        itemToUpdate.formulation || "",
        itemToUpdate.formulationVisible ?? true,
        newValue
      );

      showMessage(
        newValue
          ? "Formulations will be shown to packaging"
          : "Formulations will be hidden from packaging"
      );
    } catch (error: any) {
      setShowFormulationToPackaging(!newValue); // Revert on error
      showMessage(error.response?.data?.message || error.message || "Failed to update setting", "error");
    }
  };

  const handleUpdateCustomer = async () => {
    if (!order?.customer?._id) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${BaseUrl}/v1/customers/${order.customer._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(customerData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      showMessage("Customer details updated successfully");
      onReviewed(); // Refresh data
    } catch (error: any) {
      showMessage("Failed to update customer details", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!order?._id) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${BaseUrl}/v1/orders/${order._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      showMessage("Order details updated successfully");
      onReviewed(); // Refresh data
    } catch (error: any) {
      showMessage("Failed to update order details", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReviewed = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await apiService.updateOrderStatus(order._id, "admin_review");
      showMessage("Order marked as reviewed!");
      setTimeout(() => {
        onReviewed();
      }, 1500);
    } catch (error: any) {
      showMessage(error.response?.data?.message || "Failed to mark as reviewed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !order) return null;

  const customer = order.customer;
  const totals = order.totals;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 animate-fadeIn p-4">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review Order</h2>
              <p className="text-sm text-gray-600">{order.orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[
            { id: "order" as TabType, label: "Order Details", icon: Package },
            { id: "past-orders" as TabType, label: "Past Orders", icon: History },
            { id: "edit-customer" as TabType, label: "Edit Customer", icon: User },
            { id: "edit-order" as TabType, label: "Edit Order", icon: Edit },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "order" && (
            <div className="space-y-6">
              {/* Customer Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Customer Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                  </div>
                  {customer.phones?.[0] && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{customer.phones[0]}</p>
                      </div>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{customer.email}</p>
                      </div>
                    </div>
                  )}
                  {customer.gst && (
                    <div>
                      <p className="text-sm text-gray-500">GST</p>
                      <p className="font-medium text-gray-900">{customer.gst}</p>
                    </div>
                  )}
                </div>
                {(customer.billing || customer.shipping) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customer.billing && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Billing Address</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-700">
                              {customer.billing.address}, {customer.billing.city}, {customer.billing.state} - {customer.billing.pincode}
                            </p>
                          </div>
                        </div>
                      )}
                      {customer.shipping && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-700">
                              {customer.shipping.address}, {customer.shipping.city}, {customer.shipping.state} - {customer.shipping.pincode}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {totals.subTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GST</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {totals.totalGst.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipping</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {(order.shippingCharge || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Grand Total</p>
                    <p className="font-semibold text-blue-600 text-lg flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {totals.grandTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Show Formulation Toggle */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Show Formulation to Packaging</p>
                    <p className="text-sm text-gray-600">
                      {showFormulationToPackaging
                        ? "Formulations will be visible in packaging portal"
                        : "Formulations will be hidden from packaging portal"}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleShowFormulationToPackaging}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {showFormulationToPackaging ? (
                      <>
                        <ToggleRight className="w-6 h-6 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Show</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Hide</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Add to all items */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                <p className="font-semibold text-gray-700 mb-3">Add formulation to all items:</p>
                <textarea
                  value={formAll}
                  onChange={(e) => setFormAll(e.target.value)}
                  placeholder="Enter formulation for all items..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <Button size="sm" onClick={handleSaveAll}>
                    <Save className="w-4 h-4" /> Apply to All
                  </Button>
                </div>
              </div>

              {/* Individual item forms */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Items & Formulations</h3>
                {items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FlaskConical className="w-4 h-4 text-blue-600" />
                          <p className="font-semibold text-gray-800">{item.productName}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Qty: {item.qty} {item.unit || ""}</span>
                          {item.rate && (
                            <span>
                              Rate: <IndianRupee className="w-3 h-3 inline" />
                              {item.rate.toLocaleString("en-IN")}
                            </span>
                          )}
                          {item.amount && (
                            <span>
                              Amount: <IndianRupee className="w-3 h-3 inline" />
                              {item.amount.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleItemVisibility(i)}
                        disabled={!item.formulation?.trim() || !item.saved}
                        className={`p-2 rounded-lg transition-colors ${
                          !item.formulation?.trim() || !item.saved
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                            : item.formulationVisible
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title={
                          !item.formulation?.trim()
                            ? "Add a formulation first"
                            : !item.saved
                            ? "Save the formulation first"
                            : item.formulationVisible
                            ? "Hide from packaging"
                            : "Show to packaging"
                        }
                      >
                        {item.formulationVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <textarea
                      value={item.formulation}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[i].formulation = e.target.value;
                        newItems[i].saved = false;
                        setItems(newItems);
                      }}
                      placeholder="Enter formulation details..."
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <div>
                        {item.saved && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Saved
                          </p>
                        )}
                        {item.formulation && (
                          <p className="text-xs text-gray-500 mt-1">
                            Visibility: {item.formulationVisible ? "Visible" : "Hidden"} to packaging
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSaveItem(i)}
                        loading={saving}
                        disabled={!item.formulation?.trim()}
                      >
                        <Save className="w-4 h-4" /> Save
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "past-orders" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Past Orders for {customer.name}</h3>
              {loadingPastOrders ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : pastOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No past orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastOrders.map((pastOrder) => (
                    <div
                      key={pastOrder._id}
                      className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{pastOrder.orderId}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(pastOrder.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600 flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {pastOrder.totals?.grandTotal.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{pastOrder.status}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {pastOrder.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.productName}</p>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.qty} {item.unit || ""}
                                </p>
                              </div>
                            </div>
                            {item.formulation && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-medium text-gray-700">Formulation:</p>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      item.formulationVisible
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {item.formulationVisible ? (
                                      <Eye className="w-3 h-3 inline mr-1" />
                                    ) : (
                                      <EyeOff className="w-3 h-3 inline mr-1" />
                                    )}
                                    {item.formulationVisible ? "Visible" : "Hidden"}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1 bg-white p-2 rounded border border-gray-200">
                                  {item.formulation}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "edit-customer" && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Edit Customer Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={customerData.name || ""}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers (comma separated)</label>
                  <input
                    type="text"
                    value={customerData.phones?.join(", ") || ""}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        phones: e.target.value.split(",").map((p) => p.trim()),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerData.email || ""}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST</label>
                  <input
                    type="text"
                    value={customerData.gst || ""}
                    onChange={(e) => setCustomerData({ ...customerData, gst: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                {customerData.billing && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Billing Address</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          value={customerData.billing.address || ""}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              billing: { ...customerData.billing!, address: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={customerData.billing.city || ""}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              billing: { ...customerData.billing!, city: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={customerData.billing.state || ""}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              billing: { ...customerData.billing!, state: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={customerData.billing.pincode || ""}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              billing: { ...customerData.billing!, pincode: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {customerData.shipping && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          value={customerData.shipping.address || ""}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              shipping: { ...customerData.shipping!, address: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={customerData.shipping.city || ""}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              shipping: { ...customerData.shipping!, city: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={customerData.shipping.state || ""}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              shipping: { ...customerData.shipping!, state: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={customerData.shipping.pincode || ""}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              shipping: { ...customerData.shipping!, pincode: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("order")}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCustomer} loading={saving}>
                    <Save className="w-4 h-4" /> Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "edit-order" && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Edit Order Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Charge
                  </label>
                  <input
                    type="number"
                    value={orderData.shippingCharge || 0}
                    onChange={(e) =>
                      setOrderData({ ...orderData, shippingCharge: parseFloat(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mode of Dispatch
                  </label>
                  <input
                    type="text"
                    value={orderData.modeOfDispatch || ""}
                    onChange={(e) =>
                      setOrderData({ ...orderData, modeOfDispatch: e.target.value })
                    }
                    placeholder="e.g., Courier, Hand Delivery, etc."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("order")}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateOrder} loading={saving}>
                    <Save className="w-4 h-4" /> Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === "order" && (
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleMarkReviewed} loading={saving}>
              Mark as Reviewed
            </Button>
          </div>
        )}

        {/* Message Toast */}
        {message && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-sm font-medium z-50 animate-fadeIn ${
              message.type === "error"
                ? "bg-red-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "error" ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewPopup;
