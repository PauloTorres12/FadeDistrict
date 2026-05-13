'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type BookingStep = 'date' | 'time' | 'info' | 'confirm' | 'processing' | 'success';

interface AvailableSlot {
  id: string;
  date: string;
  time: string;
  is_booked: boolean;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function Booking() {
  const [step, setStep] = useState<BookingStep>('date');
  const [currentMonth, setCurrentMonth] = useState(3);
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [today, setToday] = useState(new Date(2026, 3, 7));

  // Client info
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Slots from Supabase
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [datesWithSlots, setDatesWithSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }, []);

  // Fetch which dates have available slots for the current month view
  useEffect(() => {
    const fetchDatesWithSlots = async () => {
      const startDate = formatDateKey(currentYear, currentMonth, 1);
      const endDate = formatDateKey(currentYear, currentMonth, getDaysInMonth(currentYear, currentMonth));

      const { data } = await supabase
        .from('available_slots')
        .select('date')
        .eq('is_booked', false)
        .gte('date', startDate)
        .lte('date', endDate);

      if (data) {
        setDatesWithSlots(new Set(data.map((d: { date: string }) => d.date)));
      }
    };

    fetchDatesWithSlots();
  }, [currentMonth, currentYear]);

  // Fetch available slots for a specific date
  const fetchSlotsForDate = async (dateKey: string) => {
    setLoadingSlots(true);
    const { data } = await supabase
      .from('available_slots')
      .select('*')
      .eq('date', dateKey)
      .eq('is_booked', false)
      .order('time', { ascending: true });

    if (data) {
      setAvailableSlots(data);
    }
    setLoadingSlots(false);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

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

  const handleDateSelect = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date < todayStart) return;

    const dateKey = formatDateKey(currentYear, currentMonth, day);
    if (!datesWithSlots.has(dateKey)) return;

    setSelectedDate(day);
    fetchSlotsForDate(dateKey);
    setStep('time');
  };

  const handleTimeSelect = (slot: AvailableSlot) => {
    setSelectedTime(slot.time.slice(0, 5));
    setSelectedSlotId(slot.id);
    setStep('info');
  };

  /* Validar teléfono argentino: 10 dígitos (sin +54, sin 0) */
  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  };

  const handlePhoneChange = (value: string) => {
    setClientPhone(value);
    if (value.trim() && !isValidPhone(value)) {
      setPhoneError('Ingresá 10 dígitos (ej: 11 1234-5678)');
    } else {
      setPhoneError('');
    }
  };

  const canContinue = clientName.trim().length >= 2 && isValidPhone(clientPhone);

  const handleConfirm = async () => {
    if (!canContinue || !selectedSlotId || !selectedDate) return;

    setStep('processing');

    const dateKey = formatDateKey(currentYear, currentMonth, selectedDate);

    // Create appointment
    const { error: aptError } = await supabase
      .from('appointments')
      .insert({
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        date: dateKey,
        time: selectedTime,
        status: 'confirmed',
      });

    // Mark slot as booked
    const { error: slotError } = await supabase
      .from('available_slots')
      .update({ is_booked: true })
      .eq('id', selectedSlotId);

    if (aptError || slotError) {
      console.error('Booking error:', aptError || slotError);
      setStep('info');
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStep('success');
  };

  const resetBooking = () => {
    setStep('date');
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedSlotId(null);
    setClientName('');
    setClientPhone('');
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const steps = ['date', 'time', 'info', 'confirm'];

  return (
    <section id="turnos" className="pt-32 md:pt-64 pb-16 md:pb-40 relative gradient-section">
      <div className="container-fluid flex flex-col items-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-black/25 mb-4 font-[family-name:var(--font-space)]">
            Reservas
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-syne)] tracking-tight">
            Reservá tu Turno
          </h2>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center gap-1.5 max-w-md w-full mb-12 md:mb-16">
          {steps.map((s, i) => {
            const currentIdx = steps.indexOf(step);
            const isProcessingOrSuccess = step === 'processing' || step === 'success';
            const isActive = step === s || (isProcessingOrSuccess && s === 'confirm');
            const isPast = currentIdx > i || isProcessingOrSuccess;

            return (
              <div key={s} className={`flex items-center gap-1.5 ${i < steps.length - 1 ? 'flex-1' : 'flex-none'}`}>
                <div
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 flex-shrink-0 ${
                    isActive
                      ? 'bg-black scale-110'
                      : isPast
                      ? 'bg-black/40'
                      : 'bg-black/10'
                  }`}
                />
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px transition-all duration-300 ${
                    isPast ? 'bg-black/20' : 'bg-black/5'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Booking Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="glass-card p-6 md:p-12 max-w-2xl w-full"
        >
          <AnimatePresence mode="wait">
            {step === 'date' && (
              <motion.div key="date" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
                <h3 className="text-xl font-semibold font-[family-name:var(--font-syne)] mb-8 text-center" style={{ lineHeight: '1.5' }}>
                  Elegí la Fecha
                </h3>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-1 hover:bg-black/5 transition-colors"><ChevronLeft size={16} className="text-black/30" /></button>
                    <span className="text-sm font-medium font-[family-name:var(--font-space)]">{monthNames[currentMonth]} {currentYear}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-black/5 transition-colors"><ChevronRight size={16} className="text-black/30" /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map((d) => (<div key={d} className="text-center text-[10px] text-black/15 py-1">{d}</div>))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => (<div key={`empty-${i}`} />))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const date = new Date(currentYear, currentMonth, day);
                      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const isPast = date < todayStart;
                      const dateKey = formatDateKey(currentYear, currentMonth, day);
                      const hasSlots = datesWithSlots.has(dateKey);
                      const isSelected = selectedDate === day;
                      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

                      return (
                        <button
                          key={day}
                          onClick={() => !isPast && hasSlots && handleDateSelect(day)}
                          disabled={isPast || !hasSlots}
                          className={`aspect-square flex items-center justify-center text-xs transition-all duration-200 relative
                            ${isPast || !hasSlots ? 'text-black/10 cursor-not-allowed'
                              : isSelected ? 'bg-black text-white font-semibold'
                              : isToday ? 'border border-black/25 text-black hover:bg-black/5'
                              : 'text-black/50 hover:bg-black/5 hover:text-black'}`}
                        >
                          {day}
                          {hasSlots && !isPast && (
                            <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-black/30" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-black/25 text-center">Los días con punto tienen turnos disponibles</p>
              </motion.div>
            )}

            {step === 'time' && (
              <motion.div key="time" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold font-[family-name:var(--font-syne)] mb-1 leading-normal">Elegí el Horario</h3>
                    <p className="text-xs md:text-sm text-black/40">{selectedDate} de {monthNames[currentMonth]}</p>
                  </div>
                  <button onClick={() => setStep('date')} className="text-xs md:text-sm text-black/35 hover:text-black/70 transition-colors">← Volver</button>
                </div>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-black/20" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-10">
                    <Clock size={24} className="text-black/10 mx-auto mb-3" />
                    <p className="text-sm text-black/30">No hay horarios disponibles para este día</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleTimeSelect(slot)}
                        className="py-4 md:py-5 text-sm md:text-base font-[family-name:var(--font-space)] transition-all duration-200 rounded-sm border border-black/8 text-black/60 hover:border-black/25 hover:text-black hover:bg-black/[0.02] active:bg-black active:text-white"
                      >
                        {slot.time.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 'info' && (
              <motion.div key="info" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold font-[family-name:var(--font-syne)] mb-1 leading-normal">Tus Datos</h3>
                    <p className="text-xs md:text-sm text-black/40">{selectedDate} de {monthNames[currentMonth]} · {selectedTime} hs</p>
                  </div>
                  <button onClick={() => setStep('time')} className="text-xs md:text-sm text-black/35 hover:text-black/70 transition-colors">← Volver</button>
                </div>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="text-[11px] text-black/35 uppercase tracking-wider block mb-1.5">Nombre *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-black/[0.02] border border-black/8 px-4 py-3.5 md:py-3 text-base md:text-sm text-black outline-none focus:border-black/20 transition-colors font-[family-name:var(--font-space)] rounded-none appearance-none"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-black/35 uppercase tracking-wider block mb-1.5">Teléfono *</label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`w-full bg-black/[0.02] border px-4 py-3.5 md:py-3 text-base md:text-sm text-black outline-none transition-colors font-[family-name:var(--font-space)] rounded-none appearance-none ${phoneError ? 'border-red-300 focus:border-red-400' : 'border-black/8 focus:border-black/20'}`}
                      placeholder="Ej: 11 1234-5678"
                    />
                    {phoneError && (
                      <p className="text-[10px] text-red-400 mt-1">{phoneError}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setStep('confirm')}
                    disabled={!canContinue}
                    className="btn-primary w-full mt-4 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div key="confirm" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base md:text-lg font-semibold font-[family-name:var(--font-syne)]">Confirmar Turno</h3>
                  <button onClick={() => setStep('info')} className="text-xs md:text-sm text-black/35 hover:text-black/70 transition-colors">← Volver</button>
                </div>
                <div className="flex flex-col border border-black/6 overflow-hidden mb-6">
                  <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-black/5">
                    <span className="text-xs md:text-sm text-black/40">Nombre</span>
                    <span className="text-sm md:text-base font-medium text-black">{clientName}</span>
                  </div>
                  {clientPhone && (
                    <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-black/5">
                      <span className="text-xs md:text-sm text-black/40">Teléfono</span>
                      <span className="text-sm md:text-base font-medium text-black">{clientPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-black/5">
                    <span className="text-xs md:text-sm text-black/40">Fecha</span>
                    <span className="text-sm md:text-base font-medium text-black">{selectedDate} de {monthNames[currentMonth]}, {currentYear}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 md:px-6 py-4 bg-black/[0.015]">
                    <span className="text-xs md:text-sm text-black/40">Horario</span>
                    <span className="text-base md:text-lg font-bold font-[family-name:var(--font-syne)] text-black">{selectedTime} hs</span>
                  </div>
                </div>
                <button onClick={handleConfirm} className="btn-primary w-full">Confirmar Turno</button>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div key="processing" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center py-16">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full mb-6" />
                <p className="text-sm text-black/50 font-[family-name:var(--font-space)]">Confirmando tu turno...</p>
                <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1.5, ease: 'linear' }} className="h-px bg-black/15 mt-6" />
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }} className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-6">
                  <Check size={28} className="text-white" />
                </motion.div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-syne)] mb-2">Turno Confirmado</h3>
                <p className="text-sm text-black/35 text-center mb-2 font-[family-name:var(--font-space)]">
                  {selectedDate} de {monthNames[currentMonth]} a las {selectedTime} hs
                </p>
                <p className="text-xs text-black/15 text-center mb-8">¡Te esperamos, {clientName}!</p>
                <button onClick={resetBooking} className="btn-secondary">Reservar Otro Turno</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
