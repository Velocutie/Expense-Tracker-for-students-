'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  updateName: (name: string) => Promise<{ error?: string }>;
  updateEmail: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!email || !password) return { error: 'Email and password are required' };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    if (!email || !password) return { error: 'Email and password are required' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const updateName = useCallback(async (name: string) => {
    const { error } = await supabase.auth.updateUser({ data: { name } });
    if (error) return { error: error.message };
    setUser(prev => prev ? { ...prev, name } : null);
    return {};
  }, []);

  const updateEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return { error: error.message };
    return {};
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return {};
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle, updateName, updateEmail, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
