import React, { useState } from 'react';
import { User } from './types';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tenants } from './pages/Tenants';
import { Plans } from './pages/Plans';
import { Support } from './pages/Support';
import { ApiIntegration } from './pages/Integrations'; // Updated import path
import { useAuthStore } from './store/authStore';
import { authMasterService } from './services/authMasterService';

function App() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = async (email: string) => {
    try {
      const loggedUser = await authMasterService.login(email);
      setUser(loggedUser);
    } catch (error) {
      console.error("Login failed", error);
      alert("Erro ao fazer login");
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-600 selection:bg-emerald-100 selection:text-emerald-800">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={handleLogout}
      />

      {/* Sidebar width is w-72 (18rem) */}
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
}

export default App;