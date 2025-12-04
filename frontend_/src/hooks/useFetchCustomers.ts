import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BaseUrl } from '../config/BaseUrl.config';

interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Customer {
  _id: string;
  name: string;
  gst?: string;
  billing?: Address;
  shipping?: Address;
  sameAsBilling?: boolean;
  phones?: string[];
  email?: string;
  remarks?: string;
  uniqueId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

interface UseCustomersResult {
  customers: Customer[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  refetch: (page?: number, limit?: number, query?: string) => void;
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export function useCustomers(initialPage = 1, initialLimit = 10): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [query, setQuery] = useState('');

  const fetchCustomers = useCallback(async (p = page, l = limit, q = query) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BaseUrl}/v1/customers`, {
        params: { page: p, limit: l, q },
      });

      setCustomers(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || 'Error fetching customers');
    } finally {
      setLoading(false);
    }
  }, [page, limit, query]);

  useEffect(() => {
    fetchCustomers(page, limit, query);
  }, [page, limit, query, fetchCustomers]);

  return {
    customers,
    pagination,
    loading,
    error,
    refetch: fetchCustomers,
    setQuery,
    setPage,
    setLimit,
  };
}
