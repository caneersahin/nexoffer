import { create } from 'zustand';
import { api } from '../lib/api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
}

export interface CreateProductData {
  name: string;
  description?: string;
  category?: string;
  price: number;
}

export interface UpdateProductData {
  name: string;
  description?: string;
  category?: string;
  price: number;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<Product>;
  updateProduct: (id: number, data: UpdateProductData) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/api/products');
      set({ products: res.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ürünler yüklenemedi',
        loading: false,
      });
    }
  },

  createProduct: async (data: CreateProductData) => {
    try {
      const res = await api.post('/api/products', data);
      const newProduct: Product = res.data;
      set((state) => ({ products: [...state.products, newProduct] }));
      return newProduct;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ürün oluşturulamadı');
    }
  },

  updateProduct: async (id: number, data: UpdateProductData) => {
    try {
      const res = await api.put(`/api/products/${id}`, data);
      const updated: Product = res.data;
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
      }));
      return updated;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ürün güncellenemedi');
    }
  },

  deleteProduct: async (id: number) => {
    try {
      await api.delete(`/api/products/${id}`);
      set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ürün silinemedi');
    }
  },
}));
