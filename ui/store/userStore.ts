import { create } from 'zustand';
import { api } from '../lib/api';
import { useCompanyStore } from './companyStore';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId?: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  firstName: string;
  lastName: string;
  email: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  setUsers: (users: User[]) => void;
  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserData) => Promise<User>;
  updateUser: (id: string, data: UpdateUserData) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  setUsers: (users: User[]) => set({ users }),

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/users');
      set({ users: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Kullanıcılar yüklenemedi',
        loading: false,
      });
    }
  },

  createUser: async (data: CreateUserData) => {
    try {
      const { company } = useCompanyStore.getState();
      const { users } = get();
      if (company && company.subscriptionPlan === 'Free' && users.length >= 2) {
        throw new Error('Ücretsiz planda en fazla 2 kullanıcı ekleyebilirsiniz.');
      }

      const response = await api.post('/api/users', data);
      const newUser: User = response.data;
      set((state) => ({ users: [...state.users, newUser] }));
      return newUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Kullanıcı oluşturulamadı');
    }
  },

  updateUser: async (id: string, data: UpdateUserData) => {
    try {
      const response = await api.put(`/api/users/${id}`, data);
      const updatedUser: User = response.data;
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
      }));
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Kullanıcı güncellenemedi');
    }
  },

  deleteUser: async (id: string) => {
    try {
      await api.delete(`/api/users/${id}`);
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Kullanıcı silinemedi');
    }
  },

  toggleUserStatus: async (id: string) => {
    try {
      await api.post(`/api/users/${id}/toggle-status`);
      set((state) => ({
        users: state.users.map((u) =>
          u.id === id ? { ...u, isActive: !u.isActive } : u
        ),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Kullanıcı durumu güncellenemedi');
    }
  },
}));
