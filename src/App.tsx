import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  ArrowUpRight,
  MapPin,
  Clock,
  Phone,
  Mail,
  Check,
  RotateCcw,
  Upload,
  ImagePlus,
  Loader2,
  X,
} from 'lucide-react';
import {
  INITIAL_HERO_IMAGE_URL,
  INITIAL_SIGNATURE_ITEMS,
  INITIAL_GALLERY_ITEMS,
  ORIGINAL_MENU_CATEGORIES,
  SignatureItem,
  GalleryItem,
} from './data/cafeData';
import { SignatureShowcaseItem } from './components/SignatureShowcaseItem';
import { StaticMenuSection } from './components/StaticMenuSection';
import { StaticCulinaryImage } from './components/StaticCulinaryImage';
import { ReviewsSection } from './components/ReviewsSection';
import { OrderDrawer, ReservationModal, OrderItem } from './components/HospitalityDrawers';
import {
  getSignatureFileFromIdb,
  removeSignatureFileFromIdb,
  saveSignatureFileToIdb,
  uploadSignatureFileChunked,
} from './utils/signatureStorage';

const GALLERY_STORAGE_KEY = 'shangaas_cafe_gallery_items_v3';

export default function App() {
  const [heroImageUrl, setHeroImageUrl] = useState<string>(INITIAL_HERO_IMAGE_URL);
  const [isUploadingHero, setIsUploadingHero] = useState<boolean>(false);
  const [heroUploadPct, setHeroUploadPct] = useState<number>(0);
  const [signatureItems, setSignatureItems] = useState<SignatureItem[]>(INITIAL_SIGNATURE_ITEMS);
  const [verifiedFiles, setVerifiedFiles] = useState<
    Record<string, { exists: boolean; filePath: string; publicUrl: string; sizeBytes: number }>
  >({});

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial gallery items
    }
    return INITIAL_GALLERY_ITEMS;
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [preselectedDish, setPreselectedDish] = useState<string | undefined>(undefined);
  const [activeGalleryModal, setActiveGalleryModal] = useState<GalleryItem | null>(null);
  const [activeGallerySlotId, setActiveGallerySlotId] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const gallerySlotUploadRef = useRef<HTMLInputElement>(null);
  const galleryBatchUploadRef = useRef<HTMLInputElement>(null);

  // Load permanent signature asset paths from project repository (/src/data/signatureAssets.json)
  // and ensure actual uploaded files exist physically inside /public/assets/signatures/
  useEffect(() => {
    let isMounted = true;

    async function syncPermanentSignatureAssets() {
      try {
        // 1. Migrate any legacy localStorage signature images into physical /public/assets/signatures/ files
        const legacyKeys = [
          'shangaas_cafe_signature_items_v3',
          'shangaas_cafe_signature_items_v2',
          'shangaas_cafe_signature_items_v1',
          'shangaas_cafe_signature_items',
        ];
        for (const key of legacyKeys) {
          const raw = localStorage.getItem(key);
          if (raw) {
            let allSaved = true;
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                for (const legacyItem of parsed) {
                  if (
                    legacyItem?.id &&
                    typeof legacyItem.gifUrl === 'string' &&
                    legacyItem.gifUrl.startsWith('data:image/')
                  ) {
                    const res = await fetch(legacyItem.gifUrl);
                    const blob = await res.blob();
                    const uploaded = await uploadSignatureFileChunked(
                      legacyItem.id,
                      blob,
                      `${legacyItem.id}.${blob.type.split('/')[1] || 'gif'}`,
                      blob.type || 'image/gif'
                    );
                    if (uploaded) {
                      await saveSignatureFileToIdb(
                        legacyItem.id,
                        blob,
                        `${legacyItem.id}.${blob.type.split('/')[1] || 'gif'}`,
                        blob.type || 'image/gif'
                      );
                    } else {
                      allSaved = false;
                    }
                  }
                }
              }
            } catch {
              allSaved = false;
            }
            if (allSaved) {
              localStorage.removeItem(key);
            }
          }
        }

        // 2. Check current physical files in /public/assets/signatures/
        const checkRes = await fetch('/api/signature-assets');
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          const currentVerified = checkData?.verifiedFiles || {};

          // 3. If any file is missing on server disk after a container restart, restore it from IDB backup
          let restoredAny = false;
          const heroIdbRecord = await getSignatureFileFromIdb('hero');
          if (
            heroIdbRecord &&
            (!currentVerified['hero']?.exists ||
              currentVerified['hero']?.fileName === 'hero_shangaas_cafe_1791188557404.jpg')
          ) {
            const uploadedHero = await uploadSignatureFileChunked(
              'hero',
              heroIdbRecord.blob,
              heroIdbRecord.fileName,
              heroIdbRecord.mimeType
            );
            if (uploadedHero) {
              restoredAny = true;
            }
          }

          for (const item of INITIAL_SIGNATURE_ITEMS) {
            if (!currentVerified[item.id]?.exists) {
              const idbRecord = await getSignatureFileFromIdb(item.id);
              if (idbRecord) {
                const uploaded = await uploadSignatureFileChunked(
                  item.id,
                  idbRecord.blob,
                  idbRecord.fileName,
                  idbRecord.mimeType
                );
                if (uploaded) {
                  restoredAny = true;
                }
              }
            }
          }

          const finalRes = restoredAny ? await fetch('/api/signature-assets') : checkRes;
          const finalData = restoredAny && finalRes.ok ? await finalRes.json() : checkData;

          if (isMounted && finalData?.assets && typeof finalData.assets === 'object') {
            if (finalData.verifiedFiles) {
              setVerifiedFiles(finalData.verifiedFiles);
            }
            if (finalData.assets['hero']) {
              setHeroImageUrl(finalData.assets['hero']);
            }
            setSignatureItems((prev) =>
              prev.map((item) => ({
                ...item,
                gifUrl: finalData.assets[item.id] || '',
              }))
            );
          }
        }
      } catch {
        // Fallback to static import from signatureAssets.json
      }
    }

    syncPermanentSignatureAssets();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(galleryItems));
    } catch {
      // Ignore storage quota issues
    }
  }, [galleryItems]);

  const handleUploadSignatureFile = async (
    id: string,
    file: File,
    onProgress?: (pct: number) => void
  ) => {
    try {
      await saveSignatureFileToIdb(id, file, file.name, file.type || 'image/gif');
      const result = await uploadSignatureFileChunked(
        id,
        file,
        file.name,
        file.type || 'image/gif',
        onProgress
      );
      if (result && result.assetPath) {
        const displayUrl = `${result.assetPath}?v=${Date.now()}`;
        if (id === 'hero') {
          setHeroImageUrl(displayUrl);
        } else {
          setSignatureItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, gifUrl: displayUrl } : item))
          );
        }
        setVerifiedFiles((prev) => ({
          ...prev,
          [id]: {
            exists: true,
            filePath: result.filePath,
            publicUrl: result.assetPath,
            sizeBytes: result.sizeBytes,
          },
        }));
      }
    } catch (err) {
      console.error('Failed to upload signature file to repository:', err);
    }
  };

  const handleUpdateGif = async (id: string, newGifInput: string) => {
    try {
      if (!newGifInput) {
        await removeSignatureFileFromIdb(id);
      }
      const isDataUrl = newGifInput.startsWith('data:image/');
      const res = await fetch('/api/signature-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          dataUrl: isDataUrl ? newGifInput : undefined,
          externalUrl: !isDataUrl && newGifInput ? newGifInput : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const permanentPath = data.assetPath || '';
        if (data.verifiedFiles) {
          setVerifiedFiles(data.verifiedFiles);
        }
        const displayUrl = permanentPath
          ? `${permanentPath}?v=${Date.now()}`
          : '';
        setSignatureItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, gifUrl: displayUrl } : item))
        );
      }
    } catch (err) {
      console.error('Failed to persist signature asset:', err);
    }
  };

  const handleUpdateDetails = (id: string, updates: Partial<SignatureItem>) => {
    setSignatureItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleResetAllSignatures = async () => {
    for (const item of INITIAL_SIGNATURE_ITEMS) {
      await handleUpdateGif(item.id, '');
    }
  };

  const handleTriggerGallerySlotUpload = (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    setActiveGallerySlotId(slotId);
    gallerySlotUploadRef.current?.click();
  };

  const handleGallerySlotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeGallerySlotId) return;

    const targetId = activeGallerySlotId;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setGalleryItems((prev) =>
          prev.map((item) =>
            item.id === targetId ? { ...item, imageUrl: dataUrl } : item
          )
        );
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setActiveGallerySlotId(null);
  };

  const handleClearGallerySlot = (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    setGalleryItems((prev) =>
      prev.map((item) => (item.id === slotId ? { ...item, imageUrl: '' } : item))
    );
  };

  const handleGalleryBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const dataUrl = reader.result;
          setGalleryItems((prev) => {
            // Fill first empty slot if available, otherwise append
            const emptyIndex = prev.findIndex((g) => !g.imageUrl);
            if (emptyIndex !== -1) {
              const copy = [...prev];
              copy[emptyIndex] = {
                ...copy[emptyIndex],
                imageUrl: dataUrl,
              };
              return copy;
            }
            return [
              ...prev,
              {
                id: `orig-gal-${Date.now()}-${idx}`,
                title: `Gallery Photo ${String(prev.length + 1).padStart(2, '0')}`,
                caption: '',
                category: 'The Shangaas Cafe',
                aspect: 'standard',
                imageUrl: dataUrl,
              },
            ];
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddToOrder = (newItem: {
    id: string;
    name: string;
    price: number;
    category: string;
  }) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const handleUpdateOrderQty = (id: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleReserveWithDish = (dishName: string) => {
    setPreselectedDish(dishName);
    setIsReservationOpen(true);
  };

  const totalOrderCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePrivateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim()) return;
    setContactSubmitted(true);
    setContactEmail('');
    setContactMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231F1C] flex flex-col">
      {/* STRICT 3-ZONE TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 h-16 bg-[#FAF7F2]/92 backdrop-blur-md border-b border-[#231F1C]/8 px-6 sm:px-10 lg:px-14 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-2xl sm:text-[26px] font-medium tracking-tight text-[#231F1C] whitespace-nowrap"
        >
          The Shangaas Cafe
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-medium text-[#5C544D]"
        >
          <a
            href="#signatures"
            className="hover:text-[#231F1C] underline-offset-4 hover:underline transition-colors whitespace-nowrap"
          >
            Signatures
          </a>
          <a
            href="#menu"
            className="hover:text-[#231F1C] underline-offset-4 hover:underline transition-colors whitespace-nowrap"
          >
            Our Menu
          </a>
          <a
            href="#story"
            className="hover:text-[#231F1C] underline-offset-4 hover:underline transition-colors whitespace-nowrap"
          >
            Story
          </a>
          <a
            href="#gallery"
            className="hover:text-[#231F1C] underline-offset-4 hover:underline transition-colors whitespace-nowrap"
          >
            Gallery
          </a>
          <a
            href="#visit"
            className="hover:text-[#231F1C] underline-offset-4 hover:underline transition-colors whitespace-nowrap"
          >
            Visit
          </a>
        </nav>

        {/* Zone 3: 2 Primary Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOrderOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-[#231F1C] bg-[#EFE9DF] rounded-lg hover:bg-[#E4DCCE] transition-colors whitespace-nowrap cursor-pointer font-mono-tabular"
          >
            Order ({totalOrderCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setPreselectedDish(undefined);
              setIsReservationOpen(true);
            }}
            className="px-4 py-2 text-xs font-medium text-[#FAF7F2] bg-[#231F1C] rounded-lg hover:bg-[#3A332C] transition-colors whitespace-nowrap cursor-pointer"
          >
            Reserve a Table
          </button>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* HERO SECTION */}
        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) {
              setIsUploadingHero(true);
              setHeroUploadPct(0);
              try {
                await handleUploadSignatureFile('hero', file, (pct) => setHeroUploadPct(pct));
              } finally {
                setIsUploadingHero(false);
                setHeroUploadPct(0);
              }
            }
          }}
          className="relative group bg-[#1C1815] lg:bg-[#231F1C] lg:min-h-[84vh] lg:flex lg:items-end overflow-hidden"
        >
          <input
            ref={heroFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              e.target.value = '';
              setIsUploadingHero(true);
              setHeroUploadPct(0);
              try {
                await handleUploadSignatureFile('hero', file, (pct) => setHeroUploadPct(pct));
              } finally {
                setIsUploadingHero(false);
                setHeroUploadPct(0);
              }
            }}
            className="hidden"
            aria-label="Upload permanent hero background image"
          />

          {/* Hero Artwork Stage: Natural panoramic framing on mobile/tablet so moon, face & flowers stay balanced; full-bleed on desktop */}
          <div className="relative w-full aspect-[1.85/1] sm:aspect-[2/1] lg:aspect-auto lg:absolute lg:inset-0 lg:h-full overflow-hidden">
            <StaticCulinaryImage
              src={heroImageUrl}
              alt="The Shangaas Cafe dining room"
              className="w-full h-full object-cover object-[52%_42%] sm:object-[52%_46%] lg:object-center"
            />
            {/* Desktop overlay (unchanged) */}
            <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
            {/* Mobile & tablet subtle top vignette and seamless bottom transition into the text canvas */}
            <div className="lg:hidden absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
            <div className="lg:hidden absolute inset-x-0 bottom-0 h-20 sm:h-24 bg-gradient-to-t from-[#1C1815] via-[#1C1815]/55 to-transparent pointer-events-none" />
          </div>

          <div className="absolute top-3 right-3 sm:top-5 sm:right-6 lg:top-6 lg:right-6 z-20 flex items-center gap-2 opacity-85 hover:opacity-100 transition-opacity">
            <button
              type="button"
              disabled={isUploadingHero}
              onClick={() => heroFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-medium bg-[#FAF7F2]/90 text-[#231F1C] rounded-lg shadow-sm hover:bg-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {isUploadingHero ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    Saving Hero Image{heroUploadPct > 0 ? ` (${heroUploadPct}%)` : '...'}
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#7E5A3B]" />
                  <span>Replace Hero Image</span>
                </>
              )}
            </button>
          </div>

          <div className="relative z-10 w-full max-w-[1360px] mx-auto px-5 sm:px-10 lg:px-14 -mt-3 sm:-mt-5 lg:mt-0 pt-0 lg:pt-32 pb-8 sm:pb-14 lg:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <p className="text-[11px] sm:text-xs lg:text-sm text-[#E6D7C3] tracking-wide mb-2 sm:mb-3 lg:mb-4">
                The Shangaas Cafe · Signature Food &amp; Beverages
              </p>

              <h1 className="font-display text-[32px] sm:text-5xl md:text-6xl lg:text-7xl text-[#FAF7F2] font-normal leading-[1.08] lg:leading-[1.06] tracking-tight mb-3 sm:mb-5 lg:mb-6 [text-wrap:balance]">
                The Shangaas Cafe
              </h1>

              <p className="text-[13.5px] sm:text-base lg:text-lg text-[#EAE2D6] leading-[1.55] sm:leading-relaxed max-w-2xl mb-5 sm:mb-8 lg:mb-10">
                Where every bite tells a story of flavour and comfort.
                <br />
                Freshly prepared favourites, delicious sips, and moments worth savouring.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                <a
                  href="#signatures"
                  className="inline-flex items-center gap-1.5 sm:gap-2.5 px-3.5 py-2.5 sm:px-6 sm:py-3.5 text-[11.5px] sm:text-sm font-medium bg-[#FAF7F2] text-[#231F1C] rounded-lg hover:bg-[#EFE9DF] transition-colors whitespace-nowrap"
                >
                  <span>Explore Signature Collection</span>
                  <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7E5A3B]" />
                </a>

                <a
                  href="#menu"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-6 sm:py-3.5 text-[11.5px] sm:text-sm font-medium text-[#FAF7F2] border border-[#FAF7F2]/35 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  <span>View Original Menu</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ABOUT / ARCHITECTURAL ETHOS SECTION */}
        <section
          id="about"
          className="py-20 lg:py-28 bg-[#FAF7F2] border-b border-[#231F1C]/8"
        >
          <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5">
                <p className="text-xs text-[#7E5A3B] font-medium mb-3">
                  About Us · Warm &amp; Inviting Hospitality
                </p>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] text-[#231F1C] font-normal leading-[1.15] [text-wrap:balance]">
                  Signature Craft &amp; Authentic Flavors at The Shangaas Cafe
                </h2>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <p className="text-base sm:text-lg text-[#4A433D] leading-[1.75]">
                  The Shangaas Cafe brings together a warm, inviting atmosphere with an
                  extensive original menu spanning freshly crafted Mocktails, Appetizers,
                  Tandoori specialties, Momos, Noodles, Main Courses, Thalis, Burgers,
                  Sandwiches, Pizza, Pasta, Wraps, Kahwa, Coffee, Tea, Shakes, and Desserts.
                </p>

                <div className="pt-6 border-t border-[#231F1C]/10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="font-display text-3xl sm:text-4xl text-[#231F1C] font-mono-tabular">
                      04
                    </p>
                    <p className="text-xs text-[#6E655C] mt-1">
                      Dedicated Animated Signature Showcases
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-3xl sm:text-4xl text-[#231F1C] font-mono-tabular">
                      {ORIGINAL_MENU_CATEGORIES.length}
                    </p>
                    <p className="text-xs text-[#6E655C] mt-1">
                      Original Menu Categories
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-3xl sm:text-4xl text-[#231F1C] font-mono-tabular">
                      100%
                    </p>
                    <p className="text-xs text-[#6E655C] mt-1">
                      Authentic Original Recipes &amp; Preparation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SIGNATURE COLLECTION — 4 ANIMATED ITEMS */}
        <section id="signatures" aria-labelledby="signatures-heading" className="bg-[#FAF7F2]">
          <div className="pt-20 lg:pt-28 pb-10 border-b border-[#231F1C]/8">
            <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <p className="text-xs text-[#7E5A3B] font-medium mb-3">
                    The Centerpiece Experience · 4 Signature Creations
                  </p>
                  <h2
                    id="signatures-heading"
                    className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#231F1C] font-normal tracking-tight [text-wrap:balance]"
                  >
                    Signature Collection
                  </h2>
                </div>

                {signatureItems.some((i) => i.gifUrl !== '') && (
                  <button
                    type="button"
                    onClick={handleResetAllSignatures}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#6E655C] hover:text-[#231F1C] border border-[#231F1C]/15 rounded-lg transition-colors whitespace-nowrap cursor-pointer self-start lg:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset GIF Slots</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            {signatureItems.map((item, idx) => (
              <SignatureShowcaseItem
                key={item.id}
                item={item}
                index={idx}
                verifiedFilePath={verifiedFiles[item.id]?.filePath}
                onUploadFile={handleUploadSignatureFile}
                onUpdateGif={handleUpdateGif}
                onUpdateDetails={handleUpdateDetails}
                onAddToOrder={handleAddToOrder}
                onReserveWithDish={handleReserveWithDish}
              />
            ))}
          </div>
        </section>

        {/* ORIGINAL MENU SECTION */}
        <StaticMenuSection onAddToOrder={handleAddToOrder} />

        {/* 1. CAFE STORY SECTION — MINIMAL & ELEGANT */}
        <section
          id="story"
          aria-labelledby="story-heading"
          className="py-24 lg:py-32 bg-[#FAF7F2] border-t border-[#231F1C]/8"
        >
          <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#EFE9DF] border border-[#231F1C]/10">
                  <StaticCulinaryImage
                    src="/src/assets/images/story_cafe_craft_1791188576579.jpg"
                    alt="The Shangaas Cafe interior and preparation counter"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-6">
                <h2
                  id="story-heading"
                  className="font-display text-3xl sm:text-5xl text-[#231F1C] font-normal leading-[1.15] [text-wrap:balance]"
                >
                  “Destination for every craving, from morning breakfast to evening dining.”
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* 3. GALLERY SECTION — REPLACEABLE ORIGINAL CAFE PHOTO SLOTS */}
        <section
          id="gallery"
          aria-labelledby="gallery-heading"
          className="py-24 lg:py-32 bg-[#EFE9DF]/60 border-t border-[#231F1C]/8"
        >
          {/* Hidden input for individual gallery slot upload/replace */}
          <input
            ref={gallerySlotUploadRef}
            type="file"
            accept="image/*"
            onChange={handleGallerySlotFileChange}
            className="hidden"
            aria-label="Upload or replace gallery photo"
          />

          {/* Hidden input for uploading multiple original gallery photos */}
          <input
            ref={galleryBatchUploadRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryBatchUpload}
            className="hidden"
            aria-label="Upload multiple gallery photos"
          />

          <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-xs text-[#7E5A3B] font-medium mb-3">
                  Visual Lookbook · The Shangaas Cafe
                </p>
                <h2
                  id="gallery-heading"
                  className="font-display text-3xl sm:text-5xl text-[#231F1C] font-normal tracking-tight"
                >
                  Gallery
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => galleryBatchUploadRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Original Gallery Photos</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {galleryItems.map((item, idx) => {
                const colSpan =
                  idx % 6 === 0 || idx % 6 === 5 ? 'md:col-span-8' : 'md:col-span-4';
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.imageUrl) {
                        setActiveGalleryModal(item);
                      }
                    }}
                    className={`${colSpan} group relative text-left bg-[#FAF7F2] rounded-xl overflow-hidden border border-[#231F1C]/8 transition-all ${
                      item.imageUrl ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E6DFD3] flex items-center justify-center">
                      {item.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => handleTriggerGallerySlotUpload(e, item.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-[#FAF7F2]/95 text-[#231F1C] rounded-lg shadow-sm hover:bg-white cursor-pointer"
                            >
                              Replace Photo
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleClearGallerySlot(e, item.id)}
                              aria-label="Remove gallery photo"
                              className="p-1.5 bg-[#231F1C]/80 text-[#FAF7F2] rounded-lg hover:bg-[#231F1C] cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6">
                          <p className="font-display text-lg text-[#231F1C] mb-3">
                            {item.title}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => handleTriggerGallerySlotUpload(e, item.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#FAF7F2] text-[#231F1C] border border-[#231F1C]/15 rounded-lg hover:bg-white transition-colors cursor-pointer shadow-2xs"
                          >
                            <ImagePlus className="w-3.5 h-3.5 text-[#7E5A3B]" />
                            <span>Add Gallery Image</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. REVIEWS SECTION — REAL CUSTOMER EXPERIENCES ONLY */}
        <ReviewsSection />

        {/* LOCATION, HOURS, CONTACT & RESERVATION CTA */}
        <section
          id="visit"
          aria-labelledby="visit-heading"
          className="py-24 lg:py-32 bg-[#FAF7F2] border-t border-[#231F1C]/8"
        >
          <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14">
            <div className="p-8 sm:p-12 lg:p-16 rounded-2xl bg-[#EFE9DF] border border-[#231F1C]/10 mb-20 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <p className="text-xs text-[#7E5A3B] font-medium mb-3">
                  Reservations &amp; Orders · The Shangaas Cafe
                </p>
                <h2
                  id="visit-heading"
                  className="font-display text-3xl sm:text-5xl text-[#231F1C] font-normal leading-tight mb-4 [text-wrap:balance]"
                >
                  Reserve Your Table at The Shangaas Cafe
                </h2>
                <p className="text-sm sm:text-base text-[#5C544D] leading-relaxed">
                  Join us for our signature creations and full kitchen menu, or place your
                  selection online.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPreselectedDish('All 4 Signature Tasting Flight');
                    setIsReservationOpen(true);
                  }}
                  className="px-6 py-3.5 text-xs sm:text-sm font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Reserve a Table
                </button>
                <button
                  type="button"
                  onClick={() => setIsOrderOpen(true)}
                  className="px-6 py-3.5 text-xs sm:text-sm font-medium bg-[#FAF7F2] text-[#231F1C] border border-[#231F1C]/15 rounded-lg hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  View Order ({totalOrderCount})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center gap-2 text-xs text-[#7E5A3B] font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>Location &amp; Contact</span>
                </div>
                <h3 className="font-display text-2xl text-[#231F1C]">
                  The Shangaas Cafe
                </h3>
                <div className="pt-2 space-y-1.5 text-xs text-[#6E655C]">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#7E5A3B]" />
                    <span>theshangaascaferesto@gmail.com</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#7E5A3B]" />
                    <span className="font-mono-tabular">Contact Cafe Desk</span>
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center gap-2 text-xs text-[#7E5A3B] font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Opening Hours</span>
                </div>
                <h3 className="font-display text-2xl text-[#231F1C]">
                  Daily Service
                </h3>
                <div className="space-y-2.5 text-xs sm:text-sm border-t border-[#231F1C]/10 pt-3">
                  <div className="flex justify-between">
                    <span className="text-[#5C544D]">Breakfast &amp; Beverages</span>
                    <span className="font-mono-tabular text-[#231F1C]">Morning Service</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C544D]">All-Day Menu &amp; Thalis</span>
                    <span className="font-mono-tabular text-[#231F1C]">Midday Service</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C544D]">Tandoori, Mains &amp; Signatures</span>
                    <span className="font-mono-tabular text-[#231F1C]">Evening Service</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <p className="text-xs text-[#7E5A3B] font-medium">
                  Direct Inquiry
                </p>
                <h3 className="font-display text-2xl text-[#231F1C]">
                  Write to Us
                </h3>

                {contactSubmitted ? (
                  <div className="p-4 rounded-xl bg-[#EFE9DF] border border-[#231F1C]/10 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-[#4A5D4E] font-medium">
                      <Check className="w-4 h-4" />
                      <span>Inquiry Received</span>
                    </div>
                    <p className="text-[#5C544D]">
                      Thank you for contacting The Shangaas Cafe. We will get back to you shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setContactSubmitted(false)}
                      className="text-[#7E5A3B] underline cursor-pointer"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePrivateInquiry} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C] focus:outline-none focus:border-[#7E5A3B]"
                    />
                    <textarea
                      rows={2}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Reservation request or inquiry..."
                      className="w-full px-3.5 py-2 text-xs bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C] focus:outline-none focus:border-[#7E5A3B]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* QUIET ARCHITECTURAL FOOTER */}
      <footer className="py-10 px-6 sm:px-10 lg:px-14 bg-[#EFE9DF] border-t border-[#231F1C]/10 text-xs text-[#6E655C]">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg text-[#231F1C] font-medium">
              The Shangaas Cafe
            </span>
            <span aria-hidden="true">·</span>
            <span>Signature Food &amp; Beverages</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#signatures" className="hover:text-[#231F1C] transition-colors">
              Signature Collection
            </a>
            <a href="#menu" className="hover:text-[#231F1C] transition-colors">
              Original Menu
            </a>
            <a href="#story" className="hover:text-[#231F1C] transition-colors">
              Story
            </a>
            <button
              type="button"
              onClick={() => setIsReservationOpen(true)}
              className="hover:text-[#231F1C] transition-colors cursor-pointer"
            >
              Reservations
            </button>
            <span>© {new Date().getFullYear()} The Shangaas Cafe</span>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX MODAL FOR GALLERY INSPECTION */}
      {activeGalleryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231F1C]/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={activeGalleryModal.title}
          onClick={() => setActiveGalleryModal(null)}
        >
          <div
            className="max-w-4xl w-full bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#231F1C]/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[16/10] w-full bg-[#EFE9DF]">
              <img
                src={activeGalleryModal.imageUrl}
                alt={activeGalleryModal.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex items-center justify-between gap-4">
              <h3 className="font-display text-2xl text-[#231F1C]">
                {activeGalleryModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveGalleryModal(null)}
                className="px-4 py-2 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DRAWER & TABLE RESERVATION MODAL */}
      <OrderDrawer
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        items={orderItems}
        onUpdateQty={handleUpdateOrderQty}
        onClearOrder={() => setOrderItems([])}
      />

      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        preselectedDish={preselectedDish}
      />
    </div>
  );
}
