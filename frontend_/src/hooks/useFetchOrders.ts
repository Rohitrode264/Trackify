import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BaseUrl } from '../config/BaseUrl.config';

interface OrderTotals {
  subTotal: number;
  totalGst: number;
  shippingTax: number;
  grandTotal: number;
}

interface OrderItem {
  productName: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  isGstApplicable: boolean;
  gstPercent: number;
  gstAmount: number;
  formulation?: string | null;
  formulationAddedBy?: string | null;
  formulationAddedAt?: string | null;
  formulationVisible?: boolean;
  images: string[];
}

interface OrderAudit {
  _id: string;
  user: string;
  action: string;
  at: string;
}

interface OrderCustomer {
  _id: string;
  name: string;
  phones?: string[];
  email?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  totals: OrderTotals;
  customer: OrderCustomer;
  createdBy: { _id: string; name: string; email: string; };
  items: OrderItem[];
  shippingCharge: number;
  showFormulationToPackaging: boolean;
  status: string;
  audit: OrderAudit[];
  packedImages: string[];
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

interface UseOrdersResult {
  orders: Order[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  refetch: (params?: Partial<QueryParams>) => void;
  setFilters: (filters: Partial<QueryParams>) => void;
  filters: QueryParams;
}

interface QueryParams {
  page: number;
  limit: number;
  from?: string;
  to?: string;
  status?: string;
  telecaller?: string;
}

export function useOrders(
  initialParams: QueryParams = { page: 1, limit: 10 }
): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<QueryParams>(initialParams);

  // ✅ Stable setFilters function
  const setFilters = useCallback((patch: Partial<QueryParams>) => {
    setFiltersState(prev => ({ ...prev, ...patch }));
  }, []);

  // ✅ Stable fetchOrders function (does not depend on filters)
  const fetchOrders = useCallback(
    async (params: Partial<QueryParams> = {}) => {
      try {
        setLoading(true);
        setError(null);

        // merge current filters with any new params
        const mergedParams = { ...filters, ...params } as QueryParams;

        const response = await axios.get(`${BaseUrl}/v1/orders`, {
          params: mergedParams,
          headers: { Authorization: localStorage.getItem('auth_token') },
        });

        console.log(response);

        setOrders(response.data.data);
        setPagination({
          ...response.data.pagination,
          totalPages: Math.ceil(
            response.data.pagination.total / response.data.pagination.limit
          ),
        });
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    },
    [filters] // keep filters as dependency, safe now because we don't update filters here
  );

  // ✅ Fetch on mount and when filters change
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Only depend on filters (not fetchOrders)

  return {
    orders,
    pagination,
    loading,
    error,
    refetch: fetchOrders,
    setFilters,
    filters,
  };
}
