'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOfferStore } from '@/store/offerStore';
import { 
  TrendingUp, 
  FileText, 
  DollarSign, 
  Users, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { offers, fetchOffers, loading } = useOfferStore();
  const [stats, setStats] = useState({
    totalOffers: 0,
    sentOffers: 0,
    acceptedOffers: 0,
    totalAmount: 0,
    monthlyGrowth: 0,
  });

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    if (offers.length > 0) {
      const totalOffers = offers.length;
      const sentOffers = offers.filter(o => o.status === 'Sent').length;
      const acceptedOffers = offers.filter(o => o.status === 'Accepted').length;
      const totalAmount = offers.reduce((sum, offer) => sum + offer.totalAmount, 0);
      
      setStats({
        totalOffers,
        sentOffers,
        acceptedOffers,
        totalAmount,
        monthlyGrowth: 12.5, // Mock data
      });
    }
  }, [offers]);

  const recentOffers = offers.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Sent':
        return 'bg-blue-100 text-blue-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sent':
        return <Clock className="h-4 w-4" />;
      case 'Accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hoş geldiniz, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Teklif yönetim sisteminizin genel durumunu görüntüleyin.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Teklif</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOffers}</p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gönderilen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sentOffers}</p>
              </div>
              <div className="h-12 w-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kabul Edilen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedOffers}</p>
              </div>
              <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Tutar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAmount.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </p>
              </div>
              <div className="h-12 w-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Offers */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Son Teklifler</h2>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Yükleniyor...</p>
            </div>
          ) : recentOffers.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz teklif bulunmuyor</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-head">Teklif No</th>
                    <th className="table-head">Müşteri</th>
                    <th className="table-head">Tutar</th>
                    <th className="table-head">Durum</th>
                    <th className="table-head">Tarih</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {recentOffers.map((offer) => (
                    <tr key={offer.id} className="table-row">
                      <td className="table-cell font-medium">{offer.offerNumber}</td>
                      <td className="table-cell">{offer.customerName}</td>
                      <td className="table-cell">
                        {offer.totalAmount.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                          {getStatusIcon(offer.status)}
                          <span className="ml-1.5">{offer.status}</span>
                        </span>
                      </td>
                      <td className="table-cell text-gray-600">
                        {format(new Date(offer.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}