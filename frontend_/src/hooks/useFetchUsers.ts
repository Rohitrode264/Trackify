import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BaseUrl } from '../config/BaseUrl.config';


export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  resetPasswordExpires?: string;
  resetPasswordOTP?: string;
}

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BaseUrl}/admin/users`);

      setUsers(response.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
