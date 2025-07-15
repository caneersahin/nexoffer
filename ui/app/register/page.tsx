'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        companyPhone: formData.companyPhone,
      });
      toast.success('Kayıt başarılı! Hoş geldiniz!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Kayıt yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
   <div className="flex justify-center">
    <div className="flex items-center space-x-2">
      <img src="/logos/logo5.png" alt="Nexoffer Logo" className="h-35 w-72"  />
    </div>
  </div>

        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Şirketinizi kaydedin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Giriş yapın
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Ad
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="input"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Adınız"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Soyad
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="input"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Şirket Adı
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                className="input"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Şirket adınız"
              />
            </div>

            <div>
              <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700">
                Şirket Telefonu
              </label>
              <input
                id="companyPhone"
                name="companyPhone"
                type="tel"
                required
                className="input"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">
                Şirket Adresi
              </label>
              <input
                id="companyAddress"
                name="companyAddress"
                type="text"
                required
                className="input"
                value={formData.companyAddress}
                onChange={handleChange}
                placeholder="Şirket adresiniz"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt ol'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}