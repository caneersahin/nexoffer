'use client';

import { useState, useEffect } from 'react';
import { useProductStore, Product } from '@/store/productStore';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function ProductsClient() {
  const {
    products,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      price: product.price.toString(),
    });
    setShowEditModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct({
        name: form.name,
        description: form.description || undefined,
        category: form.category || undefined,
        price: parseFloat(form.price),
      });
      toast.success('Ürün eklendi');
      setForm({ name: '', description: '', category: '', price: '' });
      setShowCreateModal(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    try {
      await updateProduct(editingId, {
        name: form.name,
        description: form.description || undefined,
        category: form.category || undefined,
        price: parseFloat(form.price),
      });
      toast.success('Ürün güncellendi');
      setShowEditModal(false);
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (selectedProductId === null) return;
    try {
      await deleteProduct(selectedProductId);
      toast.success('Ürün silindi');
      setDeleteDialogOpen(false);
      setSelectedProductId(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-600">Ürünlerinizi yönetin.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-md">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Ürün
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Ürün</th>
                  <th className="table-head">Kategori</th>
                  <th className="table-head">Fiyat</th>
                  <th className="table-head">İşlemler</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {products.map((product) => (
                  <tr key={product.id} className="table-row">
                    <td className="table-cell font-medium">{product.name}</td>
                    <td className="table-cell">{product.category || '-'}</td>
                    <td className="table-cell">{product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-400 hover:text-blue-600"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedProductId(product.id); setDeleteDialogOpen(true); }}
                          className="text-red-400 hover:text-red-600"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={4} className="table-cell text-center text-sm text-gray-500">
                      Henüz ürün yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Ürün</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ürün adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Açıklama"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input
                  type="text"
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Kategori"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setForm({ name: '', description: '', category: '', price: '' }); }}
                  className="btn btn-outline btn-md"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary btn-md">Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürünü Düzenle</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ürün adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Açıklama"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input
                  type="text"
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Kategori"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingId(null); }}
                  className="btn btn-outline btn-md"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary btn-md">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Ürünü Sil"
        message="Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        type="danger"
      />
    </div>
  );
}
