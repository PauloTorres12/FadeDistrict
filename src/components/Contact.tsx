'use client';

import { motion } from 'framer-motion';
import { Camera, Play } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contacto" className="pt-32 md:pt-64 pb-16 md:pb-40 relative">
      <div className="container-fluid flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-5"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-black/25 mb-4 font-[family-name:var(--font-space)]">
            Encontranos
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-syne)] tracking-tight">
            Contacto
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-2xl gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0 }}
            className="glass-card p-6 md:p-10 group hover:bg-black/[0.03] transition-all duration-500"
          >
            <Camera size={20} className="text-black/20 mb-4 md:mb-5 group-hover:text-black/50 transition-colors" />
            <h3 className="text-sm md:text-base font-semibold font-[family-name:var(--font-syne)] mb-2 md:mb-3">Instagram</h3>
            <p className="text-xs md:text-sm text-black/35 leading-relaxed font-[family-name:var(--font-space)]">
              @fadedistrict<br />Seguí nuestro trabajo
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-6 md:p-10 group hover:bg-black/[0.03] transition-all duration-500"
          >
            <Play size={20} className="text-black/20 mb-4 md:mb-5 group-hover:text-black/50 transition-colors" />
            <h3 className="text-sm md:text-base font-semibold font-[family-name:var(--font-syne)] mb-2 md:mb-3">TikTok</h3>
            <p className="text-xs md:text-sm text-black/35 leading-relaxed font-[family-name:var(--font-space)]">
              @fadedistrict<br />Contenido exclusivo
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
