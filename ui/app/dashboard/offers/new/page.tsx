'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOfferStore } from '@/store/offerStore';
import { useCustomerStore } from '@/store/customerStore';
import { useProductStore } from '@/store/productStore';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AutocompleteInput from '@/components/AutocompleteInput';

interface OfferItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function NewOfferPage() {
  const router = useRouter();
  const { createOffer } = useOfferStore();
  const { customers, fetchCustomers, createCustomer } = useCustomerStore();
  const { products, fetchProducts, createProduct } = useProductStore();
  const [loading, setLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    offerDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: '',
    currency: 'TRY' as 'TRY' | 'USD' | 'EUR',
    notes: '',
  });

  const [items, setItems] = useState<OfferItem[]>([
    { productId: undefined, description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (selectedCustomerId === '') {
      setFormData((data) => ({
        ...data,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
      }));
    } else {
      const c = customers.find((c) => c.id === selectedCustomerId);
      if (c) {
        setFormData((data) => ({
          ...data,
          customerName: c.name,
          customerEmail: c.email,
          customerPhone: c.phone || '',
          customerAddress: c.address || '',
        }));
      }
    }
  }, [selectedCustomerId, customers]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index: number, field: keyof OfferItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    
    // Recalculate total price
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const handleProductSelect = (index: number, name: string) => {
    const product = products.find(p => p.name === name);
    const newItems = [...items];
    if (product) {
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        description: product.name,
        unitPrice: product.price,
        totalPrice: newItems[index].quantity * product.price,
      };
    } else {
      newItems[index] = { ...newItems[index], productId: undefined };
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: undefined, description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedCustomerId === '') {
        await createCustomer({
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone || undefined,
          address: formData.customerAddress || undefined,
        });
      }

      // create products that are new
      for (const item of items) {
        if (!item.productId) {
          try {
            const newProduct = await createProduct({
              name: item.description,
              price: item.unitPrice,
            });
            item.productId = newProduct.id;
          } catch {}
        }
      }

      const offerData = {
        ...formData,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      await createOffer(offerData);
      toast.success('Teklif başarıyla oluşturuldu');
      router.push('/dashboard/offers');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Teklif</h1>
          <p className="text-gray-600">Müşteriniz için yeni bir teklif oluşturun.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Müşteri Bilgileri</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kayıtlı Müşteri
                </label>
                <select
                  className="input"
                  value={selectedCustomerId}
                  onChange={(e) =>
                    setSelectedCustomerId(
                      e.target.value === '' ? '' : parseInt(e.target.value)
                    )
                  }
                >
                  <option value="">Yeni Müşteri</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müşteri Adı *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  className="input"
                  value={formData.customerName}
                  onChange={handleFormChange}
                  placeholder="Müşteri adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  className="input"
                  value={formData.customerEmail}
                  onChange={handleFormChange}
                  placeholder="musteri@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  className="input"
                  value={formData.customerPhone}
                  onChange={handleFormChange}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Para Birimi
                </label>
                <select
                  name="currency"
                  className="input"
                  value={formData.currency}
                  onChange={handleFormChange}
                >
                  <option value="TRY">TRY - Türk Lirası</option>
                  <option value="USD">USD - Amerikan Doları</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres 
                </label>
                <input
                  type="text"
                  name="customerAddress"
                  
                  className="input"
                  value={formData.customerAddress}
                  onChange={handleFormChange}
                  placeholder="Müşteri adresi"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Offer Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Teklif Detayları</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teklif Tarihi
                </label>
                <input
                  type="date"
                  name="offerDate"
                  className="input"
                  value={formData.offerDate}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geçerlilik Tarihi *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  required
                  className="input"
                  value={formData.dueDate}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notlar
              </label>
              <textarea
                name="notes"
                rows={3}
                className="input"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Ek notlar..."
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ürün/Hizmetler</h2>
              <button
                type="button"
                onClick={addItem}
                className="btn btn-outline btn-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ürün Ekle
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ürün
                      </label>
                      <AutocompleteInput
                          value={item.description}
                          onChange={(val) => handleItemChange(index, 'description', val)} // ✅ Sadece yazma
                          onOptionSelect={(val) => handleProductSelect(index, val)}       // ✅ Sadece seçim
                          options={products.map((p) => p.name)}
                          placeholder="Ürün ara veya yeni ekle"
                        />

                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adet
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birim Fiyat
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Toplam
                        </label>
                        <div className="input bg-gray-50">
                          {item.totalPrice.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: formData.currency,
                          })}
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="ml-2 p-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Toplam Tutar</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getTotalAmount().toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: formData.currency,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-outline btn-md"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-md"
          >
            {loading ? 'Kaydediliyor...' : 'Teklif Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}