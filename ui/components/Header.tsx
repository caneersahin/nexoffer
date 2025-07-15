'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/companyStore';
import { Bell, Search, User, LogOut, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { company } = useCompanyStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
            /> */}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {company && (
            <a
              href="/dashboard/billing"
              className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 mr-2 hover:underline cursor-pointer"
            >
              {company.subscriptionPlan === 'Free'
                ? `Ücretsiz Plan - ${company.offersUsed}/3`
                : `${company.subscriptionPlan} Planı`}
            </a>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>

          <ThemeToggle />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>

              {/* Bu kısım sadece md ve üstü ekranlarda gözükecek */}
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>

              {/* Chevron da sadece md ve üstü gözüksün istersen */}
              <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
            </button>


            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}