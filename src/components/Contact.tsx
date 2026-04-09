'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, AtSign, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contacto" className="pt-52 md:pt-64 pb-24 md:pb-40 relative">
      <div className="container-fluid flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 md:mb-24 text-center"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-black/25 mb-4 font-[family-name:var(--font-space)]">
            Encontranos
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-syne)] tracking-tight">
            Contacto
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0 }}
            className="glass-card p-8 md:p-10 group hover:bg-black/[0.03] transition-all duration-500"
          >
            <MapPin size={22} className="text-black/20 mb-5 group-hover:text-black/50 transition-colors" />
            <h3 className="text-base font-semibold font-[family-name:var(--font-syne)] mb-3">Ubicación</h3>
            <p className="text-sm text-black/35 leading-relaxed font-[family-name:var(--font-space)]">
              Av. Santa Fe 1234<br />Palermo, Buenos Aires<br />Argentina
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-8 md:p-10 group hover:bg-black/[0.03] transition-all duration-500"
          >
            <Clock size={22} className="text-black/20 mb-5 group-hover:text-black/50 transition-colors" />
            <h3 className="text-base font-semibold font-[family-name:var(--font-syne)] mb-3">Horarios</h3>
            <p className="text-sm text-black/35 leading-relaxed font-[family-name:var(--font-space)]">
              Lun – Vie: 9:00 – 20:00<br />Sábado: 10:00 – 18:00<br />Domingo: Cerrado
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8 md:p-10 group hover:bg-black/[0.03] transition-all duration-500"
          >
            <Phone size={22} className="text-black/20 mb-5 group-hover:text-black/50 transition-colors" />
            <h3 className="text-base font-semibold font-[family-name:var(--font-syne)] mb-3">Teléfono</h3>
            <p className="text-sm text-black/35 leading-relaxed font-[family-name:var(--font-space)]">
              +54 11 1234-5678<br />WhatsApp disponible
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-8 md:p-10 group hover:bg-black/[0.03] transition-all duration-500"
          >
            <AtSign size={22} className="text-black/20 mb-5 group-hover:text-black/50 transition-colors" />
            <h3 className="text-base font-semibold font-[family-name:var(--font-syne)] mb-3">Redes</h3>
            <p className="text-sm text-black/35 leading-relaxed font-[family-name:var(--font-space)]">
              @fadedistrict<br />Seguí nuestro trabajo
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
