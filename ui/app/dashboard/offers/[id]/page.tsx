'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useOfferStore } from '@/store/offerStore';
import { ArrowLeft, Edit, Send, Download, Check, X, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function OfferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { currentOffer: offer, fetchOffer, sendOffer, downloadOfferPdf, acceptOffer, rejectOffer, cancelOffer, loading } = useOfferStore();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (!isNaN(id)) {
      fetchOffer(id);
    }
  }, [fetchOffer, id]);

  const handleSendOffer = async () => {
    setSending(true);
    try {
      await sendOffer(id);
      toast.success('Teklif gönderildi');
      setSendDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleAcceptOffer = async () => {
    try {
      await acceptOffer(id);
      toast.success('Teklif onaylandı');
      setAcceptDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRejectOffer = async () => {
    try {
      await rejectOffer(id);
      toast.success('Teklif reddedildi');
      setRejectDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancelOffer = async () => {
    try {
      await cancelOffer(id);
      toast.success('Teklif iptal edildi');
      setCancelDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading && !offer) {
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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Teklif Detayı</h1>
          <p className="text-gray-600">Teklifi görüntüleyebilir ve gönderebilirsiniz.</p>
        </div>
        <button
          onClick={() => router.push(`/dashboard/offers/${id}/edit`)}
          className="btn btn-outline btn-sm"
        >
          <Edit className="h-4 w-4 mr-2" />
          Düzenle
        </button>
      </div>

      <div className="card">
        <div className="card-body space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {offer.customerName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {offer.customerEmail}
              </div>
            </div>
            {offer.customerPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <div className="p-3 bg-gray-50 rounded-lg">{offer.customerPhone}</div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
              <div className="p-3 bg-gray-50 rounded-lg">{offer.currency}</div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <div className="p-3 bg-gray-50 rounded-lg">{offer.customerAddress}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teklif Tarihi</label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {format(new Date(offer.offerDate), 'dd MMM yyyy', { locale: tr })}
              </div>
            </div>
            {offer.dueDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Geçerlilik Tarihi</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {format(new Date(offer.dueDate), 'dd MMM yyyy', { locale: tr })}
                </div>
              </div>
            )}
            {offer.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {offer.notes}
                </div>
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
                      <p className="text-2xl font-bold text-gray-900">
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

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => downloadOfferPdf(id)}
          className="btn btn-outline btn-md"
        >
          <Download className="h-4 w-4 mr-2" />
          PDF Gör
        </button>
        <button
          onClick={() => setSendDialogOpen(true)}
          className="btn btn-primary btn-md"
        >
          <Send className="h-4 w-4 mr-2" />
          Teklifi Gönder
        </button>
        {offer.status !== 'Accepted' && (
          <button
            onClick={() => setAcceptDialogOpen(true)}
            className="btn btn-success btn-md"
          >
            <Check className="h-4 w-4 mr-2" />
            Onayla
          </button>
        )}
        {offer.status !== 'Rejected' && (
          <button
            onClick={() => setRejectDialogOpen(true)}
            className="btn btn-danger btn-md"
          >
            <X className="h-4 w-4 mr-2" />
            Reddet
          </button>
        )}
        {offer.status !== 'Cancelled' && (
          <button
            onClick={() => setCancelDialogOpen(true)}
            className="btn btn-outline btn-md"
          >
            <Ban className="h-4 w-4 mr-2" />
            İptal Et
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        onConfirm={handleSendOffer}
        title="Teklifi Gönder"
        message="Teklifi müşteriye göndermek istediğinizden emin misiniz?"
        confirmText="Gönder"
        processing={sending}
        type="info"
      />
      <ConfirmDialog
        isOpen={acceptDialogOpen}
        onClose={() => setAcceptDialogOpen(false)}
        onConfirm={handleAcceptOffer}
        title="Teklifi Onayla"
        message="Bu teklifi onaylamak istediğinizden emin misiniz?"
        confirmText="Onayla"
        type="success"
      />
      <ConfirmDialog
        isOpen={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleRejectOffer}
        title="Teklifi Reddet"
        message="Bu teklifi reddetmek istediğinizden emin misiniz?"
        confirmText="Reddet"
        type="danger"
      />
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelOffer}
        title="Teklifi İptal Et"
        message="Bu teklifi iptal etmek istediğinizden emin misiniz?"
        confirmText="İptal Et"
        type="warning"
      />
    </div>
  );
}
