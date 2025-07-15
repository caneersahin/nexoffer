'use client';

import { useState, useEffect } from 'react';
import { useCompanyStore } from '@/store/companyStore';
import { useUserStore } from '@/store/userStore';
import { useOfferStore } from '@/store/offerStore';
import { usePaymentStore } from '@/store/paymentStore';
import PaymentModal from '@/components/PaymentModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import toast from 'react-hot-toast';
import { 
  CreditCard, 
  Check, 
  Star, 
  Calendar, 
  DollarSign,
  FileText,
  Users
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    currency: 'TRY',
    interval: 'aylık',
    features: [
      '3 teklif/ay',
      '2 kullanıcı',
      // 'Temel şablonlar',
      'E-posta desteği',
    ],
    limits: {
      offers: 3,
      users: 2,
      storage: '500MB',
    },
  },
  {
    name: 'Pro',
    price: 99,
    currency: 'TRY',
    interval: 'aylık',
    popular: true,
    features: [
      'Sınırsız teklif/ay',
      // 'Sınırsız kullanıcı',
      'E-posta desteği',
      //'Tüm şablonlar',
      'Öncelikli destek',
      // 'API erişimi',
    ],
    limits: {
      offers: 50,
      users: 5,
      storage: '5GB',
    },
  },
 
];

export default function BillingPage() {
  const { company, fetchCompany, upgradePlan } = useCompanyStore();
  const { users, fetchUsers } = useUserStore();
  const { offers, fetchOffers } = useOfferStore();
  const { payments, fetchPayments } = usePaymentStore();
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<{name: string; price: number} | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchCompany();
    fetchUsers();
    fetchOffers();
    fetchPayments();
  }, [fetchCompany, fetchUsers, fetchOffers, fetchPayments]);

  useEffect(() => {
    const now = new Date();
    const monthOffers = offers.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    setTotalAmount(monthOffers.reduce((sum, o) => sum + o.totalAmount, 0));
  }, [offers]);

  const handlePlanSelect = (planName: string, price: number) => {
    setSelectedPlan({ name: planName, price });
    if (price === 0) {
      setShowConfirm(true);
    } else {
      setShowPayment(true);
    }
  };

  const completePayment = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    try {
      await upgradePlan(selectedPlan.name, selectedPlan.price);
      toast.success('Plan başarıyla güncellendi');
      await fetchCompany();
      await fetchPayments();
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız');
    } finally {
      setProcessing(false);
      setShowPayment(false);
      setSelectedPlan(null);
    }
  };

  const confirmDowngrade = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    try {
      await upgradePlan(selectedPlan.name, selectedPlan.price);
      toast.success('Plan başarıyla güncellendi');
      await fetchCompany();
      await fetchPayments();
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız');
    } finally {
      setProcessing(false);
      setShowConfirm(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abonelik & Faturalama</h1>
        <p className="text-gray-600">Planınızı yönetin ve faturalandırma ayarlarını düzenleyin.</p>
      </div>

      {/* Current Plan */}
      {company && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Mevcut Planınız</h2>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-primary-900 capitalize">
                  {company.subscriptionPlan}
                </h3>
                <p className="text-sm text-primary-700">
                  {company.subscriptionEndDate
                    ? `${new Date(company.subscriptionEndDate).toLocaleDateString('tr-TR')} tarihinde yenilenir`
                    : 'Sınırsız kullanım'
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-900">
                  {company.subscriptionPlan === 'Free' ? 'Ücretsiz' :
                   company.subscriptionPlan === 'Pro' ? '₺99/ay' :
                   '₺299/ay'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Statistics */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Bu Ay Kullanım</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{company?.offersUsed ?? 0}</p>
              <p className="text-sm text-gray-500">Oluşturulan Teklif</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${company ? Math.min((company.offersUsed / 3) * 100, 100) : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {company?.subscriptionPlan === 'Free' ? '3 limitinden' : 'Sınırsız'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-500">Aktif Kullanıcı</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${company ? Math.min((users.length / (company.subscriptionPlan === 'Free' ? 2 : company.subscriptionPlan === 'Pro' ? 5 : users.length || 1)) * 100, 100) : 0}%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {
                company?.subscriptionPlan === 'Free' ? '2 limitinden' :
                 company?.subscriptionPlan === 'Pro' ? '5 limitinden' :
                 'Sınırsız'                
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
              <p className="text-sm text-gray-500">Toplam Teklif Değeri</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Bu ay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Planları Karşılaştır</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative border-2 rounded-lg p-6 ${
                  plan.popular
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Popüler
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500">/{plan.interval}</span>
                    )}
                  </div>
                </div>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6">
                  <button
                    onClick={() => handlePlanSelect(plan.name, plan.price)}
                    disabled={processing && selectedPlan?.name === plan.name}
                    className={`w-full btn btn-md ${
                      plan.popular
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                  >
                    {processing && selectedPlan?.name === plan.name ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        İşleniyor...
                      </div>
                    ) : company?.subscriptionPlan.toLowerCase() === plan.name.toLowerCase() ? (
                      'Mevcut Plan'
                    ) : (
                      `${plan.name} Planını Seç`
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Ödeme Geçmişi</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">{company?.subscriptionPlan} Plan</p>
                    <p className="text-sm text-gray-500">
                      {new Date(p.paidAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {p.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </p>
                  <p className="text-sm text-green-600">Ödendi</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedPlan && (
        <PaymentModal
          isOpen={showPayment}
          plan={selectedPlan.name}
          price={selectedPlan.price}
          onConfirm={completePayment}
          onClose={() => {
            if (!processing) {
              setShowPayment(false);
              setSelectedPlan(null);
            }
          }}
        />
      )}
      {selectedPlan && (
        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => {
            if (!processing) {
              setShowConfirm(false);
              setSelectedPlan(null);
            }
          }}
          onConfirm={confirmDowngrade}
          title="Ücretsiz Plana Geç"
          message="Pro plan süreniz bitene kadar pro özellikleri kullanmaya devam edeceksiniz. Ardından ücretsiz plana geçeceksiniz. Emin misiniz?"
          confirmText="Evet"
          cancelText="Vazgeç"
          type="warning"
        />
      )}
    </div>
  );
}