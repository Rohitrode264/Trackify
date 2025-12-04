import React, { useState } from 'react';
import { useCustomers } from '../../hooks/useFetchCustomers';
import Button from '../../components/Button';
import {
  Search,
  UserPlus,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Phone,
  FileText,
  Calendar,
  ExternalLink,
  User
} from 'lucide-react';
import CustomerFormPopup from '../../components/PopUps/CustomerFormPopup';
import ViewCustomerPopup from '../../components/PopUps/ViewCustomerDetails';
import { useNavigate } from 'react-router-dom';

export const Customer: React.FC = () => {
  const {
    customers,
    pagination,
    loading,
    error,
    setPage,
    setLimit,
    setQuery,
    refetch,
  } = useCustomers(1, 10);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent, customerId: string) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/customers/${customerId}`);
  };

  const handleViewClick = (e: React.MouseEvent, customer: any) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setViewOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, customer: any) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setFormMode('edit');
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="bg-white backdrop-blur-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customers</h1>
                <p className="text-xs sm:text-sm text-gray-500">Manage and view all your customer information</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search bar */}
              <div className="relative flex-1 sm:flex-initial group">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white shadow-sm text-sm"
                />
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>

              {/* Add Customer Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setFormMode('add');
                  setSelectedCustomer(null);
                  setFormOpen(true);
                }}
                className="shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-2">Add Customer</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col px-4 sm:px-6 lg:px-8 py-4 gap-4">
        {/* Stats Bar */}
        {pagination && (
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-sm border border-gray-200 px-6 py-3 flex-shrink-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">
                  Showing <span className="font-bold text-blue-600">{customers.length}</span> of{' '}
                  <span className="font-bold text-gray-900">{pagination.total}</span> customers
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
                <span className="text-gray-500 mt-4 font-medium">Loading customers...</span>
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
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <span className="text-gray-600 font-semibold text-lg">No customers found</span>
                <span className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</span>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block h-full">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">
                          GST Number
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">
                          Created Date
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customers.map((cust) => (
                        <tr
                          key={cust._id}
                          className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                          onClick={(e) => handleRowClick(e, cust._id)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md flex-shrink-0">
                                <User className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">
                                    {cust.name || '-'}
                                  </span>
                                  <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                {cust.uniqueId && (
                                  <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-1">
                                    {cust.uniqueId}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">{cust.phones?.[0] || '-'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <span className="text-sm truncate max-w-xs">{cust.email || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700">
                                {cust.gst || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {cust.createdAt
                                  ? new Date(cust.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                  : '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 hover:shadow-md transition-all"
                                onClick={(e) => handleViewClick(e, cust)}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 hover:shadow-md transition-all"
                                onClick={(e) => handleEditClick(e, cust)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
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
                  {customers.map((cust) => (
                    <div
                      key={cust._id}
                      className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer relative overflow-hidden"
                      onClick={(e) => handleRowClick(e, cust._id)}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-900 truncate">
                                {cust.name || '-'}
                              </span>
                              <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            {cust.uniqueId && (
                              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                {cust.uniqueId}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <button
                            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all"
                            onClick={(e) => handleViewClick(e, cust)}
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all"
                            onClick={(e) => handleEditClick(e, cust)}
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="text-sm truncate">{cust.phones?.[0] || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="text-sm truncate">{cust.email || '-'}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 font-medium">{cust.gst || 'No GST'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {cust.createdAt
                                ? new Date(cust.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: '2-digit'
                                })
                                : '-'}
                            </span>
                          </div>
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
        {pagination && !loading && customers.length > 0 && (
          <div className="border-t border-gray-200 bg-gradient-to-r from-white to-blue-50/50 rounded-xl shadow-sm px-6 py-3 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 font-medium">Rows per page:</label>
                <select
                  value={pagination.limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {[5, 10, 20, 50].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage(pagination.page - 1)}
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
                  onClick={() => setPage(pagination.page + 1)}
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
      <CustomerFormPopup
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => refetch()}
        customer={selectedCustomer}
        mode={formMode}
      />

      <ViewCustomerPopup
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};