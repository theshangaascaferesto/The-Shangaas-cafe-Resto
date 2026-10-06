import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Upload, Link2, ArrowUpRight, Check, RotateCcw } from 'lucide-react';
import { SignatureItem } from '../data/cafeData';

interface SignatureShowcaseItemProps {
  item: SignatureItem;
  index: number;
  onUpdateGif: (id: string, newGifUrl: string) => void;
  onUpdateDetails: (id: string, updates: Partial<SignatureItem>) => void;
  onAddToOrder: (item: { id: string; name: string; price: number; category: string }) => void;
  onReserveWithDish: (dishName: string) => void;
}

export const SignatureShowcaseItem: React.FC<SignatureShowcaseItemProps> = ({
  item,
  index,
  onUpdateGif,
  onAddToOrder,
  onReserveWithDish,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState(item.gifUrl);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const isEven = index % 2 === 0;

  // Smooth scroll parallax & scale using compositor-only transform/opacity
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const mediaY = useTransform(scrollYProgress, [0, 0.5, 1], [36, 0, -36]);
  const mediaScale = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.95, 1, 1, 0.98]);
  const contentY = useTransform(scrollYProgress, [0, 0.5, 1], [24, 0, -18]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateGif(item.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
    setShowUrlInput(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateGif(item.id, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlDraft.trim()) {
      onUpdateGif(item.id, urlDraft.trim());
      setShowUrlInput(false);
    }
  };

  const numericPrice = Number(String(item.price).replace(/[^0-9.]/g, '')) || 0;

  const handleOrderClick = () => {
    onAddToOrder({
      id: item.id,
      name: item.name,
      price: numericPrice,
      category: 'Signature Collection',
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  return (
    <article
      ref={containerRef}
      className="relative py-16 md:py-24 lg:py-28 border-b border-[#231F1C]/8 last:border-b-0"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
            isEven ? '' : 'lg:[&>*:first-child]:order-2'
          }`}
        >
          {/* LARGE DEDICATED ANIMATED GIF / IMAGE VISUAL AREA */}
          <motion.div
            style={{ y: mediaY, scale: mediaScale }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/gif,image/webp,image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label={`Upload animated GIF or image for ${item.name}`}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              className={`relative w-full aspect-[16/11] sm:aspect-[16/10] rounded-2xl overflow-hidden transition-all duration-300 ${
                isDraggingOver
                  ? 'ring-2 ring-[#7E5A3B] bg-[#EFE9DF]'
                  : 'bg-[#F2ECE1] border border-[#231F1C]/10 shadow-[0_24px_60px_-20px_rgba(35,31,28,0.12)]'
              }`}
            >
              {item.gifUrl ? (
                <div className="relative w-full h-full bg-[#EFE9DF]">
                  <img
                    src={item.gifUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 text-xs font-medium bg-[#FAF7F2]/95 text-[#231F1C] rounded-lg shadow-sm hover:bg-white transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Replace GIF / Image
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateGif(item.id, '')}
                      aria-label="Reset GIF slot"
                      className="p-2 text-xs font-medium bg-[#231F1C]/80 text-[#FAF7F2] rounded-lg hover:bg-[#231F1C] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10 overflow-hidden select-none">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-90"
                    style={{
                      background: `radial-gradient(circle at 50% 42%, ${item.accentTone}35 0%, #EFE8DC 58%, #E7DFD0 100%)`,
                    }}
                  />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.07, 1],
                        opacity: [0.35, 0.6, 0.35],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-[#7E5A3B]/20"
                    />
                    <motion.div
                      animate={{
                        scale: [1.05, 0.96, 1.05],
                        rotate: [0, 12, 0],
                        opacity: [0.25, 0.45, 0.25],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-dashed border-[#7E5A3B]/25"
                    />
                  </div>

                  {/* Top Frame Bar */}
                  <div className="relative z-10 flex items-center justify-between text-xs text-[#6E655C]">
                    <span className="font-mono-tabular text-[#7E5A3B] font-medium">
                      SIGNATURE {item.indexNumber}
                    </span>
                    <span className="font-mono-tabular text-[11px] text-[#6E655C]/80 hidden sm:inline">
                      {item.slotCodeName}
                    </span>
                  </div>

                  {/* Center Upload Controls */}
                  <div className="relative z-10 my-auto text-center max-w-md mx-auto px-4">
                    <h4 className="font-display text-2xl sm:text-3xl text-[#231F1C] font-medium mb-5">
                      {item.name}
                    </h4>

                    {!showUrlInput ? (
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#38322D] transition-colors whitespace-nowrap cursor-pointer shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload GIF / Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium bg-[#FAF7F2]/90 text-[#231F1C] border border-[#231F1C]/15 rounded-lg hover:bg-white transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Paste GIF URL</span>
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleUrlSubmit}
                        className="flex items-center gap-2 max-w-sm mx-auto bg-[#FAF7F2] p-1.5 rounded-lg border border-[#231F1C]/15 shadow-sm"
                      >
                        <input
                          type="url"
                          value={urlDraft}
                          onChange={(e) => setUrlDraft(e.target.value)}
                          placeholder="https://.../your-animation.gif"
                          className="flex-1 px-2.5 py-1.5 text-xs bg-transparent text-[#231F1C] placeholder:text-[#6E655C]/60 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs font-medium bg-[#7E5A3B] text-white rounded-md hover:bg-[#694A2F] transition-colors whitespace-nowrap"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="px-2 py-1.5 text-xs text-[#6E655C] hover:text-[#231F1C]"
                        >
                          Cancel
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-[11px] text-[#6E655C]/90 border-t border-[#231F1C]/8 pt-3">
                    <span>Animated GIF / Image Stage</span>
                    <span>{item.servingNote}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* MINIMAL DISH NAME & INTERACTION COLUMN (NO LONG DESCRIPTIONS) */}
          <motion.div
            style={{ y: contentY }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <div className="flex items-center gap-2 text-xs text-[#7E5A3B] font-medium mb-4">
              <span className="font-mono-tabular">{item.indexNumber}.</span>
              <span aria-hidden="true">·</span>
              <span>Signature Collection</span>
            </div>

            <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#231F1C] font-normal leading-[1.12] tracking-tight mb-8 [text-wrap:balance]">
              {item.name}
            </h3>

            <div className="flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={handleOrderClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] transition-colors whitespace-nowrap cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-[#D9C3B0]" />
                    <span>Added to Selection</span>
                  </>
                ) : (
                  <span>Select Dish</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onReserveWithDish(item.name)}
                className="inline-flex items-center gap-1.5 px-5 py-3 text-xs sm:text-sm font-medium text-[#231F1C] border border-[#231F1C]/20 rounded-lg hover:bg-[#EFE9DF] transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Reserve Table</span>
                <ArrowUpRight className="w-4 h-4 text-[#7E5A3B]" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </article>
  );
};
