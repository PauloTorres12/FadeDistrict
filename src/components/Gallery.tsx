'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt: string;
  span: string;
}

const DEFAULT_ITEMS: GalleryItem[] = [
  { id: '1', type: 'image', src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80', alt: 'Fade Clásico', span: 'col-span-2 md:col-span-2 row-span-2 md:row-span-2' },
  { id: '2', type: 'image', src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80', alt: 'Corte Texturizado', span: 'col-span-1 md:col-span-1 row-span-1 md:row-span-1' },
  { id: '3', type: 'image', src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80', alt: 'El Proceso', span: 'col-span-1 md:col-span-1 row-span-2 md:row-span-2' },
  { id: '4', type: 'image', src: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80', alt: 'Diseño con Navaja', span: 'col-span-1 md:col-span-1 row-span-1 md:row-span-1' },
  { id: '5', type: 'image', src: 'https://images.unsplash.com/photo-1521490683712-35a1cb235d1c?w=600&q=80', alt: 'Escultura de Barba', span: 'col-span-2 md:col-span-1 row-span-2 md:row-span-1' },
  { id: '6', type: 'image', src: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=800&q=80', alt: 'Fade Cero', span: 'col-span-2 md:col-span-3 row-span-1 md:row-span-1' },
];

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from('gallery_items')
        .select('*')
        .order('position', { ascending: true });

      if (data && data.length > 0) {
        const merged = DEFAULT_ITEMS.map(defaultItem => {
          const uploaded = data.find((item: any) => String(item.position) === defaultItem.id);
          
          if (uploaded) {
            return {
              ...defaultItem,
              type: uploaded.media_type as 'image' | 'video',
              src: uploaded.src_url,
              alt: uploaded.alt,
              // IMPORTANTE: Mantenemos el span de defaultItem (el código)
              // en lugar de usar el guardado en base de datos.
            };
          }
          return defaultItem;
        });

        setGalleryItems(merged);
      }
    };

    fetchGallery();
  }, []);

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
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section id="galeria" className="py-24 md:py-40 relative">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-16 md:mb-24 text-center"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-black/25 mb-4 font-[family-name:var(--font-space)]">
            Nuestro Trabajo
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-syne)] tracking-tight">
            El Arte
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[220px] md:auto-rows-[300px] max-w-5xl mx-auto"
        >
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={`${item.span} relative overflow-hidden`}
              whileHover={{ scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              {item.type === 'video' ? (
                <video
                  src={item.src}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700"
                  loading="lazy"
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
