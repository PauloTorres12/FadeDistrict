'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  date: string;
  time: string;
  status: string;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function AdminAgenda() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(now.getDate());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const dateKey = selectedDate ? formatDateKey(currentYear, currentMonth, selectedDate) : null;

  const fetchAppointments = async () => {
    if (!dateKey) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', dateKey)
      .order('time', { ascending: true });

    if (!error && data) {
      setAppointments(data);
    } else {
      setAppointments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (dateKey) fetchAppointments();
  }, [dateKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(null);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(null);
  };

  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  return (
    <motion.div key="agenda" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

      {/* Calendar */}
      <div className="glass-card p-5 md:p-12 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 text-black/30 hover:text-black/70 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-sm font-semibold font-[family-name:var(--font-syne)]">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button onClick={nextMonth} className="p-2 text-black/30 hover:text-black/70 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[10px] text-black/25 uppercase tracking-wider py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-3">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = selectedDate === day;
            const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`relative py-3 md:py-5 text-xs md:text-base font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-black text-white shadow-md'
                    : isToday
                    ? 'bg-black/5 text-black font-bold'
                    : 'text-black/50 hover:bg-black/5 hover:text-black'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointments for Selected Day */}
      {selectedDate && (
        <div className="glass-card p-5 md:p-12">
          <h3 className="text-sm md:text-lg font-semibold font-[family-name:var(--font-syne)] mb-1">
            {dayNames[new Date(currentYear, currentMonth, selectedDate).getDay()]} {selectedDate} de {monthNames[currentMonth]}
          </h3>
          <p className="text-xs text-black/30 mb-6">
            {appointments.length} turno{appointments.length !== 1 ? 's' : ''} reservado{appointments.length !== 1 ? 's' : ''}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-black/20" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-10">
              <Clock size={24} className="text-black/10 mx-auto mb-3" />
              <p className="text-sm text-black/30">No hay turnos para este día</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt, i) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-start md:items-center justify-between p-4 md:p-6 border border-black/5 hover:bg-black/[0.01] transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="w-12 md:w-14 text-center flex-shrink-0">
                      <p className="text-xs md:text-sm font-bold font-[family-name:var(--font-space)]">{apt.time.slice(0, 5)}</p>
                    </div>
                    <div className="w-px h-6 md:h-8 bg-black/5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-semibold font-[family-name:var(--font-syne)] flex items-center gap-2 truncate">
                        <User size={12} className="text-black/30" />
                        {apt.client_name}
                      </p>
                      {apt.client_phone && (
                        <p className="text-[11px] text-black/30 mt-0.5">{apt.client_phone}</p>
                      )}
                    </div>
                  </div>
                  <div className={`text-[9px] md:text-[10px] uppercase tracking-wider px-2 md:px-3 py-1 md:py-1.5 font-medium flex-shrink-0 ${
                    apt.status === 'confirmed' ? 'bg-black/8 text-black/50'
                    : apt.status === 'completed' ? 'bg-black/4 text-black/25'
                    : 'bg-black/[0.02] text-black/20'
                  }`}>
                    {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'completed' ? 'Completado' : 'Pendiente'}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
