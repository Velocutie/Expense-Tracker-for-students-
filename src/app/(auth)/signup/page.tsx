'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { AuthDotGrid } from '@/components/AuthDotGrid';
import { AuthExitLayer } from '@/components/AuthTransitionLayer';
import { ExpenseWiseBrand } from '@/components/ExpenseWiseBrand';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, TrendingUp, Wallet } from 'lucide-react';

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    const result = await signUp(email, password, name);
    setLoading(false);
    if (result.error) {
      sessionStorage.removeItem('expensewise-auth-transition');
      setError(result.error);
    } else {
      sessionStorage.setItem('expensewise-auth-transition', '1');
      setIsLeaving(true);
      window.setTimeout(() => {
        sessionStorage.removeItem('expensewise-auth-transition');
        router.push('/');
      }, 280);
    }
  };

  return (
    <div className="auth-shell relative flex min-h-screen overflow-hidden">
      <AuthDotGrid />
      <AuthExitLayer active={isLeaving} />

      {/* Left Side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12 xl:p-16">
        <div className="max-w-lg animate-fade-in-left">
          {/* Logo */}
          <ExpenseWiseBrand size="lg" light className="mb-12 animate-bounce-gentle" />

          {/* Headline */}
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Start your journey
            <br />
            <span className="text-white/80">to financial freedom.</span>
          </h2>
          <p className="text-lg text-white/70 mb-12">
            Join thousands of students taking control of their finances. It only takes a minute to get started.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: TrendingUp, text: 'Visual insights into your spending habits', delay: '0.2s' },
              { icon: Wallet, text: 'Set and track monthly budgets effortlessly', delay: '0.4s' },
              { icon: Sparkles, text: 'Achieve savings goals with smart tracking', delay: '0.6s' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-white/90 animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
                  <feature.icon size={20} />
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-md bg-white/88 dark:bg-[#130d23]/86 backdrop-blur-2xl rounded-[2rem] shadow-[0_30px_80px_-28px_rgba(40,12,75,0.62)] p-8 sm:p-10 animate-fade-in-right border border-white/35 dark:border-purple-200/15">
          {/* Mobile Logo */}
          <ExpenseWiseBrand size="md" className="lg:hidden mb-8 animate-fade-in-down" />

          {/* Welcome Text */}
          <div className="mb-8 animate-fade-in-down" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Start tracking your finances today</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-shake">
              <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300"
                />
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all duration-300 shadow-lg shadow-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-xl hover:shadow-purple-600/35"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
