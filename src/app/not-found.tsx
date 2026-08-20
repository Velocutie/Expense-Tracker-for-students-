'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
          <Search size={40} className="text-indigo-400 dark:text-indigo-500" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Page not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 active:scale-95"
          >
            <Home size={18} />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ExpenseWise — Track your money smarter
          </p>
        </div>
      </div>
    </div>
  );
}
