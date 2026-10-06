import React, { useState, useEffect } from 'react';
import { Star, Plus, Pencil, Trash2, X } from 'lucide-react';

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
}

const REVIEWS_STORAGE_KEY = 'shangaas_cafe_real_reviews_v1';

export const ReviewsSection: React.FC = () => {
  // Starts completely empty — zero fake or invented reviews
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setCustomerName('');
    setRating(5);
    setReviewText('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (review: CustomerReview) => {
    setEditingId(review.id);
    setCustomerName(review.customerName);
    setRating(review.rating);
    setReviewText(review.reviewText);
    setIsFormOpen(true);
  };

  const handleRemove = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !reviewText.trim()) return;

    if (editingId) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                customerName: customerName.trim(),
                rating,
                reviewText: reviewText.trim(),
              }
            : r
        )
      );
    } else {
      setReviews((prev) => [
        ...prev,
        {
          id: `rev-${Date.now()}`,
          customerName: customerName.trim(),
          rating,
          reviewText: reviewText.trim(),
        },
      ]);
    }

    setCustomerName('');
    setRating(5);
    setReviewText('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="py-24 lg:py-32 bg-[#FAF7F2] border-t border-[#231F1C]/8"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs text-[#7E5A3B] font-medium mb-3">
              Guest Reviews · The Shangaas Cafe
            </p>
            <h2
              id="reviews-heading"
              className="font-display text-3xl sm:text-5xl text-[#231F1C] font-normal tracking-tight"
            >
              Real experiences from our guests.
            </h2>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Review</span>
          </button>
        </div>

        {/* Add / Edit Review Form */}
        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="mb-12 p-6 sm:p-8 rounded-2xl bg-[#EFE9DF] border border-[#231F1C]/12 space-y-4 max-w-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl text-[#231F1C]">
                {editingId ? 'Edit Guest Review' : 'Add Guest Review'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                aria-label="Close review form"
                className="p-1.5 text-[#6E655C] hover:text-[#231F1C] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6E655C] mb-1.5">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#231F1C]/15 rounded-lg text-[#231F1C] focus:outline-none focus:border-[#7E5A3B]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#6E655C] mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-1.5 py-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} out of 5 stars`}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'fill-[#7E5A3B] text-[#7E5A3B]'
                            : 'text-[#231F1C]/25'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-mono-tabular text-xs text-[#6E655C]">
                    {rating} / 5
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#6E655C] mb-1.5">
                Review Text
              </label>
              <textarea
                rows={3}
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Enter customer review..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#231F1C]/15 rounded-lg text-[#231F1C] focus:outline-none focus:border-[#7E5A3B]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#6E655C] hover:text-[#231F1C] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] transition-colors cursor-pointer"
              >
                {editingId ? 'Save Changes' : 'Save Review'}
              </button>
            </div>
          </form>
        )}

        {/* Reviews Display Area */}
        {reviews.length === 0 ? (
          <div className="py-14 px-6 rounded-2xl bg-[#EFE9DF]/50 border border-[#231F1C]/10 text-center">
            <p className="font-display text-2xl sm:text-3xl text-[#231F1C] mb-2">
              Real experiences from our guests.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#231F1C] bg-[#FAF7F2] border border-[#231F1C]/15 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#7E5A3B]" />
              <span>Add First Guest Review</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="p-6 rounded-xl bg-[#EFE9DF]/60 border border-[#231F1C]/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-[#7E5A3B] text-[#7E5A3B]'
                              : 'text-[#231F1C]/20'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(review)}
                        aria-label={`Edit review by ${review.customerName}`}
                        className="p-1.5 text-[#6E655C] hover:text-[#231F1C] cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(review.id)}
                        aria-label={`Remove review by ${review.customerName}`}
                        className="p-1.5 text-[#6E655C] hover:text-[#9E3B33] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm sm:text-[15px] text-[#231F1C] leading-relaxed mb-6">
                    “{review.reviewText}”
                  </p>
                </div>

                <footer className="pt-3 border-t border-[#231F1C]/8">
                  <span className="font-display text-lg font-medium text-[#231F1C]">
                    {review.customerName}
                  </span>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
