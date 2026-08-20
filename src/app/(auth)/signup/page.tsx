'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, TrendingUp, Wallet } from 'lucide-react';

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    const result = await signUp(email, password, name);
    setLoading(false);
    if (result.error) setError(result.error);
    else router.push('/');
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const result = await signInWithGoogle();
    if (result.error) setError(result.error);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 animate-gradient-xy" />

      {/* Floating Orbs */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-400/30 rounded-full blur-3xl animate-float-slow" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Left Side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12 xl:p-16">
        <div className="max-w-lg animate-fade-in-left">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg animate-bounce-gentle">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ExpenseWise</h1>
              <p className="text-white/70 text-sm">Student Finance Manager</p>
            </div>
          </div>

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
        <div className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 animate-fade-in-right border border-white/20">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 animate-fade-in-down">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ExpenseWise</h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Student Finance</p>
            </div>
          </div>

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
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300"
                />
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300"
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
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-xl hover:shadow-indigo-600/30"
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

          {/* Divider */}
          <div className="relative my-8 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 active:scale-[0.98] hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
