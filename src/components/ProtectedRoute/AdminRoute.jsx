'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/AuthProvider/AuthProvider';
import AuthLoading from '@/components/AuthLoading';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return loading ? <AuthLoading /> : user?.role === 'admin' ? children : null;
};

export default AdminRoute;