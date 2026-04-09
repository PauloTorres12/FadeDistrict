'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import {
  Calendar, Upload, LogOut, Clock, Users, TrendingUp,
  Image as ImageIcon, Video, X, ChevronLeft, Scissors,
} from 'lucide-react';

interface Appointment {
  id: string;
  client: string;
  service: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'completed';
}

const mockAppointments: Appointment[] = [
  { id: '1', client: 'Lucas M.', service: 'Fade Clásico', time: '09:00', duration: 30, status: 'completed' },
  { id: '2', client: 'Martín G.', service: 'Corte Premium + Styling', time: '10:00', duration: 60, status: 'completed' },
  { id: '3', client: 'Santiago R.', service: 'Escultura de Barba', time: '11:00', duration: 30, status: 'confirmed' },
  { id: '4', client: 'Nicolás P.', service: 'Paquete Completo', time: '12:00', duration: 60, status: 'confirmed' },
  { id: '5', client: 'Tomás B.', service: 'Fade Clásico', time: '14:00', duration: 30, status: 'pending' },
  { id: '6', client: 'Facundo L.', service: 'Líneas y Diseño', time: '15:00', duration: 30, status: 'pending' },
  { id: '7', client: 'Mateo C.', service: 'Corte Premium + Styling', time: '16:00', duration: 60, status: 'pending' },
  { id: '8', client: 'Agustín V.', service: 'Fade Clásico', time: '18:00', duration: 30, status: 'pending' },
];

interface UploadedFile { name: string; type: 'image' | 'video'; size: string; }

const statusLabels: Record<string, string> = {
  completed: 'completado',
  confirmed: 'confirmado',
  pending: 'pendiente',
};

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'gallery'>('schedule');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@fadedistrict.com' && password === 'admin123') {
      setIsLoggedIn(true); setLoginError('');
    } else {
      setLoginError('Credenciales inválidas. Probá admin@fadedistrict.com / admin123');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const newFiles: UploadedFile[] = files.map((f) => ({
      name: f.name, type: f.type.startsWith('video') ? 'video' : 'image',
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => { setDragOver(false); }, []);
  const removeFile = (index: number) => { setUploadedFiles((prev) => prev.filter((_, i) => i !== index)); };

  const totalToday = mockAppointments.length;
  const completed = mockAppointments.filter((a) => a.status === 'completed').length;
  const pending = mockAppointments.filter((a) => a.status === 'pending').length;
  const hours = Array.from({ length: 12 }, (_, i) => i + 9);

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
      {/* Admin Header */}
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
            <button onClick={() => setIsLoggedIn(false)} className="text-black/25 hover:text-black/50 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid py-8 md:py-12 max-w-5xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 md:p-6 text-center">
            <Users size={16} className="text-black/20 mb-3 mx-auto" />
            <p className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-syne)]">{totalToday}</p>
            <p className="text-[10px] text-black/25 uppercase tracking-wider mt-1">Turnos Hoy</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 md:p-6 text-center">
            <TrendingUp size={16} className="text-black/20 mb-3 mx-auto" />
            <p className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-syne)]">{completed}</p>
            <p className="text-[10px] text-black/25 uppercase tracking-wider mt-1">Completados</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 md:p-6 text-center">
            <Clock size={16} className="text-black/20 mb-3 mx-auto" />
            <p className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-syne)]">{pending}</p>
            <p className="text-[10px] text-black/25 uppercase tracking-wider mt-1">Próximos</p>
          </motion.div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 mb-8 bg-black/[0.02] p-1 w-fit mx-auto">
          <button onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-xs tracking-wider uppercase transition-all duration-300 ${activeTab === 'schedule' ? 'bg-black text-white font-semibold' : 'text-black/30 hover:text-black/50'}`}>
            <span className="flex items-center gap-2"><Calendar size={12} />Agenda</span>
          </button>
          <button onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 text-xs tracking-wider uppercase transition-all duration-300 ${activeTab === 'gallery' ? 'bg-black text-white font-semibold' : 'text-black/30 hover:text-black/50'}`}>
            <span className="flex items-center gap-2"><Upload size={12} />Galería</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              {/* Day Timeline Chart */}
              <div className="glass-card p-4 md:p-6 mb-6">
                <h3 className="text-xs text-black/30 uppercase tracking-wider mb-4 text-center">Línea de Tiempo del Día</h3>
                <div className="flex items-end gap-1 h-24 md:h-32">
                  {hours.map((hour) => {
                    const appointment = mockAppointments.find((a) => parseInt(a.time.split(':')[0]) === hour);
                    const height = appointment ? (appointment.duration === 60 ? '100%' : '50%') : '8%';
                    const bgColor = appointment
                      ? appointment.status === 'completed' ? 'bg-black/15' : appointment.status === 'confirmed' ? 'bg-black/30' : 'bg-black/8'
                      : 'bg-black/[0.02]';
                    return (
                      <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div initial={{ height: 0 }} animate={{ height }} transition={{ duration: 0.5, delay: (hour - 9) * 0.05 }}
                          className={`w-full ${bgColor} transition-colors duration-300 hover:bg-black/20 relative group`}>
                          {appointment && (
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white border border-black/8 p-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-sm">
                              <p className="text-[10px] text-black/60">{appointment.client}</p>
                              <p className="text-[8px] text-black/25">{appointment.service}</p>
                            </div>
                          )}
                        </motion.div>
                        <span className="text-[8px] text-black/15">{hour}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-[9px] text-black/25 justify-center">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-black/15" /> Completado</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-black/30" /> Confirmado</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-black/8" /> Pendiente</span>
                </div>
              </div>

              {/* Appointments List */}
              <div className="space-y-2">
                {mockAppointments.map((apt, i) => (
                  <motion.div key={apt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="glass-card p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center"><p className="text-sm font-medium font-[family-name:var(--font-space)]">{apt.time}</p></div>
                      <div className="w-px h-8 bg-black/5" />
                      <div>
                        <p className="text-sm font-medium font-[family-name:var(--font-syne)]">{apt.client}</p>
                        <p className="text-[10px] text-black/25 flex items-center gap-1"><Scissors size={8} />{apt.service} • {apt.duration} min</p>
                      </div>
                    </div>
                    <div className={`text-[9px] uppercase tracking-wider px-2 py-1 ${
                      apt.status === 'completed' ? 'bg-black/4 text-black/25'
                        : apt.status === 'confirmed' ? 'bg-black/8 text-black/50'
                        : 'bg-black/[0.02] text-black/15'}`}>
                      {statusLabels[apt.status]}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                className={`dropzone p-12 md:p-20 flex flex-col items-center justify-center text-center transition-all duration-300 ${dragOver ? 'active border-black/30 bg-black/[0.02]' : ''}`}>
                <motion.div animate={dragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Upload size={32} className={`mx-auto mb-4 transition-colors ${dragOver ? 'text-black/50' : 'text-black/15'}`} />
                </motion.div>
                <p className="text-sm text-black/35 mb-2 font-[family-name:var(--font-syne)]">Arrastrá y Soltá Archivos Acá</p>
                <p className="text-[10px] text-black/15 font-[family-name:var(--font-space)]">Soporta imágenes (JPG, PNG, WebP) y videos (MP4, MOV)</p>
                <label className="btn-secondary mt-6 cursor-pointer text-xs">
                  O Buscá Archivos
                  <input type="file" multiple accept="image/*,video/*" className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        const newFiles: UploadedFile[] = files.map((f) => ({
                          name: f.name, type: f.type.startsWith('video') ? 'video' : 'image',
                          size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
                        }));
                        setUploadedFiles((prev) => [...prev, ...newFiles]);
                      }
                    }} />
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-xs text-black/25 uppercase tracking-wider mb-3 text-center">Subidos ({uploadedFiles.length})</p>
                  {uploadedFiles.map((file, i) => (
                    <motion.div key={`${file.name}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                      className="glass-card p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {file.type === 'video' ? <Video size={14} className="text-black/25" /> : <ImageIcon size={14} className="text-black/25" />}
                        <div><p className="text-xs font-medium truncate max-w-[200px] md:max-w-none">{file.name}</p><p className="text-[9px] text-black/15">{file.size}</p></div>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-black/15 hover:text-black/40 transition-colors"><X size={14} /></button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
