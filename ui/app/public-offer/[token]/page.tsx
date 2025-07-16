'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OfferItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Offer {
  id: number;
  offerNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  offerDate: string;
  dueDate?: string;
  currency: 'TRY' | 'USD' | 'EUR';
  notes?: string;
  totalAmount: number;
  createdAt: string;
  companyName: string;
  items: OfferItem[];
}

export default function PublicOfferPage() {
  const { token } = useParams<{ token: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await api.get(`/api/offers/public/${token}`);
        setOffer(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOffer();
  }, [token]);

  const downloadPdf = async () => {
    const res = await api.get(`/api/offers/pdf/${token}.pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!offer) {
    return <div className="text-center py-12 text-gray-600">Teklif bulunamadı.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Teklif Detayı</h1>
      <div className="card">
        <div className="card-body space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Müşteri</label>
              <div className="p-3 bg-gray-50 rounded-lg">{offer.customerName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              <div className="p-3 bg-gray-50 rounded-lg">{offer.customerEmail}</div>
            </div>
            {offer.customerPhone && (
              <div>
                <label className="block text-sm font-medium mb-1">Telefon</label>
                <div className="p-3 bg-gray-50 rounded-lg">{offer.customerPhone}</div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Para Birimi</label>
              <div className="p-3 bg-gray-50 rounded-lg">{offer.currency}</div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Adres</label>
              <div className="p-3 bg-gray-50 rounded-lg">{offer.customerAddress}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teklif Tarihi</label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {format(new Date(offer.offerDate), 'dd MMM yyyy', { locale: tr })}
              </div>
            </div>
            {offer.dueDate && (
              <div>
                <label className="block text-sm font-medium mb-1">Geçerlilik Tarihi</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {format(new Date(offer.dueDate), 'dd MMM yyyy', { locale: tr })}
                </div>
              </div>
            )}
            {offer.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notlar</label>
                <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">{offer.notes}</div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Ürün/Hizmetler</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-head">Açıklama</th>
                    <th className="table-head">Adet</th>
                    <th className="table-head">Birim Fiyat</th>
                    <th className="table-head">İndirim %</th>
                    <th className="table-head">KDV %</th>
                    <th className="table-head">Tutar</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {offer.items.map(item => (
                    <tr key={item.id} className="table-row">
                      <td className="table-cell">{item.description}</td>
                      <td className="table-cell">{item.quantity}</td>
                      <td className="table-cell">
                        {item.unitPrice.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: offer.currency,
                        })}
                      </td>
                      <td className="table-cell">{item.discount.toLocaleString('tr-TR')}%</td>
                      <td className="table-cell">{item.vatRate}</td>
                      <td className="table-cell">
                        {item.totalPrice.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: offer.currency,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              {(() => {
                const totalBeforeDiscount = offer.items.reduce(
                  (s, i) => s + i.quantity * i.unitPrice,
                  0
                );
                const discountTotal = offer.items.reduce(
                  (s, i) => s + i.quantity * i.unitPrice * (i.discount / 100),
                  0
                );
                const subTotal = totalBeforeDiscount - discountTotal;
                const vatTotal = offer.items.reduce(
                  (s, i) => s + i.totalPrice * (i.vatRate / 100),
                  0
                );
                const grandTotal = subTotal + vatTotal;
                return (
                  <div className="space-y-1 text-right">
                    <div>
                      <span className="text-sm text-gray-600 mr-2">Ara Toplam:</span>
                      <span className="font-medium">
                        {totalBeforeDiscount.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: offer.currency,
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 mr-2">İndirim:</span>
                      <span className="font-medium">
                        {discountTotal.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: offer.currency,
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 mr-2">Ara Toplam (İndirimli):</span>
                      <span className="font-medium">
                        {subTotal.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: offer.currency,
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 mr-2">KDV:</span>
                      <span className="font-medium">
                        {vatTotal.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: offer.currency,
                        })}
                      </span>
                    </div>
                    <div className="pt-1 border-t">
                      <p className="text-sm text-gray-600">Genel Toplam</p>
                      <p className="text-2xl font-bold">
                        {grandTotal.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: offer.currency,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={downloadPdf} className="btn btn-outline btn-md">
          <Download className="h-4 w-4 mr-2" /> PDF Gör
        </button>
      </div>
    </div>
  );
}
