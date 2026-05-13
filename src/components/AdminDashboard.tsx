'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Calendar, Upload, LogOut, Clock,
  ChevronLeft, Loader2
} from 'lucide-react';
import AdminAgenda from './AdminAgenda';
import AdminHorarios from './AdminHorarios';
import AdminGallery from './AdminGallery';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'horarios' | 'gallery'>('schedule');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        // Ejecutar limpieza automática de base de datos
        cleanupOldData();
      }
      setAuthLoading(false);
    };

    const cleanupOldData = async () => {
      // Calculamos la fecha de hace 7 días
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffString = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;

      try {
        // Borrar turnos viejos
        await supabase.from('appointments').delete().lt('date', cutoffString);
        // Borrar horarios viejos
        await supabase.from('available_slots').delete().lt('date', cutoffString);
        console.log('Limpieza automática: registros anteriores a', cutoffString, 'eliminados.');
      } catch (e) {
        console.error('Error en limpieza automática:', e);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      setLoginError(`Error: ${error.message}`);
    } else {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-black/20" size={32} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-card p-8 md:p-12 w-full max-w-sm">
          <a href="/" className="flex items-center gap-2 text-black/25 hover:text-black/50 transition-colors text-xs mb-8">
            <ChevronLeft size={14} />Volver al sitio
          </a>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 border border-black/15 flex items-center justify-center">
              <span className="text-sm font-bold font-[family-name:var(--font-syne)]">FD</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold font-[family-name:var(--font-syne)]">Admin</h1>
              <p className="text-[10px] text-black/25">Acceso al Panel</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] text-black/30 uppercase tracking-wider block mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/5 px-4 py-3 text-sm text-black outline-none focus:border-black/15 transition-colors font-[family-name:var(--font-space)]"
                placeholder="admin@fadedistrict.com" />
            </div>
            <div>
              <label className="text-[10px] text-black/30 uppercase tracking-wider block mb-1.5">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/5 px-4 py-3 text-sm text-black outline-none focus:border-black/15 transition-colors font-[family-name:var(--font-space)]"
                placeholder="••••••" />
            </div>
            {loginError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-red-500/70">{loginError}</motion.p>
            )}
            <button type="submit" className="btn-primary w-full mt-2">Iniciar Sesión</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-black/5 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container-fluid flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 text-black/25 hover:text-black/50 transition-colors">
              <div className="w-7 h-7 border border-black/15 flex items-center justify-center">
                <span className="text-[10px] font-bold font-[family-name:var(--font-syne)]">FD</span>
              </div>
            </a>
            <span className="text-xs text-black/15">|</span>
            <span className="text-xs text-black/40 font-[family-name:var(--font-space)]">Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center">
                <span className="text-[8px] font-bold">A</span>
              </div>
              <span className="text-xs text-black/30">Admin</span>
            </div>
            <button onClick={handleLogout} className="text-black/25 hover:text-black/50 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid max-w-5xl mx-auto pt-16 md:pt-20 pb-20">
        {/* Tabs */}
        <div className="w-full flex justify-center mb-12 md:mb-16">
          <div className="flex items-center gap-1 md:gap-2 bg-black/5 p-1 md:p-1.5 px-1 md:px-2 border border-black/10 shadow-sm">
            <button onClick={() => setActiveTab('schedule')}
              className={`px-4 md:px-8 py-2.5 md:py-3 text-xs md:text-base font-semibold tracking-wide transition-all duration-300 ${activeTab === 'schedule' ? 'bg-black text-white shadow-md' : 'text-black/50 hover:text-black hover:bg-black/5'}`}>
              <span className="flex items-center gap-1.5 md:gap-2"><Calendar size={14} className="md:hidden" /><Calendar size={18} className="hidden md:block" />Agenda</span>
            </button>
            <button onClick={() => setActiveTab('horarios')}
              className={`px-4 md:px-8 py-2.5 md:py-3 text-xs md:text-base font-semibold tracking-wide transition-all duration-300 ${activeTab === 'horarios' ? 'bg-black text-white shadow-md' : 'text-black/50 hover:text-black hover:bg-black/5'}`}>
              <span className="flex items-center gap-1.5 md:gap-2"><Clock size={14} className="md:hidden" /><Clock size={18} className="hidden md:block" />Horarios</span>
            </button>
            <button onClick={() => setActiveTab('gallery')}
              className={`px-4 md:px-8 py-2.5 md:py-3 text-xs md:text-base font-semibold tracking-wide transition-all duration-300 ${activeTab === 'gallery' ? 'bg-black text-white shadow-md' : 'text-black/50 hover:text-black hover:bg-black/5'}`}>
              <span className="flex items-center gap-1.5 md:gap-2"><Upload size={14} className="md:hidden" /><Upload size={18} className="hidden md:block" />Galería</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'schedule' && <AdminAgenda />}
          {activeTab === 'horarios' && <AdminHorarios />}
          {activeTab === 'gallery' && <AdminGallery />}
        </AnimatePresence>
      </div>
    </div>
  );
}
