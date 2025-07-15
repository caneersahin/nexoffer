'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  User,
  CreditCard,
  Settings,
  Package,
  Shield,
  Menu,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Teklifler', href: '/dashboard/offers', icon: FileText },
  { name: 'Müşteriler', href: '/dashboard/customers', icon: User },
  { name: 'Ürünler', href: '/dashboard/products', icon: Package },
  { name: 'Şirket', href: '/dashboard/company', icon: Building2 },
  { name: 'Kullanıcılar', href: '/dashboard/users', icon: Users },
  { name: 'Abonelik', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  const links = [...navigation];
  if (user?.role === 'SuperAdmin') {
    links.push({ name: 'Admin', href: '/dashboard/admin', icon: Shield });
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md border dark:border-gray-700"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b dark:border-gray-700">
           <img src="/logos/logo5.png" alt="Nexoffer Logo" />
          </div>


          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {links.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500 dark:bg-primary-600/20 dark:text-primary-200'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 Nexoffer
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}