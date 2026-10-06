import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImagePlus, ArrowRight, X, Check, Search } from 'lucide-react';
import {
  ORIGINAL_MENU_CATEGORIES,
  OriginalMenuCategory,
  INITIAL_STATIC_MENU_ITEMS,
  StaticMenuItem,
} from '../data/cafeData';

interface StaticMenuSectionProps {
  onAddToOrder: (item: { id: string; name: string; price: number; category: string }) => void;
}

const MENU_ITEMS_STORAGE_KEY = 'shangaas_original_menu_items_v3';
const CATEGORY_IMAGES_STORAGE_KEY = 'shangaas_category_images_v1';

// Normalize category names so "Veg Momos" and "Veg Momo's" match seamlessly
function normalizeCategoryKey(cat: string): string {
  return cat.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Compress uploaded category image on client so all 36 category images store reliably
function compressImageFile(file: File, maxDim = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const StaticMenuSection: React.FC<StaticMenuSectionProps> = ({ onAddToOrder }) => {
  const [menuItems, setMenuItems] = useState<StaticMenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(MENU_ITEMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to initial items
    }
    return INITIAL_STATIC_MENU_ITEMS;
  });

  // One representative image per category: Record<OriginalMenuCategory, string>
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(CATEGORY_IMAGES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // fallback
    }
    return {};
  });

  const [hoveredCategory, setHoveredCategory] = useState<OriginalMenuCategory | null>(null);
  const [activeCategoryModal, setActiveCategoryModal] = useState<OriginalMenuCategory | null>(null);
  const [uploadTargetCategory, setUploadTargetCategory] = useState<OriginalMenuCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  const categoryImageInputRef = useRef<HTMLInputElement>(null);

  // Sync persisted category images & menu items from server if available
  useEffect(() => {
    let isMounted = true;
    fetch('/api/category-images')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (isMounted && data?.images && Object.keys(data.images).length > 0) {
          setCategoryImages((prev) => ({ ...prev, ...data.images }));
        }
      })
      .catch(() => {});

    fetch('/api/menu')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data?.items) && data.items.length > 0) {
          setMenuItems(data.items);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const saveCategoryImagesMap = useCallback((updated: Record<string, string>) => {
    setCategoryImages(updated);
    try {
      localStorage.setItem(CATEGORY_IMAGES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage quota
    }
    fetch('/api/category-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: updated }),
    }).catch(() => {});
  }, []);

  const handleTriggerCategoryImageUpload = (
    e: React.MouseEvent,
    category: OriginalMenuCategory
  ) => {
    e.stopPropagation();
    setUploadTargetCategory(category);
    categoryImageInputRef.current?.click();
  };

  const handleCategoryImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetCategory) return;

    const targetCat = uploadTargetCategory;
    try {
      const dataUrl = await compressImageFile(file);
      const updated = { ...categoryImages, [targetCat]: dataUrl };
      saveCategoryImagesMap(updated);
    } catch {
      // ignore
    }
    e.target.value = '';
    setUploadTargetCategory(null);
  };

  const handleRemoveCategoryImage = (
    e: React.MouseEvent,
    category: OriginalMenuCategory
  ) => {
    e.stopPropagation();
    const updated = { ...categoryImages };
    delete updated[category];
    saveCategoryImagesMap(updated);
  };

  const getItemsForCategory = (category: OriginalMenuCategory): StaticMenuItem[] => {
    const targetNorm = normalizeCategoryKey(category);
    return menuItems.filter((item) => normalizeCategoryKey(item.category) === targetNorm);
  };

  const filteredCategories = ORIGINAL_MENU_CATEGORIES.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (cat.toLowerCase().includes(q)) return true;
    const catItems = getItemsForCategory(cat);
    return catItems.some((item) => item.name.toLowerCase().includes(q));
  });

  const handleOrderDish = (item: StaticMenuItem) => {
    const firstNumberMatch = String(item.price).match(/\d+/);
    const numericPrice = firstNumberMatch ? Number(firstNumberMatch[0]) : 0;
    onAddToOrder({
      id: item.id,
      name: item.name,
      price: numericPrice,
      category: item.category,
    });
    setAddedItemId(item.id);
    setTimeout(() => {
      setAddedItemId((prev) => (prev === item.id ? null : prev));
    }, 1300);
  };

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="py-20 lg:py-28 bg-[#F5F0E6] border-t border-[#231F1C]/8"
    >
      {/* Hidden file input for "Add Category Image" */}
      <input
        ref={categoryImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleCategoryImageFileChange}
        className="hidden"
        aria-label="Upload representative category image"
      />

      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14">
        {/* Compact Menu Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 border-b border-[#231F1C]/10">
          <div>
            <p className="text-xs text-[#7E5A3B] font-medium mb-2">
              The Shangaas Cafe · Complete Category Menu
            </p>
            <h2
              id="menu-heading"
              className="font-display text-3xl sm:text-5xl text-[#231F1C] font-normal tracking-tight"
            >
              Our Menu
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#6E655C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or dish..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#231F1C]/15 rounded-lg text-[#231F1C] focus:outline-none focus:border-[#7E5A3B]"
            />
          </div>
        </div>

        {/* MAIN MENU SCREEN: COMPACT CATEGORY GRID (Mobile: 2 per row, Desktop: 3–4 per row) */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredCategories.map((category, idx) => {
            const catItems = getItemsForCategory(category);
            const repImage = categoryImages[category];
            const isHovered = hoveredCategory === category;
            const isNonVeg = category.toLowerCase().includes('non-veg');
            const isRightColumnOnDesktop = (idx + 1) % 4 === 0;

            return (
              <div
                key={category}
                onMouseEnter={() => setHoveredCategory(category)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="relative group"
              >
                {/* CATEGORY CARD: [ONE REPRESENTATIVE IMAGE] + CATEGORY NAME + "View Menu →" */}
                <div
                  onClick={() => setActiveCategoryModal(category)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveCategoryModal(category);
                    }
                  }}
                  className="w-full text-left bg-[#FAF7F2] rounded-xl border border-[#231F1C]/10 overflow-hidden transition-all duration-200 hover:border-[#7E5A3B]/50 hover:shadow-[0_12px_32px_-12px_rgba(35,31,28,0.14)] cursor-pointer flex flex-col"
                >
                  {/* ONE REPRESENTATIVE IMAGE AREA */}
                  <div className="relative aspect-[4/3] w-full bg-[#EFE9DF] border-b border-[#231F1C]/8 overflow-hidden flex items-center justify-center">
                    {repImage ? (
                      <>
                        <img
                          src={repImage}
                          alt={category}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleTriggerCategoryImageUpload(e, category)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-[#FAF7F2]/95 text-[#231F1C] rounded-md shadow-xs hover:bg-white cursor-pointer"
                          >
                            Change Image
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveCategoryImage(e, category)}
                            aria-label={`Remove ${category} image`}
                            className="p-1 bg-[#231F1C]/80 text-[#FAF7F2] rounded-md hover:bg-[#231F1C] cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleTriggerCategoryImageUpload(e, category)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#5C544D] hover:text-[#231F1C] bg-[#FAF7F2]/90 hover:bg-white rounded-lg border border-[#231F1C]/12 transition-colors cursor-pointer shadow-2xs"
                      >
                        <ImagePlus className="w-3.5 h-3.5 text-[#7E5A3B]" />
                        <span>Add Category Image</span>
                      </button>
                    )}
                  </div>

                  {/* CATEGORY NAME & "View Menu →" */}
                  <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isNonVeg ? 'bg-[#9E3B33]' : 'bg-[#3B6E4C]'
                        }`}
                        aria-hidden="true"
                      />
                      <h3 className="font-display text-lg sm:text-xl text-[#231F1C] font-semibold tracking-tight uppercase leading-snug truncate">
                        {category}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#7E5A3B] font-medium pt-1">
                      <span>View Menu →</span>
                      <span className="font-mono-tabular text-[11px] text-[#6E655C]">
                        {catItems.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DESKTOP HOVER PREVIEW POPOVER: Shows all varieties & exact prices on mouse hover */}
                {isHovered && catItems.length > 0 && (
                  <div
                    onClick={() => setActiveCategoryModal(category)}
                    className={`hidden lg:block absolute z-30 top-full mt-2 w-80 bg-[#FAF7F2] rounded-xl border border-[#231F1C]/15 shadow-[0_24px_48px_-12px_rgba(35,31,28,0.25)] p-5 cursor-pointer ${
                      isRightColumnOnDesktop ? 'right-0' : 'left-0'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#231F1C]/12">
                      <h4 className="font-display text-lg font-semibold text-[#231F1C] uppercase tracking-tight">
                        {category}
                      </h4>
                      <span className="text-[11px] text-[#7E5A3B] font-medium">
                        Click to expand
                      </span>
                    </div>

                    <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {catItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-baseline justify-between gap-2 text-xs text-[#231F1C]"
                        >
                          <span className="font-medium shrink-0 max-w-[58%] truncate">
                            {item.name}
                          </span>
                          <span
                            className="flex-1 border-b border-dotted border-[#231F1C]/25 mx-1"
                            aria-hidden="true"
                          />
                          <span className="font-mono-tabular font-medium text-[#231F1C] shrink-0">
                            {item.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CLICK / TAP CATEGORY PANEL MODAL (Desktop Click & Mobile Tap) */}
      {activeCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231F1C]/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeCategoryModal} Menu`}
          onClick={() => setActiveCategoryModal(null)}
        >
          <div
            className="w-full max-w-xl bg-[#FAF7F2] rounded-2xl border border-[#231F1C]/15 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header with Optional Category Representative Image */}
            {categoryImages[activeCategoryModal] ? (
              <div className="relative h-44 w-full bg-[#EFE9DF] border-b border-[#231F1C]/10 shrink-0">
                <img
                  src={categoryImages[activeCategoryModal]}
                  alt={activeCategoryModal}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] text-[#E6D7C3] mb-0.5">
                      The Shangaas Cafe · Original Menu
                    </p>
                    <h3 className="font-display text-2xl sm:text-3xl text-[#FAF7F2] font-semibold uppercase tracking-tight">
                      {activeCategoryModal}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={(e) =>
                      handleTriggerCategoryImageUpload(e, activeCategoryModal)
                    }
                    className="px-3 py-1.5 text-xs font-medium bg-[#FAF7F2]/90 text-[#231F1C] rounded-lg hover:bg-white cursor-pointer whitespace-nowrap"
                  >
                    Change Category Image
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCategoryModal(null)}
                  aria-label="Close category menu"
                  className="absolute top-3.5 right-3.5 p-2 rounded-lg bg-[#231F1C]/70 text-[#FAF7F2] hover:bg-[#231F1C] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="px-6 py-5 bg-[#EFE9DF] border-b border-[#231F1C]/10 flex items-center justify-between gap-4 shrink-0">
                <div>
                  <p className="text-xs text-[#7E5A3B]">The Shangaas Cafe · Original Menu</p>
                  <h3 className="font-display text-2xl sm:text-3xl text-[#231F1C] font-semibold uppercase tracking-tight">
                    {activeCategoryModal}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) =>
                      handleTriggerCategoryImageUpload(e, activeCategoryModal)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#FAF7F2] text-[#231F1C] border border-[#231F1C]/15 rounded-lg hover:bg-white cursor-pointer whitespace-nowrap"
                  >
                    <ImagePlus className="w-3.5 h-3.5 text-[#7E5A3B]" />
                    <span>Add Category Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategoryModal(null)}
                    aria-label="Close category menu"
                    className="p-2 text-[#6E655C] hover:text-[#231F1C] rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Category Varieties & Exact Prices List */}
            <div className="p-6 overflow-y-auto flex-1">
              <ul className="divide-y divide-[#231F1C]/8">
                {getItemsForCategory(activeCategoryModal).map((item) => {
                  const isRecentlyAdded = addedItemId === item.id;
                  return (
                    <li
                      key={item.id}
                      className="py-3 first:pt-0 last:pb-0 flex items-baseline justify-between gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => handleOrderDish(item)}
                        className="text-left font-medium text-sm sm:text-[15px] text-[#231F1C] hover:text-[#7E5A3B] transition-colors cursor-pointer"
                      >
                        {item.name}
                      </button>

                      <span
                        className="flex-1 border-b border-dotted border-[#231F1C]/20 mx-1"
                        aria-hidden="true"
                      />

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono-tabular text-sm sm:text-[15px] font-medium text-[#231F1C]">
                          {item.price}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOrderDish(item)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-[#EFE9DF] text-[#231F1C] rounded-md hover:bg-[#231F1C] hover:text-[#FAF7F2] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {isRecentlyAdded ? (
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Added
                            </span>
                          ) : (
                            'Add'
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 bg-[#EFE9DF]/70 border-t border-[#231F1C]/10 flex items-center justify-between shrink-0">
              <span className="text-xs text-[#6E655C]">
                {getItemsForCategory(activeCategoryModal).length} varieties in{' '}
                {activeCategoryModal}
              </span>
              <button
                type="button"
                onClick={() => setActiveCategoryModal(null)}
                className="px-5 py-2 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
