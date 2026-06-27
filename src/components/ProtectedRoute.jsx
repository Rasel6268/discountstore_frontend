'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/AuthProvider/AuthProvider';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // ❌ Not logged in → capture full path and redirect to login
    if (!user) {
      // window.location gets the full path + query params (e.g. /checkout?item=123)
      const fullPath = window.location.pathname + window.location.search;
      router.push(`/auth/login?redirect=${encodeURIComponent(fullPath)}`);
      return;
    }

    // 🛡️ Role check
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // redirect based on role (aligned with AuthProvider routes)
      if (user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/profile');
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;