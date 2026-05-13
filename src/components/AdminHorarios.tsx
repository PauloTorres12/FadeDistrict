'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Slot {
  id: string;
  date: string;
  time: string;
  is_booked: boolean;
}

function getNextTwoWeeks(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const HOURS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 7;
  return `${String(h).padStart(2, '0')}:00`;
});

export default function AdminHorarios() {
  const [dates] = useState(getNextTwoWeeks());
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dateKey = formatDateKey(selectedDate);

  const fetchAllSlots = async () => {
    setLoading(true);
    const startDate = formatDateKey(dates[0]);
    const endDate = formatDateKey(dates[dates.length - 1]);

    const { data, error } = await supabase
      .from('available_slots')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('time', { ascending: true });

    if (!error && data) {
      setAllSlots(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllSlots();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSlots(allSlots.filter((s) => s.date === dateKey));
  }, [dateKey, allSlots]);

  const addSlot = async (time: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('available_slots')
      .insert({ date: dateKey, time, is_booked: false });

    if (error) {
      console.error('Error adding slot:', error);
    }
    await fetchAllSlots();
    setSaving(false);
  };

  const removeSlot = async (id: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('available_slots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing slot:', error);
    }
    await fetchAllSlots();
    setSaving(false);
  };

  const activeTimesForDay = new Set(slots.map((s) => s.time.slice(0, 5)));

  // Count slots per date for the calendar badges
  const slotsPerDate: Record<string, number> = {};
  allSlots.forEach((s) => {
    slotsPerDate[s.date] = (slotsPerDate[s.date] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-black/20" />
      </div>
    );
  }

  return (
    <motion.div key="horarios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

      {/* Date Selector - 2 week strip */}
      <div className="glass-card p-6 md:p-12 mb-8 md:mb-12">
        <h3 className="text-sm md:text-lg font-semibold font-[family-name:var(--font-syne)] mb-2 text-center">
          Próximos 14 días
        </h3>
        <p className="text-xs md:text-sm text-black/30 text-center mb-8">Seleccioná un día para agregar o quitar horarios</p>

        <div className="flex overflow-x-auto md:grid md:grid-cols-7 gap-3 md:gap-4 pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0 scrollbar-hide">
          {dates.map((date) => {
            const key = formatDateKey(date);
            const isSelected = key === dateKey;
            const isToday = key === formatDateKey(new Date());
            const slotCount = slotsPerDate[key] || 0;

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(date)}
                className={`relative flex flex-col items-center py-4 md:py-5 px-4 md:px-3 transition-all duration-200 flex-shrink-0 min-w-[64px] md:min-w-0 ${
                  isSelected
                    ? 'bg-black text-white shadow-md scale-105'
                    : 'hover:bg-black/5 text-black/60'
                }`}
              >
                <span className={`text-[10px] uppercase tracking-wider mb-1 ${isSelected ? 'text-white/60' : 'text-black/30'}`}>
                  {dayNames[date.getDay()]}
                </span>
                <span className={`text-lg font-bold font-[family-name:var(--font-syne)] ${isSelected ? 'text-white' : ''}`}>
                  {date.getDate()}
                </span>
                <span className={`text-[9px] mt-1 ${isSelected ? 'text-white/50' : 'text-black/20'}`}>
                  {monthNames[date.getMonth()].slice(0, 3)}
                </span>
                {slotCount > 0 && (
                  <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                    isSelected ? 'bg-white text-black' : 'bg-black text-white'
                  }`}>
                    {slotCount}
                  </span>
                )}
                {isToday && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-black/40" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Manager */}
      <div className="glass-card p-6 md:p-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-base md:text-lg font-semibold font-[family-name:var(--font-syne)]">
              {dayNames[selectedDate.getDay()]} {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
            </h3>
            <p className="text-sm text-black/30 mt-1">
              {slots.length} turno{slots.length !== 1 ? 's' : ''} habilitado{slots.length !== 1 ? 's' : ''}
            </p>
          </div>
          {saving && <Loader2 size={20} className="animate-spin text-black/30" />}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {HOURS.map((hour) => {
            const isActive = activeTimesForDay.has(hour);
            const slot = slots.find((s) => s.time.slice(0, 5) === hour);
            const isBooked = slot?.is_booked || false;

            return (
              <button
                key={hour}
                onClick={() => {
                  if (isBooked) return;
                  if (isActive && slot) {
                    removeSlot(slot.id);
                  } else {
                    addSlot(hour);
                  }
                }}
                disabled={saving || isBooked}
                className={`relative py-4 md:py-5 px-4 md:px-4 text-xs md:text-base font-medium transition-all duration-200 flex flex-col items-center gap-1.5 md:gap-2 ${
                  isBooked
                    ? 'bg-red-50 border border-red-200 text-red-400 cursor-not-allowed'
                    : isActive
                    ? 'bg-black text-white shadow-md hover:bg-black/80'
                    : 'bg-black/[0.02] border border-black/5 text-black/40 hover:border-black/20 hover:text-black/70'
                }`}
              >
                <Clock size={14} className={isActive && !isBooked ? 'text-white/60' : ''} />
                <span className="font-[family-name:var(--font-space)]">{hour}</span>
                {isBooked && (
                  <span className="text-[8px] uppercase tracking-wider">Reservado</span>
                )}
                {isActive && !isBooked && (
                  <span className="text-[8px] text-white/50 uppercase tracking-wider">Habilitado</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-black/25 text-center mt-8">
          Tocá un horario para habilitarlo o deshabilitarlo. Los horarios reservados no se pueden quitar.
        </p>
      </div>
    </motion.div>
  );
}
