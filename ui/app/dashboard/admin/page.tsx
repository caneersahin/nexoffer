'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import {
  Building2,
  Shield,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { dashboard, fetchDashboard, upgradeCompany, loading } = useAdminStore();

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user, fetchDashboard]);

  const handleUpgrade = async (id: number) => {
    try {
      await upgradeCompany(id);
      toast.success('Şirket Pro pakete geçirildi');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Yönetici Paneli</h1>
        <p className="text-gray-600">Uygulama genel özetini görüntüleyin.</p>
      </div>

      {dashboard && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Şirket</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.totalCompanies}</p>
                  </div>
                  <Building2 className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pro Şirket</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.proCompanies}</p>
                  </div>
                  <Shield className="h-6 w-6 text-secondary-600" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bugünkü Gelir</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.revenueToday.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-accent-600" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.revenueTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-success-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Şirketler</h2>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-head">Şirket</th>
                      <th className="table-head">Teklif</th>
                      <th className="table-head">Kullanıcı</th>
                      <th className="table-head">Plan</th>
                      <th className="table-head">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {dashboard.companies.map((c) => (
                      <tr key={c.id} className="table-row">
                        <td className="table-cell font-medium">{c.name}</td>
                        <td className="table-cell">{c.offerCount}</td>
                        <td className="table-cell">{c.userCount}</td>
                        <td className="table-cell capitalize">{c.subscriptionPlan}</td>
                        <td className="table-cell">
                          {c.subscriptionPlan === 'Free' && (
                            <button onClick={() => handleUpgrade(c.id)} className="btn btn-primary btn-xs">Proya Geçir</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
