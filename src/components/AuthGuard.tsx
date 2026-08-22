'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AmbientBackground } from '@/components/AmbientBackground';
import { ExpenseWiseMark } from '@/components/ExpenseWiseBrand';

const PUBLIC_PATHS = ['/login', '/signup'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const isAuthTransitioning = typeof window !== 'undefined' && sessionStorage.getItem('expensewise-auth-transition') === '1';

  useEffect(() => {
    if (loading) return;

    // If not logged in and not on a public page, redirect to login
    if (!user && !isPublicPath) {
      router.push('/login');
    }

    // Let Login/Sign Up finish their short exit transition before redirecting.
    if (user && isPublicPath && isAuthTransitioning) return;

    // If logged in and on a public page, redirect to dashboard
    if (user && isPublicPath) {
      router.push('/');
    }
  }, [user, loading, isPublicPath, isAuthTransitioning, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent">
        <AmbientBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 rounded-[2rem] border border-purple-500/15 bg-white/65 dark:bg-[#171126]/70 px-10 py-9 shadow-[0_24px_60px_-28px_rgba(76,29,149,0.55)] backdrop-blur-xl">
          <ExpenseWiseMark size="lg" className="animate-bounce-gentle" />
          <div className="w-8 h-8 border-[3px] border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-300 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!user && !isPublicPath) {
    return null;
  }

  // Don't render public pages if authenticated (will redirect)
  if (user && isPublicPath && !isAuthTransitioning) {
    return null;
  }

  return <>{children}</>;
}
