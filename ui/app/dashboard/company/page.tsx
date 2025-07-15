'use client';

import { useEffect, useState } from 'react';
import { useCompanyStore } from '@/store/companyStore';
import { Building2, Upload, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanyPage() {
  const { company, fetchCompany, updateCompany, uploadLogo, loading } = useCompanyStore();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxNumber: '',
    iban: '',
    website: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        taxNumber: company.taxNumber || '',
        iban: company.iban || '',
        website: company.website || '',
      });
    }
  }, [company]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await updateCompany(formData);
      
      if (logoFile) {
        await uploadLogo(logoFile);
        setLogoFile(null);
        setPreviewUrl(null);
      }
      
      toast.success('Şirket bilgileri güncellendi');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading && !company) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Şirket Profili</h1>
        <p className="text-gray-600">Şirket bilgilerinizi yönetin ve güncelleyin.</p>
      </div>

      {/* Logo Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Şirket Logosu</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center border">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Logo Preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : company?.logo ? (
                  <img
                    src={company.logo}
                    alt="Company Logo"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Logo Yükle</h3>
              <p className="text-sm text-gray-500">
                JPG, PNG veya GIF formatında, maksimum 5MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Şirket Bilgileri</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şirket Adı
              </label>
              <input
                type="text"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Şirket adı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="info@sirket.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                className="input"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Web Sitesi
              </label>
              <input
                type="url"
                name="website"
                className="input"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://www.sirket.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vergi Numarası
              </label>
              <input
                type="text"
                name="taxNumber"
                className="input"
                value={formData.taxNumber}
                onChange={handleInputChange}
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IBAN
              </label>
              <input
                type="text"
                name="iban"
                className="input"
                value={formData.iban}
                onChange={handleInputChange}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <textarea
                name="address"
                rows={3}
                className="input"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Şirket adresi"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {company && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Abonelik Bilgileri</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Plan
                </label>
                <div className="p-3 bg-gray-50 rounded-lg input">
                  <span className="font-medium capitalize">{company.subscriptionPlan}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Tarihi
                </label>
                <div className="p-3 bg-gray-50 rounded-lg input">
                  {new Date(company.subscriptionStartDate).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Tarihi
                </label>
                <div className="p-3 bg-gray-50 rounded-lg input">
                  {company.subscriptionEndDate
                    ? new Date(company.subscriptionEndDate).toLocaleDateString('tr-TR')
                    : 'Sınırsız'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary btn-md"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}