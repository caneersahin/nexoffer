'use client';

import { useEffect } from 'react';
import { useProductStore } from '@/store/productStore';
import ProductsClient from './ProductsClient';

export default function ProductsPage() {
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return <ProductsClient />;
}
