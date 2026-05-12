'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Loader2, Film, Check, X } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import { supabase } from '@/lib/supabase';

interface GallerySlot {
  id: number;
  position: number;
  src_url: string;
  alt: string;
  media_type: 'image' | 'video';
  storage_path: string;
  span: string;
}

/* Disposición fija del bento — 6 posiciones con aspect ratio para el crop */
const BENTO_LAYOUT = [
  { position: 1, span: 'col-span-2 md:col-span-2 row-span-2 md:row-span-2', defaultAlt: 'Foto 1', cropAspect: 0.93 },
  { position: 2, span: 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', defaultAlt: 'Foto 2', cropAspect: 0.92 },
  { position: 3, span: 'col-span-1 md:col-span-1 row-span-2 md:row-span-2', defaultAlt: 'Foto 3', cropAspect: 0.45 },
  { position: 4, span: 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', defaultAlt: 'Foto 4', cropAspect: 0.92 },
  { position: 5, span: 'col-span-2 md:col-span-1 row-span-1 md:row-span-1', defaultAlt: 'Foto 5', cropAspect: 0.92 },
  { position: 6, span: 'col-span-2 md:col-span-3 row-span-1 md:row-span-1', defaultAlt: 'Foto 6', cropAspect: 2.88 },
];

/* Generar imagen recortada */
async function getCroppedBlob(imageSrc: string, cropArea: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  await new Promise<void>((resolve) => {
    image.onload = () => resolve();
    image.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    cropArea.x, cropArea.y, cropArea.width, cropArea.height,
    0, 0, cropArea.width, cropArea.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/webp', 0.9);
  });
}

export default function AdminGallery() {
  const [slots, setSlots] = useState<GallerySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePosition, setActivePosition] = useState<number | null>(null);

  /* Estado del cropper */
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  /* Aspect ratio de la posición activa */
  const activeCropAspect = activePosition
    ? BENTO_LAYOUT.find(l => l.position === activePosition)?.cropAspect || 1
    : 1;

  const fetchGallery = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_items')
      .select('*')
      .order('position', { ascending: true });

    if (data) setSlots(data);
    setLoading(false);
  };

  useEffect(() => { fetchGallery(); }, []);

  const getSlotForPosition = (pos: number) => slots.find(s => s.position === pos);

  const handleClickUpload = (position: number) => {
    setActivePosition(position);
    fileInputRef.current?.click();
  };

  /* Al seleccionar archivo: imagen → cropper, video → subida directa */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activePosition === null) return;

    if (file.type.startsWith('video')) {
      uploadFile(file, 'video');
    } else {
      const reader = new FileReader();
      reader.onload = () => setCropImage(reader.result as string);
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!cropImage || !croppedAreaPixels || activePosition === null) return;

    const croppedBlob = await getCroppedBlob(cropImage, croppedAreaPixels);
    const croppedFile = new File([croppedBlob], `slot-${activePosition}.webp`, { type: 'image/webp' });

    closeCropper();
    await uploadFile(croppedFile, 'image');
  };

  const closeCropper = () => {
    setCropImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const uploadFile = async (file: File, mediaType: 'image' | 'video') => {
    if (activePosition === null) return;
    setUploading(activePosition);

    const ext = mediaType === 'image' ? 'webp' : file.name.split('.').pop();
    const timestamp = Date.now();
    const storagePath = `gallery/slot-${activePosition}-${timestamp}.${ext}`;

    const existingSlot = getSlotForPosition(activePosition);
    if (existingSlot?.storage_path) {
      await supabase.storage.from('gallery').remove([existingSlot.storage_path]);
    }

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(storagePath, file, { upsert: true });

    if (uploadError) {
      console.error('Error subiendo archivo:', uploadError);
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;
    const layoutItem = BENTO_LAYOUT.find(l => l.position === activePosition)!;
    const altName = existingSlot?.alt || layoutItem.defaultAlt;

    if (existingSlot) {
      await supabase
        .from('gallery_items')
        .update({ src_url: publicUrl, media_type: mediaType, storage_path: storagePath })
        .eq('position', activePosition);
    } else {
      await supabase
        .from('gallery_items')
        .insert({
          position: activePosition, src_url: publicUrl, alt: altName,
          media_type: mediaType, storage_path: storagePath, span: layoutItem.span,
        });
    }

    await fetchGallery();
    setUploading(null);
    setActivePosition(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-black/20" />
      </div>
    );
  }

  return (
    <motion.div
      key="gallery"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-xs text-black/30 text-center mb-6 font-[family-name:var(--font-space)]">
        Tocá el <strong>+</strong> en cada posición para cambiar la foto o video.
      </p>

      {/* Bento Grid — mismas dimensiones que la página pública */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[220px] md:auto-rows-[300px]">
        {BENTO_LAYOUT.map((layout) => {
          const slot = getSlotForPosition(layout.position);
          const isUploading = uploading === layout.position;

          return (
            <div
              key={layout.position}
              className={`${layout.span} relative group overflow-hidden border border-black/5 bg-black/[0.02]`}
            >
              {slot ? (
                slot.media_type === 'video' ? (
                  <video
                    src={slot.src_url}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted loop playsInline autoPlay
                  />
                ) : (
                  <img
                    src={slot.src_url}
                    alt={slot.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-black/15">
                  <span className="text-xs font-[family-name:var(--font-space)] uppercase tracking-wider">
                    Posición {layout.position}
                  </span>
                </div>
              )}

              {slot?.media_type === 'video' && (
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-0.5 flex items-center gap-1">
                  <Film size={10} />
                  <span className="text-[9px] uppercase tracking-wider">Video</span>
                </div>
              )}

              {isUploading ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                  <Loader2 size={28} className="animate-spin text-white" />
                </div>
              ) : (
                <button
                  onClick={() => handleClickUpload(layout.position)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors duration-300 z-10 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                    <Plus size={20} className="text-black/70" />
                  </div>
                </button>
              )}

              <div className="absolute bottom-2 right-2 text-[9px] text-white/50 font-[family-name:var(--font-space)] bg-black/20 px-1.5 py-0.5 z-10">
                #{layout.position}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-black/20 text-center mt-4 font-[family-name:var(--font-space)]">
        Solo 6 archivos se almacenan — cada posición se sobreescribe al subir uno nuevo.
      </p>

      {/* Modal de recorte — con aspect ratio proporcional a la posición */}
      {cropImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
          <div className="relative flex-1">
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={activeCropAspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { background: 'transparent' },
              }}
            />
          </div>

          <div className="bg-black/90 px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center gap-4 max-w-sm mx-auto w-full">
              <span className="text-[10px] text-white/40 uppercase tracking-wider w-10">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-white h-1"
              />
              <span className="text-xs text-white/60 w-10 text-right">{zoom.toFixed(1)}x</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={closeCropper}
                className="flex items-center gap-2 px-6 py-2.5 border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-xs uppercase tracking-wider"
              >
                <X size={14} />
                Cancelar
              </button>
              <button
                onClick={handleCropConfirm}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-white/90 transition-colors text-xs uppercase tracking-wider font-semibold"
              >
                <Check size={14} />
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
