// src/layouts/DashboardLayout.tsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Sidebar } from '../components/Sidebar';
import { Dashboard } from '../pages/Dashboard';
import { Tenants } from '../pages/Tenants';
import { Plans } from '../pages/Plans';
import Support from '../pages/Support';
import { ApiIntegration } from '../pages/Integrations';
import { Navigate, useNavigate } from 'react-router-dom';

export const DashboardLayout: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const [activePage, setActivePage] = useState('dashboard');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    if (!isAuthenticated || !user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-600 selection:bg-emerald-100 selection:text-emerald-800">
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                user={user}
                onLogout={handleLogout}
            />

            <main className="flex-1 ml-72 p-10 overflow-y-auto h-screen">
                <div className="max-w-[1400px] mx-auto">
                    {activePage === 'dashboard' && <Dashboard />}
                    {activePage === 'tenants' && <Tenants />}
                    {activePage === 'plans' && <Plans />}
                    {activePage === 'support' && <Support />}
                    {activePage === 'api' && <ApiIntegration />}
                </div>
            </main>
        </div>
    );
};
