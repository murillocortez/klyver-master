import React from 'react';
import { LayoutDashboard, Store, CreditCard, LifeBuoy, LogOut, Activity, Server } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'tenants', label: 'Farmácias', icon: Store },
    { id: 'plans', label: 'Planos & Preços', icon: CreditCard },
    { id: 'support', label: 'Suporte', icon: LifeBuoy },
    { id: 'api', label: 'Integrações', icon: Server },
  ];

  return (
    <aside className="w-72 bg-white h-screen fixed left-0 top-0 flex flex-col z-20 border-r border-slate-100">
      {/* Header */}
      <div className="p-8 pb-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
          <Activity className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Master</h1>
            <p className="text-[10px] text-emerald-600 font-bold tracking-[0.15em] uppercase mt-1">FarmaVida</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="px-4 pb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menu Principal</p>
        </div>
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon 
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-500'
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 mx-4 mb-4 border-t border-slate-50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100 transition-colors">
          <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase font-medium tracking-wide">{user.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-white rounded-lg transition-all"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};