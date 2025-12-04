import React, { useState, useEffect } from "react";
import {
  useOrders,
  type Order as FetchedOrder,
} from "../../hooks/useFetchOrders";
import Button from "../../components/Button";
import AdminReviewPopup from "../../components/PopUps/AdminReviewPopup";
import { StatusBadge } from "./Order"; // SAME BADGE

import {
  ClipboardClock,
  ListOrdered,
  Package,
  User,
  IndianRupee,
  Eye,
  AlertCircle,  
  CheckCircle2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  UserPen,
  Pen,
} from "lucide-react";

export const AdminReview: React.FC = () => {
  const [activeView, setActiveView] = useState<"review" | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<FetchedOrder | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const { orders, pagination, loading, error, setFilters, refetch } = useOrders({
    page: 1,
    limit: 10,
  });

  const pendingOrderCount = orders.filter(
    (order: FetchedOrder) => order.status === "created"
  ).length;

  useEffect(() => {
    if (activeView === "review") {
      setFilters({ status: "created", page: 1 });
    } else {
      setFilters({ status: undefined, page: 1 });
    }
  }, [activeView]);

  const handlePageChange = (page: number) => setFilters({ page });
  const handleLimitChange = (limit: number) =>
    setFilters({ limit, page: 1 });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* HEADER — MATCHED EXACTLY TO ORDERS PAGE */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* LEFT HEADER */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <UserPen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Review</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Review & assign formulations</p>
              </div>
            </div>

            {/* RIGHT ACTION BUTTONS (MATCHED SIZE + SPACING) */}
            <div className="flex gap-2">

              {/* Pending Review */}
              <Button
                variant={activeView === "review" ? "primary" : "outline"}
                size="md"
                onClick={() => setActiveView("review")}
                className="shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 whitespace-nowrap"
              >
                <ClipboardClock className="w-5 h-5" />
                <span className="hidden sm:inline">Pending Review</span>

                {pendingOrderCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-600 text-white rounded-full text-xs font-semibold shadow">
                    {pendingOrderCount}
                  </span>
                )}
              </Button>

              {/* All Orders */}
              <Button
                variant={activeView === "all" ? "primary" : "outline"}
                size="md"
                onClick={() => setActiveView("all")}
                className="shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 whitespace-nowrap"
              >
                <ListOrdered className="w-5 h-5" />
                <span className="hidden sm:inline">All Orders</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (MATCHED EXACTLY TO ORDER PAGE CENTER) */}
      <div className="flex-1 overflow-hidden flex flex-col px-4 sm:px-6 lg:px-8 py-4 gap-4">

        {/* STATS BAR */}
        {pagination && (
          <div className="bg-linear-to-r from-blue-50 to-white rounded-xl shadow-sm border border-gray-200 px-6 py-3 shrink-0">
            <div className="flex items-center justify-between text-sm">

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">
                  Showing{" "}
                  <span className="font-bold text-blue-600">{orders.length}</span> of{" "}
                  <span className="font-bold text-gray-900">{pagination.total}</span> orders
                </span>
              </div>

              <span className="text-gray-500 font-medium">
                Page {pagination.page} of {pagination.totalPages ?? 1}
              </span>
            </div>
          </div>
        )}

        {/* TABLE / CARD WRAPPER */}
        <div className="flex-1 overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
          <div className="h-full overflow-auto">

            {/* LOADING */}
            {loading && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0"></div>
                </div>
                <span className="text-gray-500 mt-4 font-medium">Loading orders...</span>
              </div>
            )}

            {/* ERROR */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-4 bg-red-50 rounded-2xl mb-4">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <span className="text-red-600 font-semibold text-lg">{error}</span>
              </div>
            )}

            {/* EMPTY */}
            {!loading && !error && orders.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-4 bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                  {activeView === "review" ? (
                    <CheckCircle2 className="h-12 w-12 text-gray-400" />
                  ) : (
                    <ClipboardList className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <span className="text-gray-600 font-semibold text-lg">
                  {activeView === "review"
                    ? "No orders pending review"
                    : "No orders found"}
                </span>
                {activeView === "review" && (
                  <span className="text-gray-400 text-sm mt-2">
                    All orders have been reviewed 🎉
                  </span>
                )}
              </div>
            )}

            {/* TABLE (DESKTOP) */}
            {!loading && !error && orders.length > 0 && (
              <>
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead className="bg-linear-to-r from-gray-50 to-blue-50/50 sticky top-0 z-10">
                      <tr>
                        {[
                          "Order ID",
                          "Customer",
                          "Items",
                          "Grand Total",
                          "Status",
                          "Created",
                          "Actions",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200"
                          >
                            {header === "Actions" && activeView === "all" ? null : header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          className="group hover:bg-blue-50/50 transition-colors"
                        >
                          {/* ORDER ID */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-gray-900">
                                {order.orderId}
                              </span>
                            </div>
                          </td>

                          {/* CUSTOMER */}
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {order.customer.name}
                                </p>
                                {order.customer.phones?.[0] && (
                                  <p className="text-xs text-gray-500">
                                    {order.customer.phones[0]}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* ITEMS */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {order.items.length} items
                            </span>
                          </td>

                          {/* TOTAL */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                {order.totals.grandTotal.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-4">
                            <StatusBadge status={order.status} />
                          </td>

                          {/* CREATED */}
                          <td className="px-6 py-4">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>

                          {/* ACTION */}
                          {
                            order.status === "created" && <td className="px-6 py-4 text-center flex">
                              <Button
                                size="sm"
                                variant="outline"
                                className=""
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowPopup(true);
                                }}
                              >Review
                                <Pen className="w-4 h-4" />
                              </Button>
                            </td>
                          }

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="lg:hidden p-3 space-y-3">
                  {orders.map((order) => (
                    <div key={order._id} className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all">

                      {/* HEADER */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">{order.orderId}</span>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      {/* CUSTOMER */}
                      <div className="mt-3">
                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                        {order.customer.phones?.[0] && (
                          <p className="text-xs text-gray-500">{order.customer.phones[0]}</p>
                        )}
                      </div>

                      {/* FOOTER ACTION */}
                      <div className="flex justify-end mt-3">
                        <button
                          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowPopup(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* PAGINATION — EXACT MATCH */}
        {pagination && !loading && orders.length > 0 && (
          <div className="border-t border-gray-200 bg-linear-to-r from-white to-blue-50/50 rounded-xl shadow-sm px-6 py-3 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 font-medium">
                  Rows per page:
                </label>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                >
                  {[5, 10, 20, 50, 100].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="px-5 py-2 text-sm font-bold text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm">
                  {pagination.page} / {pagination.totalPages ?? 1}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= (pagination.totalPages || 1)}
                  className="p-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 transition-all shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POPUP */}
      <AdminReviewPopup
        isOpen={showPopup}
        onClose={() => {
          setShowPopup(false);
          setSelectedOrder(null);
        }}
        //@ts-ignore
        order={selectedOrder ?? undefined}
        onReviewed={() => {
          setShowPopup(false);
          refetch();
        }}
      />
    </div>
  );
};
