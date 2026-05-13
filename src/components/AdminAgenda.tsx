'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Loader2, X, ArrowRight, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  date: string;
  time: string;
  status: string;
}

interface AvailableSlot {
  id: string;
  date: string;
  time: string;
  is_booked: boolean;
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

  // Edit modal state
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [editMode, setEditMode] = useState<'menu' | 'move' | 'confirmCancel'>('menu');
  const [actionLoading, setActionLoading] = useState(false);

  // Move flow state
  const [moveMonth, setMoveMonth] = useState(now.getMonth());
  const [moveYear, setMoveYear] = useState(now.getFullYear());
  const [moveDay, setMoveDay] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [datesWithSlots, setDatesWithSlots] = useState<Set<string>>(new Set());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const dateKey = selectedDate ? formatDateKey(currentYear, currentMonth, selectedDate) : null;

  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const fetchAppointments = async () => {
    if (!dateKey) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', dateKey)
      .order('time', { ascending: true });
    if (!error && data) setAppointments(data);
    else setAppointments([]);
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

  // --- Move flow: fetch dates with free slots for the move calendar ---
  const moveDaysInMonth = getDaysInMonth(moveYear, moveMonth);
  const moveFirstDay = getFirstDayOfMonth(moveYear, moveMonth);

  useEffect(() => {
    if (editMode !== 'move') return;
    const fetchDates = async () => {
      const start = formatDateKey(moveYear, moveMonth, 1);
      const end = formatDateKey(moveYear, moveMonth, moveDaysInMonth);
      const { data } = await supabase
        .from('available_slots')
        .select('date')
        .eq('is_booked', false)
        .gte('date', start)
        .lte('date', end);
      if (data) setDatesWithSlots(new Set(data.map((d: { date: string }) => d.date)));
    };
    fetchDates();
  }, [editMode, moveMonth, moveYear, moveDaysInMonth]);

  const fetchSlotsForDay = async (day: number) => {
    setLoadingSlots(true);
    const dk = formatDateKey(moveYear, moveMonth, day);
    const { data } = await supabase
      .from('available_slots')
      .select('*')
      .eq('date', dk)
      .eq('is_booked', false)
      .order('time', { ascending: true });
    if (data) setAvailableSlots(data);
    setLoadingSlots(false);
  };

  const handleMoveDaySelect = (day: number) => {
    const d = new Date(moveYear, moveMonth, day);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (d < todayStart) return;
    const dk = formatDateKey(moveYear, moveMonth, day);
    if (!datesWithSlots.has(dk)) return;
    setMoveDay(day);
    fetchSlotsForDay(day);
  };

  // --- Actions ---
  const handleCancel = async () => {
    if (!editingApt) return;
    setActionLoading(true);

    // Delete the appointment
    await supabase.from('appointments').delete().eq('id', editingApt.id);

    // Free the slot (mark is_booked = false)
    await supabase
      .from('available_slots')
      .update({ is_booked: false })
      .eq('date', editingApt.date)
      .eq('time', editingApt.time);

    setActionLoading(false);
    closeModal();
    fetchAppointments();
  };

  const handleMove = async (newSlot: AvailableSlot) => {
    if (!editingApt) return;
    setActionLoading(true);
    const newDateKey = formatDateKey(moveYear, moveMonth, moveDay!);

    // 1. Update the appointment to the new date/time
    await supabase
      .from('appointments')
      .update({ date: newDateKey, time: newSlot.time.slice(0, 5) })
      .eq('id', editingApt.id);

    // 2. Free the OLD slot
    await supabase
      .from('available_slots')
      .update({ is_booked: false })
      .eq('date', editingApt.date)
      .eq('time', editingApt.time);

    // 3. Book the NEW slot
    await supabase
      .from('available_slots')
      .update({ is_booked: true })
      .eq('id', newSlot.id);

    setActionLoading(false);
    closeModal();
    fetchAppointments();
  };

  const openEdit = (apt: Appointment) => {
    setEditingApt(apt);
    setEditMode('menu');
    setMoveDay(null);
    setAvailableSlots([]);
    setMoveMonth(now.getMonth());
    setMoveYear(now.getFullYear());
  };

  const closeModal = () => {
    setEditingApt(null);
    setEditMode('menu');
    setMoveDay(null);
    setAvailableSlots([]);
  };

  return (
    <motion.div key="agenda" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

      {/* Calendar */}
      <div className="glass-card p-5 md:p-12 mb-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 text-black/30 hover:text-black/70 transition-colors"><ChevronLeft size={18} /></button>
          <h3 className="text-sm font-semibold font-[family-name:var(--font-syne)]">{monthNames[currentMonth]} {currentYear}</h3>
          <button onClick={nextMonth} className="p-2 text-black/30 hover:text-black/70 transition-colors"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[10px] text-black/25 uppercase tracking-wider py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 md:gap-3">
          {Array.from({ length: firstDay }).map((_, i) => (<div key={`empty-${i}`} />))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = selectedDate === day;
            const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear;
            return (
              <button key={day} onClick={() => setSelectedDate(day)}
                className={`relative py-3 md:py-5 text-xs md:text-base font-medium transition-all duration-200 ${
                  isSelected ? 'bg-black text-white shadow-md'
                  : isToday ? 'bg-black/5 text-black font-bold'
                  : 'text-black/50 hover:bg-black/5 hover:text-black'
                }`}>{day}</button>
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
            <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-black/20" /></div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-10">
              <Clock size={24} className="text-black/10 mx-auto mb-3" />
              <p className="text-sm text-black/30">No hay turnos para este día</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt, i) => (
                <motion.div key={apt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-start md:items-center justify-between p-4 md:p-6 border border-black/5 hover:bg-black/[0.01] transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="w-12 md:w-14 text-center flex-shrink-0">
                      <p className="text-xs md:text-sm font-bold font-[family-name:var(--font-space)]">{apt.time.slice(0, 5)}</p>
                    </div>
                    <div className="w-px h-6 md:h-8 bg-black/5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-semibold font-[family-name:var(--font-syne)] flex items-center gap-2 truncate">
                        <User size={12} className="text-black/30" />{apt.client_name}
                      </p>
                      {apt.client_phone && <p className="text-[11px] text-black/30 mt-0.5">{apt.client_phone}</p>}
                    </div>
                  </div>
                  <button onClick={() => openEdit(apt)}
                    className="text-[9px] md:text-[10px] uppercase tracking-wider px-2 md:px-3 py-1 md:py-1.5 font-medium flex-shrink-0 bg-black/8 text-black/50 hover:bg-black/15 hover:text-black/80 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Pencil size={10} />Editar
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      <AnimatePresence>
        {editingApt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-black/5" style={{ padding: '24px 32px' }}>
                <div>
                  <h3 className="text-sm md:text-base font-semibold font-[family-name:var(--font-syne)]">{editingApt.client_name}</h3>
                  <p className="text-[11px] text-black/35 mt-0.5">
                    {editingApt.date} · {editingApt.time.slice(0, 5)} hs
                    {editingApt.client_phone && ` · ${editingApt.client_phone}`}
                  </p>
                </div>
                <button onClick={closeModal} className="p-1.5 text-black/30 hover:text-black/70 transition-colors"><X size={18} /></button>
              </div>

              <div style={{ padding: '24px 32px' }}>
                {/* MENU */}
                {editMode === 'menu' && (
                  <div className="flex flex-col gap-3">
                    <button onClick={() => { setEditMode('move'); setMoveDay(null); setAvailableSlots([]); }}
                      className="flex items-center gap-3 p-4 border border-black/8 hover:bg-black/[0.02] transition-colors text-left">
                      <ArrowRight size={16} className="text-black/40" />
                      <div>
                        <p className="text-sm font-medium font-[family-name:var(--font-syne)]">Mover turno</p>
                        <p className="text-[11px] text-black/35 mt-0.5">Cambiar a otro día u horario disponible</p>
                      </div>
                    </button>
                    <button onClick={() => setEditMode('confirmCancel')}
                      className="flex items-center gap-3 p-4 border border-red-100 hover:bg-red-50/50 transition-colors text-left">
                      <Trash2 size={16} className="text-red-400/70" />
                      <div>
                        <p className="text-sm font-medium font-[family-name:var(--font-syne)] text-red-500/80">Cancelar turno</p>
                        <p className="text-[11px] text-black/35 mt-0.5">Se libera el horario para otros clientes</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* CONFIRM CANCEL */}
                {editMode === 'confirmCancel' && (
                  <div>
                    <p className="text-sm text-black/60 mb-6 text-center leading-relaxed">
                      ¿Cancelar el turno de <strong>{editingApt.client_name}</strong> el {editingApt.date} a las {editingApt.time.slice(0, 5)} hs?
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => setEditMode('menu')} className="flex-1 py-3 text-xs font-medium border border-black/10 text-black/50 hover:bg-black/5 transition-colors">Volver</button>
                      <button onClick={handleCancel} disabled={actionLoading}
                        className="flex-1 py-3 text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {actionLoading ? <Loader2 size={14} className="animate-spin" /> : 'Sí, cancelar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* MOVE FLOW */}
                {editMode === 'move' && (
                  <div>
                    {!moveDay ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <button onClick={() => { if (moveMonth === 0) { setMoveMonth(11); setMoveYear(moveYear - 1); } else setMoveMonth(moveMonth - 1); }}
                            className="p-1 text-black/30 hover:text-black/70"><ChevronLeft size={16} /></button>
                          <span className="text-xs font-medium font-[family-name:var(--font-space)]">{monthNames[moveMonth]} {moveYear}</span>
                          <button onClick={() => { if (moveMonth === 11) { setMoveMonth(0); setMoveYear(moveYear + 1); } else setMoveMonth(moveMonth + 1); }}
                            className="p-1 text-black/30 hover:text-black/70"><ChevronRight size={16} /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {dayNames.map((d) => (<div key={d} className="text-center text-[9px] text-black/20 py-1">{d}</div>))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: moveFirstDay }).map((_, i) => (<div key={`me-${i}`} />))}
                          {Array.from({ length: moveDaysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const d = new Date(moveYear, moveMonth, day);
                            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            const isPast = d < todayStart;
                            const dk = formatDateKey(moveYear, moveMonth, day);
                            const hasSlots = datesWithSlots.has(dk);
                            return (
                              <button key={day} onClick={() => !isPast && hasSlots && handleMoveDaySelect(day)}
                                disabled={isPast || !hasSlots}
                                className={`aspect-square flex items-center justify-center text-xs transition-all relative ${
                                  isPast || !hasSlots ? 'text-black/10 cursor-not-allowed' : 'text-black/50 hover:bg-black/5 hover:text-black'
                                }`}>
                                {day}
                                {hasSlots && !isPast && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-black/30" />}
                              </button>
                            );
                          })}
                        </div>
                        <button onClick={() => setEditMode('menu')} className="w-full mt-4 py-2.5 text-xs text-black/40 hover:text-black/70 transition-colors">← Volver</button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-medium font-[family-name:var(--font-syne)]">
                            {moveDay} de {monthNames[moveMonth]} — Horarios libres
                          </h4>
                          <button onClick={() => { setMoveDay(null); setAvailableSlots([]); }} className="text-[11px] text-black/35 hover:text-black/70">← Volver</button>
                        </div>
                        {loadingSlots ? (
                          <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-black/20" /></div>
                        ) : availableSlots.length === 0 ? (
                          <p className="text-xs text-black/30 text-center py-8">No hay horarios disponibles</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                              <button key={slot.id} onClick={() => handleMove(slot)} disabled={actionLoading}
                                className="py-3 text-sm font-[family-name:var(--font-space)] border border-black/8 text-black/60 hover:border-black/25 hover:text-black hover:bg-black/[0.02] active:bg-black active:text-white transition-all disabled:opacity-50">
                                {slot.time.slice(0, 5)}
                              </button>
                            ))}
                          </div>
                        )}
                        {actionLoading && <p className="text-[11px] text-black/30 text-center mt-4">Moviendo turno...</p>}
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
