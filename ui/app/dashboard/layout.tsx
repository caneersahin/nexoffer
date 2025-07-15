'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/companyStore';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import SubscriptionExpired from '@/components/SubscriptionExpired';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthStore();
  const { company, fetchCompany } = useCompanyStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchCompany();
    }
  }, [user, isLoading, router, fetchCompany]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (company && !company.isActive) {
    return <SubscriptionExpired subscriptionEndDate={company.subscriptionEndDate} />;
  }

  return (
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <Sidebar />
  <div className="main-content-with-sidebar ml-0 md:ml-[16rem]">
    <Header />
    <main className="p-6">{children}</main>
  </div>
</div>

  );
}