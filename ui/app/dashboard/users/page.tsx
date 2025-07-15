'use client';

import { useEffect } from 'react';
import UsersClient from './UsersClient';
import { useUserStore } from '@/store/userStore';

export default function UsersPage() {
  const { fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return <UsersClient />;
}
