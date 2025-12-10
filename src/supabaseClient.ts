import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables! Check .env file.');
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '');
