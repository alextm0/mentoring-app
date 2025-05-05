'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/lib/store/auth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: ('MENTOR' | 'MENTEE')[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, getCurrentUser } = useAuthStore();

  useEffect(() => {
    if (!user && !isLoading) {
      getCurrentUser().catch(() => {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      });
    }
  }, [user, isLoading, getCurrentUser, router, pathname]);

  useEffect(() => {
    if (user && roles && !roles.includes(user.role)) {
      router.push('/unauthorized');
    }
  }, [user, roles, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
} 