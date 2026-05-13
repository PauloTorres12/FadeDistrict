'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const letterVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.15 + i * 0.035,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  const title = 'FADE DISTRIC';

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
      id="hero"
    >
      {/* Ambient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#fafafa] to-white" />
        <motion.div
          style={{ y }}
          className="absolute inset-0"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full bg-black/[0.015] blur-[120px]" />
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 text-center px-4 flex flex-col items-center"
      >
        {/* Pre-title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-xs md:text-sm tracking-[0.4em] uppercase text-black/30 mb-6 md:mb-8 font-[family-name:var(--font-space)]"
        >
          Barbería Premium
        </motion.p>

        {/* Title */}
        <div className="overflow-hidden mb-8 md:mb-10">
          <h1
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-[family-name:var(--font-syne)] tracking-tight leading-none"
          >
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              className="flex justify-center flex-wrap"
            >
              {title.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  className={letter === ' ' ? 'w-4 md:w-8' : ''}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </motion.div>
          </h1>
        </div>

        {/* Subtitle — centered */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-sm md:text-base text-black/35 max-w-sm mx-auto mb-16 md:mb-20 font-[family-name:var(--font-space)] leading-relaxed text-center"
        >
          Donde la precisión se encuentra con el arte.
          <br />
          Construyendo confianza, un fade a la vez.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a href="#turnos" className="btn-primary w-full sm:w-auto">
            Reservar Turno
          </a>
          <a href="#galeria" className="btn-secondary w-full sm:w-auto">
            Ver Galería
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
