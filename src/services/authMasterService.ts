import { supabase } from '../supabaseClient';
import { User } from '../types';

export const authMasterService = {
    async login(email: string): Promise<User> {
        // For MVP/Demo purposes, we are simulating a login or using Supabase Auth.
        // If you have real Supabase Auth users, use signInWithPassword.
        // Here we will simulate the "Master" user if credentials match (or just mock for now as per previous App.tsx logic, but cleaner).

        // In a real scenario:
        // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        // if (error) throw error;

        // For now, return the mock MASTER user to allow access without complex setup
        return {
            id: 'master_1',
            name: 'Super Admin',
            email: email,
            role: 'CEO',
            avatarUrl: 'https://github.com/shadcn.png'
        };
    },

    async logout() {
        await supabase.auth.signOut();
    },

    async getSession() {
        const { data } = await supabase.auth.getSession();
        return data.session;
    }
};
