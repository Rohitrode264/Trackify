import React, { useState, useEffect } from "react";
import Input from "../Input";
import Button from "../Button";
import { Modal, ModalHeader } from "./Modal";
import type { OrderItem } from "../../services/api";
import { useCustomers } from "../../hooks/useFetchCustomers";
import type { Order as FetchedOrder } from "../../hooks/useFetchOrders";
import api from "../../services/api";

interface OrderFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: "add" | "edit";
  order?: FetchedOrder;
}

interface OrderItemForm
  extends Omit<OrderItem, "amount" | "gstAmount"> {
  amount?: number;
  gstAmount?: number;
}

export default function OrderFormPopup({
  isOpen,
  onClose,
  onSuccess,
  mode = "add",
  order,
}: OrderFormPopupProps) {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState<OrderItemForm[]>([
    {
      productName: "",
      qty: 0,
      unit: "",
      rate: 0,
      isGstApplicable: false,
      gstPercent: 0,
    },
  ]);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [loading, setLoading] = useState(false);

  const { customers } = useCustomers();

  // Prefill in edit mode
  useEffect(() => {
    if (mode === "edit" && order && isOpen) {
      setSelectedCustomer(order.customer._id);
      setItems(
        order.items.map((it) => ({
          productName: it.productName,
          qty: it.qty,
          unit: it.unit,
          rate: it.rate,
          isGstApplicable: it.isGstApplicable,
          gstPercent: it.gstPercent,
          amount: it.amount,
          gstAmount: it.gstAmount,
        }))
      );
      setShippingCharge(order.shippingCharge || 0);
    }

    if (mode === "add" && !isOpen) {
      setSelectedCustomer("");
      setItems([
        {
          productName: "",
          qty: 0,
          unit: "",
          rate: 0,
          isGstApplicable: false,
          gstPercent: 0,
        },
      ]);
      setShippingCharge(0);
    }
  }, [mode, order, isOpen]);

  const calculateItemTotal = (item: OrderItemForm) => {
    const amount = (item.qty || 0) * (item.rate || 0);
    const gstAmount = item.isGstApplicable
      ? (amount * (item.gstPercent || 0)) / 100
      : 0;
    return { amount, gstAmount };
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItemForm,
    value: any
  ) => {
    const newItems = [...items];
    const updated = { ...newItems[index], [field]: value };

    const { amount, gstAmount } = calculateItemTotal(updated);
    updated.amount = amount;
    updated.gstAmount = gstAmount;

    newItems[index] = updated;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productName: "",
        qty: 0,
        unit: "",
        rate: 0,
        isGstApplicable: false,
        gstPercent: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    const arr = [...items];
    arr.splice(index, 1);
    setItems(arr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !items.length) return;

    setLoading(true);
    try {
      const payloadItems = items.map((item) => ({
        ...item,
        amount: calculateItemTotal(item).amount,
        gstAmount: calculateItemTotal(item).gstAmount,
      }));
      console.log(payloadItems);
      if (mode === "add") {
        await api.createOrder({
          customer: selectedCustomer,
          items: payloadItems,
          shippingCharge,
        });
      } else if (mode === "edit" && order) {
        const subTotal = payloadItems.reduce((s, it) => s + (it.amount || 0), 0);
        const totalGst = payloadItems.reduce(
          (s, it) => s + (it.gstAmount || 0),
          0
        );
        const totals = {
          subTotal,
          totalGst,
          shippingTax: 0,
          grandTotal: subTotal + totalGst + (shippingCharge || 0),
        };

        await api.updateOrder(order._id, {
          items: payloadItems,
          shippingCharge,
          totals,
        } as any);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Order save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    const itemsTotal = items.reduce((sum, item) => {
      const { amount, gstAmount } = calculateItemTotal(item);
      return sum + amount + gstAmount;
    }, 0);
    return itemsTotal + shippingCharge;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="flex flex-col max-h-[90vh] overflow-hidden">
        {/* Sticky Header */}
        <ModalHeader
          title={mode === "edit" ? "Edit Order" : "Create Order"}
          subtitle={mode === "edit" ? "Update order details" : "Add a new order to the system"}
          onClose={onClose}
          gradient
        />

        {/* Scrollable Body */}
        <form
          onSubmit={handleSubmit}
          id="order-form"
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
        >
          {/* CUSTOMER */}
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Customer
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm transition-all"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
            >
              <option value="">Select a customer</option>
              {customers?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* ITEMS SECTION */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                <p className="text-sm text-gray-500 mt-1">Add products and quantities for this order</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                + Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      Item {index + 1}
                    </h4>
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* GRID RESPONSIVE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Product Name"
                    value={item.productName}
                    onChange={(e) =>
                      handleItemChange(index, "productName", e.target.value)
                    }
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Quantity"
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(index, "qty", Number(e.target.value))
                      }
                      required
                      min="1"
                    />
                    <Input
                      label="Unit"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(index, "unit", e.target.value)
                      }
                      placeholder="kg, pcs, etc."
                    />
                  </div>

                  <Input
                    label="Rate (₹)"
                    type="number"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, "rate", Number(e.target.value))
                    }
                    required
                    min="0"
                    step="0.01"
                  />

                  {/* GST */}
                  <div className="md:col-span-2">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isGstApplicable}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "isGstApplicable",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">GST Applicable</span>
                      </label>
                    </div>
                  </div>

                  {item.isGstApplicable && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST Percentage
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
                        value={item.gstPercent}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "gstPercent",
                            Number(e.target.value)
                          )
                        }
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* ITEM TOTAL */}
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-900">₹{calculateItemTotal(item).amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {item.isGstApplicable && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">GST ({item.gstPercent}%):</span>
                        <span className="font-medium text-gray-900">₹{calculateItemTotal(item).gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-2 border-t border-gray-300 mt-2">
                      <span className="text-gray-900">Item Total:</span>
                      <span className="text-blue-600">
                        ₹{(calculateItemTotal(item).amount + calculateItemTotal(item).gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SHIPPING CHARGE & TOTALS */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div>
              <Input
                label="Shipping Charge (₹)"
                type="number"
                value={shippingCharge}
                onChange={(e) => setShippingCharge(Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
            
            {/* GRAND TOTAL */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Grand Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{getTotalAmount().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 shadow-lg">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="order-form" loading={loading}>
            {mode === "edit" ? "Update Order" : "Create Order"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
