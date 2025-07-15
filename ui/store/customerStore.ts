import { create } from 'zustand';
import { api } from '../lib/api';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  createCustomer: (data: CreateCustomerData) => Promise<Customer>;
  updateCustomer: (id: number, data: UpdateCustomerData) => Promise<Customer>;
  deleteCustomer: (id: number) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/api/customers');
      set({ customers: res.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Müşteriler yüklenemedi',
        loading: false,
      });
    }
  },

  createCustomer: async (data: CreateCustomerData) => {
    try {
      const res = await api.post('/api/customers', data);
      const newCustomer: Customer = res.data;
      set((state) => ({ customers: [...state.customers, newCustomer] }));
      return newCustomer;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Müşteri oluşturulamadı');
    }
  },

  updateCustomer: async (id: number, data: UpdateCustomerData) => {
    try {
      const res = await api.put(`/api/customers/${id}`, data);
      const updated: Customer = res.data;
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? updated : c)),
      }));
      return updated;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Müşteri güncellenemedi');
    }
  },

  deleteCustomer: async (id: number) => {
    try {
      await api.delete(`/api/customers/${id}`);
      set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Müşteri silinemedi');
    }
  },
}));
