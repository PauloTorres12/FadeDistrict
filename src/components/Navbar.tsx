'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Galería', href: '#galeria' },
    { label: 'Turnos', href: '#turnos' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-black/5'
            : 'bg-transparent'
        }`}
      >
        <div className="container-fluid flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group relative">
            {/* FD box — visible at top, fades out on scroll */}
            <motion.div
              animate={{ opacity: scrolled ? 0 : 1, scale: scrolled ? 0.8 : 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
              style={{ position: scrolled ? 'absolute' : 'relative', pointerEvents: scrolled ? 'none' : 'auto' }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 border border-black/20 flex items-center justify-center group-hover:border-black/50 transition-all duration-300">
                <span className="text-sm md:text-base font-bold font-[family-name:var(--font-syne)] tracking-wider">
                  FD
                </span>
              </div>
              <span className="hidden sm:block text-xs tracking-[0.3em] uppercase text-black/40 group-hover:text-black/70 transition-colors duration-300">
                Fade District
              </span>
            </motion.div>

            {/* Logo image — hidden at top, appears on scroll */}
            <motion.div
              animate={{ opacity: scrolled ? 1 : 0, scale: scrolled ? 1 : 0.8 }}
              transition={{ duration: 0.3 }}
              style={{ position: scrolled ? 'relative' : 'absolute', pointerEvents: scrolled ? 'auto' : 'none' }}
            >
              <Image
                src="/assets/logo-fadedistrict-enpng.png"
                alt="Fade District"
                width={120}
                height={40}
                className="h-8 md:h-10 w-auto object-contain"
                priority
              />
            </motion.div>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs tracking-[0.2em] uppercase text-black/40 hover:text-black transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-black group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <a
              href="#turnos"
              className="text-xs tracking-[0.15em] uppercase px-5 py-2.5 bg-black text-white font-semibold hover:bg-black/85 transition-all duration-300"
            >
              Reservar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Abrir menú"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-px bg-black"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-px bg-black"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-px bg-black"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navItems.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-2xl tracking-[0.2em] uppercase text-black/50 hover:text-black transition-colors"
              >
                {item.label}
              </motion.a>
            ))}
            <motion.a
              href="#turnos"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-4 text-sm tracking-[0.15em] uppercase px-8 py-3 bg-black text-white font-semibold"
            >
              Reservar
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
