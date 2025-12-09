import React, { useState } from 'react';
import { Activity, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/Button';

interface LoginProps {
  onLogin: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(email);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-600 selection:bg-emerald-100 selection:text-emerald-800">

      {/* Left Section - Hero/Brand */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900/90 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-overlay" />

        <div className="relative z-20">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg shadow-black/10">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-bold text-lg tracking-wide uppercase opacity-90">Master FarmaVida</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Gestão centralizada e inteligente.
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed font-light">
            Monitore o desempenho de todas as farmácias, gerencie planos e antecipe riscos com nossa I.A. exclusiva.
          </p>
        </div>

        <div className="relative z-20 space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Painel Multi-tenant</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Análise de Risco (Churn)</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Controle de API</span>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50/50 lg:bg-white">
        <div className="w-full max-w-[380px] space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h2>
            <p className="text-sm text-slate-500 mt-2">Acesse o painel com suas credenciais administrativas.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">E-mail Corporativo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm shadow-sm"
                    placeholder="admin@farmavida.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4" />
                <span className="text-xs text-slate-500 font-medium">Lembrar-me</span>
              </label>
              <a href="#" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">Esqueceu a senha?</a>
            </div>

            <Button type="submit" className="w-full h-11 text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all font-semibold" isLoading={isLoading}>
              <span>Entrar no Painel</span>
              <ArrowRight className="w-4 h-4 ml-2 opacity-80" />
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
            &copy; {new Date().getFullYear()} Master FarmaVida SaaS.
          </p>
        </div>
      </div>

    </div>
  );
};