'use client';

import { useEffect } from 'react';
import CustomersClient from './CustomersClient';
import { useCustomerStore } from '@/store/customerStore';

export default function CustomersPage() {
  const { fetchCustomers } = useCustomerStore();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return <CustomersClient />;
}
