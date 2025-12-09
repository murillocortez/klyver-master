// @ts-nocheck

import { supabase } from './supabase';
import { Database } from '../types/supabase';

export type Plan = Database['public']['Tables']['store_plans']['Row'];
export type NewPlan = Database['public']['Tables']['store_plans']['Insert'];

export const planService = {
    async getAll(): Promise<Plan[]> {
        const { data, error } = await supabase
            .from('store_plans')
            .select('*')
            .order('price_month', { ascending: true });

        if (error) throw error;
        return data;
    },

    async create(plan: NewPlan): Promise<Plan> {
        const { data, error } = await supabase
            .from('store_plans')
            .insert(plan as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<NewPlan>): Promise<Plan> {
        const { data, error } = await supabase
            .from('store_plans')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('store_plans').delete().eq('id', id);
        if (error) throw error;
    }
};
