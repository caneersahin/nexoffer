'use client';

import { useState, useEffect } from 'react';
import { useCustomerStore, Customer } from '@/store/customerStore';
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function CustomersClient() {
  const {
    customers,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomerStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openEditModal = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setShowEditModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      toast.success('Müşteri eklendi');
      setForm({ name: '', email: '', phone: '', address: '' });
      setShowCreateModal(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    try {
      await updateCustomer(editingId, {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      toast.success('Müşteri güncellendi');
      setShowEditModal(false);
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (selectedCustomerId === null) return;
    try {
      await deleteCustomer(selectedCustomerId);
      toast.success('Müşteri silindi');
      setDeleteDialogOpen(false);
      setSelectedCustomerId(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
          <p className="text-gray-600">Müşterilerinizi yönetin.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-md">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Müşteri
        </button>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Müşteri</th>
                  <th className="table-head">E-posta</th>
                  <th className="table-head">Telefon</th>
                  <th className="table-head">Adres</th>
                  <th className="table-head">İşlemler</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {customers.map((customer) => (
                  <tr key={customer.id} className="table-row">
                    <td className="table-cell font-medium">{customer.name}</td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        {customer.phone || '-'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        {customer.address || '-'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="text-blue-400 hover:text-blue-600"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomerId(customer.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-400 hover:text-red-600"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="table-cell text-center text-sm text-gray-500">
                      Henüz müşteri yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Müşteri</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Müşteri adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="musteri@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input
                  type="text"
                  className="input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Adres"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setForm({ name: '', email: '', phone: '', address: '' });
                  }}
                  className="btn btn-outline btn-md"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteriyi Düzenle</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Müşteri adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="musteri@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input
                  type="text"
                  className="input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Adres"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingId(null);
                  }}
                  className="btn btn-outline btn-md"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Müşteriyi Sil"
        message="Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        type="danger"
      />
    </div>
  );
}
