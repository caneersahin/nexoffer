'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOfferStore } from '@/store/offerStore';
import {
  Plus,
  Search,
  Calendar,
  User,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import OfferActionsDropdown from '@/components/OfferActionsDropdown';
import toast from 'react-hot-toast';


export default function OffersPage() {
  const router = useRouter();
  const { offers, fetchOffers, deleteOffer, sendOffer, downloadOfferPdf, acceptOffer, rejectOffer, loading } = useOfferStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [offerToSend, setOfferToSend] = useState<number | null>(null);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [offerToAccept, setOfferToAccept] = useState<number | null>(null);
  const [offerToReject, setOfferToReject] = useState<number | null>(null);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.offerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteOffer = async () => {
    if (selectedOfferId) {
      try {
        await deleteOffer(selectedOfferId);
        toast.success('Teklif silindi');
        setDeleteDialogOpen(false);
        setSelectedOfferId(null);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleSendOffer = async () => {
    if (!offerToSend) return;
    try {
      await sendOffer(offerToSend);
      toast.success('Teklif gönderildi');
      setSendDialogOpen(false);
      setOfferToSend(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAcceptOffer = async () => {
    if (!offerToAccept) return;
    try {
      await acceptOffer(offerToAccept);
      toast.success('Teklif onaylandı');
      setAcceptDialogOpen(false);
      setOfferToAccept(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRejectOffer = async () => {
    if (!offerToReject) return;
    try {
      await rejectOffer(offerToReject);
      toast.success('Teklif reddedildi');
      setRejectDialogOpen(false);
      setOfferToReject(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleShareWhatsapp = (offer: typeof offers[0]) => {
    const pageLink = `${window.location.origin}/public-offer/${offer.publicToken}`;
    const mesaj = `Merhaba, size özel teklifiniz hazırlandı. İncelemek için tıklayın:\n${pageLink}`;
    const whatsappLink = offer.customerPhone
      ? `https://wa.me/${offer.customerPhone}?text=${encodeURIComponent(mesaj)}`
      : `https://wa.me/?text=${encodeURIComponent(mesaj)}`;
    window.open(whatsappLink, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Sent':
        return 'bg-blue-100 text-blue-800';
      case 'Viewed':
        return 'bg-indigo-100 text-indigo-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teklifler</h1>
          <p className="text-gray-600">Tüm tekliflerinizi buradan yönetebilirsiniz.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/offers/new')}
          className="btn btn-primary btn-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Teklif
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Teklif numarası veya müşteri adı ile ara..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="Draft">Taslak</option>
                <option value="Sent">Gönderildi</option>
                <option value="Viewed">Görüntülendi</option>
                <option value="Accepted">Kabul Edildi</option>
                <option value="Rejected">Reddedildi</option>
                <option value="Expired">Süresi Doldu</option>
                <option value="Cancelled">İptal Edildi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Teklif bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin.'
                  : 'Başlamak için ilk teklifinizi oluşturun.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/dashboard/offers/new')}
                    className="btn btn-primary btn-md"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Teklif
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto max-w-full lg:overflow-visible">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-head">Teklif</th>
                    <th className="table-head">Müşteri</th>
                    <th className="table-head">Tutar</th>
                    <th className="table-head">Durum</th>
                    <th className="table-head">Tarih</th>
                    <th className="table-head">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id} className="table-row">
                      <td className="table-cell">
                        <div className="font-medium">{offer.offerNumber}</div>
                        <div className="text-sm text-gray-500">
                          {offer.items.length} ürün
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium">{offer.customerName}</div>
                            <div className="text-sm text-gray-500">{offer.customerEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="font-medium">
                            {offer.totalAmount.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: offer.currency,
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(offer.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </div>
                      </td>
                      <td className="table-cell relative z-10">
                        <OfferActionsDropdown
                          onView={() => router.push(`/dashboard/offers/${offer.id}`)}
                          onEdit={() => router.push(`/dashboard/offers/${offer.id}/edit`)}
                          onSend={() => {
                            setOfferToSend(offer.id);
                            setSendDialogOpen(true);
                          }}
                          onPdf={() => downloadOfferPdf(offer.id)}
                          onWhatsapp={() => handleShareWhatsapp(offer)}
                          onAccept={() => {
                            setOfferToAccept(offer.id);
                            setAcceptDialogOpen(true);
                          }}
                          onReject={() => {
                            setOfferToReject(offer.id);
                            setRejectDialogOpen(true);
                          }}
                          onDelete={() => {
                            setSelectedOfferId(offer.id);
                            setDeleteDialogOpen(true);
                          }}
                          showAccept={offer.status !== 'Accepted'}
                          showReject={offer.status !== 'Rejected'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteOffer}
        title="Teklifi Sil"
        message="Bu teklifi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        type="danger"
      />

      {/* Send Confirmation Dialog */}
      <ConfirmDialog
        isOpen={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        onConfirm={handleSendOffer}
        title="Teklifi Gönder"
        message="Teklifi müşteriye göndermek istediğinizden emin misiniz?"
        confirmText="Gönder"
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
    </div>
  );
}