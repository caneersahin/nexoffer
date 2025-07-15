'use client';

import { useState,useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useCompanyStore } from '@/store/companyStore';
import {
  Plus,
  Trash2,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ConfirmDialog from '@/components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function UsersClient() {
  const { user: currentUser } = useAuthStore();
  const { users, fetchUsers, createUser, deleteUser, toggleUserStatus } =
    useUserStore();
  const { company } = useCompanyStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUser(newUser);
      setNewUser({ firstName: '', lastName: '', email: '', password: '' });
      setShowCreateModal(false);
      toast.success('Kullanıcı başarıyla oluşturuldu');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUserId) {
      try {
        await deleteUser(selectedUserId);
        setDeleteDialogOpen(false);
        setSelectedUserId(null);
        toast.success('Kullanıcı silindi');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
      toast.success('Kullanıcı durumu güncellendi');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-gray-600">Şirket kullanıcılarını yönetin ve düzenleyin.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md"
          disabled={company?.subscriptionPlan === 'Free' && users.length >= 2}
          title={company?.subscriptionPlan === 'Free' && users.length >= 2 ? 'Ücretsiz planda en fazla 2 kullanıcı ekleyebilirsiniz.' : ''}
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kullanıcı
        </button>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Kullanıcı</th>
                  <th className="table-head">E-posta</th>
                  <th className="table-head">Durum</th>
                  <th className="table-head">Katılma Tarihi</th>
                  <th className="table-head">İşlemler</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {users.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.id === currentUser?.id && '(Siz)'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Pasif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className="text-blue-400 hover:text-blue-600"
                          title={user.isActive ? 'Pasif yap' : 'Aktif yap'}
                        >
                          {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-400 hover:text-red-600"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Kullanıcı Ekle</h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="Ad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Soyad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="kullanici@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                <input
                  type="password"
                  required
                  className="input"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline btn-md">
                  İptal
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  Kullanıcı Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        title="Kullanıcıyı Sil"
        message="Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        type="danger"
      />
    </div>
  );
}

