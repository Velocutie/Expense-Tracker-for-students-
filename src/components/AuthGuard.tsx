'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/signup'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (loading) return;

    // If not logged in and not on a public page, redirect to login
    if (!user && !isPublicPath) {
      router.push('/login');
    }

    // If logged in and on a public page, redirect to dashboard
    if (user && isPublicPath) {
      router.push('/');
    }
  }, [user, loading, isPublicPath, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 animate-pulse">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <div className="w-8 h-8 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!user && !isPublicPath) {
    return null;
  }

  // Don't render public pages if authenticated (will redirect)
  if (user && isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
