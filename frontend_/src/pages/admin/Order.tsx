import React, { useState } from 'react';
import { useOrders, type Order as FetchedOrder } from '../../hooks/useFetchOrders';
import Button from '../../components/Button';
import OrderFormPopup from '../../components/PopUps/OrderFormPopup';
import ViewOrderDetails from '../../components/PopUps/ViewOrderDetails';
import {
  ShoppingCart,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  PackagePlus,
  ClipboardList,
  User,
  Calendar,
  IndianRupee,
  Download
} from 'lucide-react';
import { generateOrderBillPDF } from '../../utils/pdfGenerator';

// Status badge component
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    created: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Created' },
    admin_review: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Admin Review' },
    packaging: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Packaging' },
    ready_for_dispatch: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Ready for Dispatch' },
    dispatched: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dispatched' },
    delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.created;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Filter Panel Component
export interface FilterPanelProps {
  filters: {
    from?: string;
    to?: string;
    status?: string;
    telecaller?: string;
  };
  onFilterChange: (filters: any) => void;
  onClear: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({ from: '', to: '', status: '', telecaller: '' });
    onClear();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </h3>
        <button
          onClick={handleClear}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            value={localFilters.from || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, from: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            value={localFilters.to || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, to: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            <option value="">All Statuses</option>
            <option value="created">Created</option>
            <option value="admin_review">Admin Review</option>
            <option value="packaging">Packaging</option>
            <option value="ready_for_dispatch">Ready for Dispatch</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telecaller</label>
          <input
            type="text"
            value={localFilters.telecaller || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, telecaller: e.target.value })}
            placeholder="Telecaller ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export const Order: React.FC = () => {
  const { orders, pagination, loading, error, setFilters, filters, refetch } = useOrders({ page: 1, limit: 10 });
  const [showFilters, setShowFilters] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<FetchedOrder | null>(null);
  const [showViewOrder, setShowViewOrder] = useState(false);

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleLimitChange = (limit: number) => {
    setFilters({ limit, page: 1 });
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: filters.limit });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h1>
                <p className="text-xs sm:text-sm text-gray-500">Manage and track all customer orders</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-2">{showFilters ? 'Hide' : 'Show'} Filters</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowOrderForm(true)}
                className="shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 whitespace-nowrap"
              >
                <PackagePlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-2">Create Order</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col px-4 sm:px-6 lg:px-8 py-4 gap-4">
        {/* Stats Bar */}
        {pagination && (
          <div className="bg-linear-to-r from-blue-50 to-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-3 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">
                  Showing <span className="font-bold text-blue-600">{orders.length}</span> of{' '}
                  <span className="font-bold text-gray-900">{pagination.total}</span> orders
                </span>
              </div>
              <span className="text-gray-500 font-medium">
                Page {pagination.page} of {pagination.totalPages ?? 1}
              </span>
            </div>
          </div>
        )}

        {/* Table/Cards Container */}
        <div className="flex-1 overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
          <div className="h-full overflow-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0 left-0"></div>
                </div>
                <span className="text-gray-500 mt-4 font-medium">Loading orders...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-4 bg-red-50 rounded-2xl mb-4">
                  <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-red-600 font-semibold text-lg">{error}</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-4 bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                  <ShoppingCart className="h-12 w-12 text-gray-400" />
                </div>
                <span className="text-gray-600 font-semibold text-lg">No orders found</span>
                <span className="text-gray-400 text-sm mt-2">Try adjusting your filters</span>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block h-full">
                  <table className="w-full">
                    <thead className="bg-linear-to-r from-gray-50 to-blue-50/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Order ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Customer</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Items</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Grand Total</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Created By</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Created At</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          className="group hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-gray-900">{order.orderId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{order.customer.name}</p>
                              {order.customer.phones && order.customer.phones.length > 0 && (
                                <p className="text-xs text-gray-500">{order.customer.phones[0]}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                {order.totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className="text-gray-900 font-medium">{order.createdBy.name}</span>
                              <p className="text-xs text-gray-500">{order.createdBy.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 hover:shadow-md transition-all"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowViewOrder(true);
                                }}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 hover:shadow-md transition-all"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowViewOrder(true);
                                }}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-400 hover:shadow-md transition-all"
                                onClick={() => generateOrderBillPDF(order)}
                                title="Download Bill PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-3 space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Package className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-gray-900 truncate">{order.orderId}</span>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      {/* Customer Info */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-gray-900">{order.customer.name}</span>
                        </div>
                        {order.customer.phones && order.customer.phones.length > 0 && (
                          <p className="text-xs text-gray-500 ml-5">{order.customer.phones[0]}</p>
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Items</p>
                          <span className="text-sm font-medium text-gray-700">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Grand Total</p>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3 text-gray-400" />
                            <span className="text-sm font-bold text-gray-900">
                              {order.totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Created by</p>
                          <p className="text-sm font-medium text-gray-700">{order.createdBy.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit'
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowViewOrder(true);
                            }}
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowViewOrder(true);
                            }}
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-400 transition-all"
                            onClick={() => generateOrderBillPDF(order)}
                            title="Download Bill PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        {pagination && !loading && orders.length > 0 && (
          <div className="border-t border-gray-200 from-white to-blue-50/50 rounded-xl shadow-sm px-6 py-3 ">

            <div className="flex flex-col sm:flex-row sm:itmes-center sm:justify-between gap-3 ">
              <div className="gap-1 items-center hidden md:block">
                <label className="text-sm text-gray-600 font-medium">Rows per page:</label>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {[5, 10, 20, 50, 100].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="px-5 py-2 text-sm font-bold text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm">
                  {pagination.page} / {pagination.totalPages ?? 1}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= (pagination.totalPages || 1)}
                  className="p-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popups */}
      <OrderFormPopup
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        onSuccess={() => {
          refetch();
          setShowOrderForm(false);
        }}
      />

      <ViewOrderDetails
        isOpen={showViewOrder}
        onClose={() => {
          setShowViewOrder(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder || undefined}
      />
    </div>
  );
};