'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt: string;
  span: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: '1', type: 'image',
    src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
    alt: 'Fade Clásico', span: 'col-span-2 row-span-2',
  },
  {
    id: '2', type: 'image',
    src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80',
    alt: 'Corte Texturizado', span: 'col-span-1 row-span-1',
  },
  {
    id: '3', type: 'image',
    src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80',
    alt: 'El Proceso', span: 'col-span-1 row-span-2',
  },
  {
    id: '4', type: 'image',
    src: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80',
    alt: 'Diseño con Navaja', span: 'col-span-1 row-span-1',
  },
  {
    id: '5', type: 'image',
    src: 'https://images.unsplash.com/photo-1521490683712-35a1cb235d1c?w=600&q=80',
    alt: 'Escultura de Barba', span: 'col-span-1 row-span-1',
  },
  {
    id: '6', type: 'image',
    src: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=800&q=80',
    alt: 'Fade Cero', span: 'col-span-2 row-span-1',
  },
];

export default function Gallery() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="galeria" className="py-24 md:py-40 relative">
      <div className="container-fluid">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 md:mb-24 text-center"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-black/25 mb-4 font-[family-name:var(--font-space)]">
            Nuestro Trabajo
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-syne)] tracking-tight">
            El Arte
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[280px] max-w-5xl mx-auto"
        >
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              layoutId={`gallery-${item.id}`}
              onClick={() => setSelectedItem(item)}
              className={`${item.span} relative cursor-pointer group overflow-hidden rounded-sm`}
              whileHover={{ scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Real image */}
              <img
                src={item.src}
                alt={item.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

              {/* Content overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-white/80 backdrop-blur-md p-3 md:p-4 -mx-4 md:-mx-6 -mb-4 md:-mb-6 px-4 md:px-6 pb-4 md:pb-6">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-1">
                    Foto
                  </p>
                  <p className="text-sm md:text-base font-medium font-[family-name:var(--font-syne)] text-black">
                    {item.alt}
                  </p>
                </div>
              </div>

              <div className="absolute inset-0 border border-black/0 group-hover:border-black/8 transition-colors duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
              <motion.div
                layoutId={`gallery-${selectedItem.id}`}
                className="relative w-full max-w-4xl aspect-[4/3] md:aspect-video overflow-hidden rounded-sm"
              >
                <img
                  src={selectedItem.src}
                  alt={selectedItem.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-6"
                >
                  <p className="text-xs tracking-[0.2em] uppercase text-black/30 mb-1">
                    Foto
                  </p>
                  <p className="text-lg font-medium font-[family-name:var(--font-syne)]">
                    {selectedItem.alt}
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                >
                  <X size={18} className="text-white" />
                </motion.button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
