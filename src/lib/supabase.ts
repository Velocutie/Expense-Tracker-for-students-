import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type definitions
export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          description: string;
          date: string;
          created_at: string;
        };
        Insert: Omit<{ id: string; user_id: string; created_at: string }, 'id' | 'created_at'>;
      };
      money_received: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          source: string;
          date: string;
          note: string;
          created_at: string;
        };
        Insert: Omit<{ id: string; user_id: string; created_at: string }, 'id' | 'created_at'>;
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          limit: number;
          spent: number;
          period: 'weekly' | 'monthly';
          created_at: string;
        };
        Insert: Omit<{ id: string; user_id: string; created_at: string }, 'id' | 'created_at'>;
      };
      saved_money_entries: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'add' | 'remove';
          date: string;
          note: string;
          created_at: string;
        };
        Insert: Omit<{ id: string; user_id: string; created_at: string }, 'id' | 'created_at'>;
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target: number;
          current: number;
          deadline: string;
          created_at: string;
        };
        Insert: Omit<{ id: string; user_id: string; created_at: string }, 'id' | 'created_at'>;
      };
      recurring_expenses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          category: string;
          frequency: 'monthly' | 'weekly' | 'yearly';
          created_at: string;
        };
        Insert: Omit<{ id: string; user_id: string; created_at: string }, 'id' | 'created_at'>;
      };
      app_settings: {
        Row: {
          user_id: string;
          monthly_allowance: number;
          updated_at: string;
        };
        Insert: { user_id: string; monthly_allowance: number; updated_at: string };
      };
    };
  };
}
