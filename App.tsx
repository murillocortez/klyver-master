import React, { useState } from 'react';
import { User } from './types';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tenants } from './pages/Tenants';
import { Plans } from './pages/Plans';
import { Support } from './pages/Support';
import { ApiIntegration } from './pages/ApiIntegration';

// Simulated Authenticated User
const MOCK_USER: User = {
  id: 'u_1',
  name: 'Administrador Master',
  email: 'admin@farmavida.com',
  role: 'CEO',
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (email: string) => {
    // In a real app, validate credentials here
    setIsAuthenticated(true);
    setUser(MOCK_USER);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {user && (
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
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