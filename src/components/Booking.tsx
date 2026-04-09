'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Scissors, Check } from 'lucide-react';

type BookingStep = 'service' | 'date' | 'time' | 'confirm' | 'processing' | 'success';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

const services: Service[] = [
  { id: 'classic-fade', name: 'Fade Clásico', duration: 30, price: 2500 },
  { id: 'premium-cut', name: 'Corte Premium + Styling', duration: 60, price: 4000 },
  { id: 'beard-sculpt', name: 'Escultura de Barba', duration: 30, price: 2000 },
  { id: 'full-service', name: 'Paquete Completo', duration: 60, price: 5500 },
  { id: 'line-design', name: 'Líneas y Diseño', duration: 30, price: 3000 },
  { id: 'kids-cut', name: 'Corte Infantil', duration: 30, price: 1800 },
];

const WORKING_HOURS_START = 9;
const WORKING_HOURS_END = 20;

function generateSlots(duration: number): string[] {
  const slots: string[] = [];
  let hour = WORKING_HOURS_START;
  let minute = 0;
  while (hour < WORKING_HOURS_END) {
    const endMinute = minute + duration;
    const endHour = hour + Math.floor(endMinute / 60);
    if (endHour > WORKING_HOURS_END || (endHour === WORKING_HOURS_END && endMinute % 60 > 0)) break;
    slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    minute += duration;
    if (minute >= 60) {
      hour += Math.floor(minute / 60);
      minute = minute % 60;
    }
  }
  return slots;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Booking() {
  const [step, setStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentMonth, setCurrentMonth] = useState(3);
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [today, setToday] = useState(new Date(2026, 3, 7));

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }, []);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const slots = useMemo(() => {
    if (!selectedService) return [];
    return generateSlots(selectedService.duration);
  }, [selectedService]);

  const bookedSlots = useMemo(() => {
    const booked = new Set<string>();
    slots.forEach((slot) => {
      if (Math.random() > 0.65) booked.add(slot);
    });
    return booked;
  }, [slots, selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate()) && day !== today.getDate()) return;
    if (date.getDay() === 0) return;
    setSelectedDate(day);
    setStep('time');
  };

  const handleConfirm = async () => {
    setStep('processing');
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setStep('success');
  };

  const resetBooking = () => {
    setStep('service');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR')}`;
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <section id="turnos" className="pt-52 md:pt-64 pb-24 md:pb-40 relative gradient-section">
      <div className="container-fluid flex flex-col items-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 md:mb-24 text-center"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-black/25 mb-4 font-[family-name:var(--font-space)]">
            Reservas
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-syne)] tracking-tight">
            Reservá tu Turno
          </h2>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-12 max-w-xl w-full">
          {['service', 'date', 'time', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step === s || (step === 'processing' && s === 'confirm') || step === 'success'
                    ? 'bg-black scale-125'
                    : ['service', 'date', 'time', 'confirm'].indexOf(step) > i
                    ? 'bg-black/40'
                    : 'bg-black/10'
                }`}
              />
              {i < 3 && (
                <div className={`flex-1 h-px transition-all duration-300 ${
                  ['service', 'date', 'time', 'confirm'].indexOf(step) > i ? 'bg-black/20' : 'bg-black/5'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Booking Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-8 md:p-12 max-w-2xl w-full"
        >
          <AnimatePresence mode="wait">
            {step === 'service' && (
              <motion.div key="service" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
                <h3 className="text-xl font-semibold font-[family-name:var(--font-syne)] mb-6 text-center pb-2 pt-1" style={{ lineHeight: '1.5' }}>
                  Elegí tu Servicio
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => { setSelectedService(service); setStep('date'); }}
                      className="text-left p-6 border border-black/5 hover:border-black/15 bg-black/[0.01] hover:bg-black/[0.03] transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-medium font-[family-name:var(--font-syne)] text-base group-hover:text-black transition-colors pb-1.5" style={{ lineHeight: '1.5' }}>
                          {service.name}
                        </p>
                        <Scissors size={14} className="text-black/15 group-hover:text-black/40 transition-colors mt-0.5" />
                      </div>
                      <div className="flex items-center gap-3 text-sm text-black/35">
                        <span className="flex items-center gap-1"><Clock size={10} />{service.duration} min</span>
                        <span>{formatPrice(service.price)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'date' && (
              <motion.div key="date" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-syne)]">Elegí la Fecha</h3>
                    <p className="text-xs text-black/25 mt-1">{selectedService?.name} • {selectedService?.duration} min</p>
                  </div>
                  <button onClick={() => setStep('service')} className="text-xs text-black/30 hover:text-black/60 transition-colors">← Volver</button>
                </div>
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
                      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const isSunday = date.getDay() === 0;
                      const isSelected = selectedDate === day;
                      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                      return (
                        <button
                          key={day}
                          onClick={() => !isPast && !isSunday && handleDateSelect(day)}
                          disabled={isPast || isSunday}
                          className={`aspect-square flex items-center justify-center text-xs transition-all duration-200
                            ${isPast || isSunday ? 'text-black/10 cursor-not-allowed'
                              : isSelected ? 'bg-black text-white font-semibold'
                              : isToday ? 'border border-black/25 text-black hover:bg-black/5'
                              : 'text-black/50 hover:bg-black/5 hover:text-black'}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'time' && (
              <motion.div key="time" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-syne)]">Elegí el Horario</h3>
                    <p className="text-xs text-black/25 mt-1">{selectedDate} de {monthNames[currentMonth]} • {selectedService?.name}</p>
                  </div>
                  <button onClick={() => setStep('date')} className="text-xs text-black/30 hover:text-black/60 transition-colors">← Volver</button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => {
                    const isBooked = bookedSlots.has(slot);
                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        onClick={() => { setSelectedTime(slot); setStep('confirm'); }}
                        className={`py-3 text-sm font-[family-name:var(--font-space)] transition-all duration-200
                          ${isBooked ? 'bg-black/[0.01] text-black/12 cursor-not-allowed line-through'
                            : 'border border-black/5 text-black/50 hover:border-black/15 hover:text-black hover:bg-black/[0.02]'}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-black/15 mt-4">Los horarios tachados no están disponibles</p>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div key="confirm" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-syne)]">Confirmar Turno</h3>
                  <button onClick={() => setStep('time')} className="text-xs text-black/30 hover:text-black/60 transition-colors">← Volver</button>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-black/5">
                    <span className="text-xs text-black/30 uppercase tracking-wider">Servicio</span>
                    <span className="text-sm font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-black/5">
                    <span className="text-xs text-black/30 uppercase tracking-wider">Fecha</span>
                    <span className="text-sm font-medium">{selectedDate} de {monthNames[currentMonth]}, {currentYear}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-black/5">
                    <span className="text-xs text-black/30 uppercase tracking-wider">Horario</span>
                    <span className="text-sm font-medium">{selectedTime} hs</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-black/5">
                    <span className="text-xs text-black/30 uppercase tracking-wider">Duración</span>
                    <span className="text-sm font-medium">{selectedService?.duration} min</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-black/30 uppercase tracking-wider">Total</span>
                    <span className="text-lg font-bold font-[family-name:var(--font-syne)]">
                      {selectedService ? formatPrice(selectedService.price) : '$0'}
                    </span>
                  </div>
                </div>
                <button onClick={handleConfirm} className="btn-primary w-full">Pagar con Mercado Pago</button>
                <p className="text-[10px] text-black/15 text-center mt-3">Serás redirigido a Mercado Pago para el pago seguro</p>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div key="processing" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center py-16">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full mb-6" />
                <p className="text-sm text-black/50 font-[family-name:var(--font-space)]">Procesando pago...</p>
                <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 2.5, ease: 'linear' }} className="h-px bg-black/15 mt-6" />
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }} className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-6">
                  <Check size={28} className="text-white" />
                </motion.div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-syne)] mb-2">Turno Confirmado</h3>
                <p className="text-sm text-black/35 text-center mb-2 font-[family-name:var(--font-space)]">
                  {selectedService?.name} • {selectedDate} de {monthNames[currentMonth]} a las {selectedTime} hs
                </p>
                <p className="text-xs text-black/15 text-center mb-8">Se enviará una confirmación a tu email</p>
                <button onClick={resetBooking} className="btn-secondary">Reservar Otro Turno</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
