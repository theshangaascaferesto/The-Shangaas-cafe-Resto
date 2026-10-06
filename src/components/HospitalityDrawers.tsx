import React, { useState } from 'react';
import { X, Minus, Plus, CheckCircle2, Calendar, Clock, Users, Trash2 } from 'lucide-react';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onClearOrder: () => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onClearOrder,
}) => {
  const [diningMode, setDiningMode] = useState<'table' | 'pickup'>('table');
  const [guestName, setGuestName] = useState('');
  const [tableOrPhone, setTableOrPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [orderReceipt, setOrderReceipt] = useState<{
    code: string;
    total: number;
    guestName: string;
    mode: string;
  } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.08) : 0;
  const total = subtotal + serviceFee;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const randomCode = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderReceipt({
      code: randomCode,
      total,
      guestName: guestName.trim() || 'Honored Guest',
      mode: diningMode === 'table' ? 'Table-Side Service' : 'Curated Sanctuary Pickup',
    });
    onClearOrder();
  };

  const handleResetAndClose = () => {
    setOrderReceipt(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#231F1C]/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Tasting Order Bag"
    >
      <div className="w-full max-w-md bg-[#FAF7F2] h-full flex flex-col justify-between border-l border-[#231F1C]/10 shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#231F1C]/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-[#231F1C]">Your Tasting Selection</h2>
            <p className="text-xs text-[#6E655C]">The Shangaas Cafe · Kitchen & Botanical Bar</p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label="Close order drawer"
            className="p-2 text-[#6E655C] hover:text-[#231F1C] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {orderReceipt ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#4A5D4E] mx-auto stroke-[1.5]" />
              <p className="text-xs text-[#7E5A3B] font-mono-tabular">
                ORDER #{orderReceipt.code} CONFIRMED
              </p>
              <h3 className="font-display text-3xl text-[#231F1C]">
                Preparing Your Selection
              </h3>
              <p className="text-sm text-[#5C544D] leading-relaxed max-w-xs mx-auto">
                Thank you, {orderReceipt.guestName}. Our culinary team has received your{' '}
                {orderReceipt.mode.toLowerCase()} request.
              </p>
              <div className="p-4 rounded-xl bg-[#EFE9DF] text-left text-xs space-y-1.5 border border-[#231F1C]/8">
                <div className="flex justify-between">
                  <span className="text-[#6E655C]">Service Mode</span>
                  <span className="text-[#231F1C] font-medium">{orderReceipt.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E655C]">Total Settled</span>
                  <span className="font-mono-tabular text-[#231F1C] font-medium">
                    ${orderReceipt.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E655C]">Estimated Readiness</span>
                  <span className="text-[#231F1C] font-medium">15–20 Minutes</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="mt-4 w-full py-3 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] transition-colors cursor-pointer"
              >
                Return to The Shangaas Cafe
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl text-[#231F1C] mb-2">
                Your tasting tray is empty
              </p>
              <p className="text-sm text-[#6E655C] max-w-xs mx-auto mb-6">
                Explore our 4 animated Signature Creations or seasonal dishes from the kitchen to begin.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-medium bg-[#EFE9DF] text-[#231F1C] rounded-lg hover:bg-[#E2D9C8] transition-colors cursor-pointer"
              >
                Explore Signature Collection
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dining Mode Selector */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#EFE9DF] rounded-lg">
                <button
                  type="button"
                  onClick={() => setDiningMode('table')}
                  className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    diningMode === 'table'
                      ? 'bg-[#FAF7F2] text-[#231F1C] shadow-xs'
                      : 'text-[#6E655C] hover:text-[#231F1C]'
                  }`}
                >
                  Table-Side Service
                </button>
                <button
                  type="button"
                  onClick={() => setDiningMode('pickup')}
                  className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    diningMode === 'pickup'
                      ? 'bg-[#FAF7F2] text-[#231F1C] shadow-xs'
                      : 'text-[#6E655C] hover:text-[#231F1C]'
                  }`}
                >
                  Curated Pickup
                </button>
              </div>

              {/* Itemized List */}
              <div className="divide-y divide-[#231F1C]/8">
                {items.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] text-[#7E5A3B]">{item.category}</p>
                      <h4 className="font-display text-lg text-[#231F1C] font-medium">
                        {item.name}
                      </h4>
                      {item.price > 0 && (
                        <p className="font-mono-tabular text-xs text-[#6E655C]">
                          ₹{item.price} each
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, -1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-[#231F1C]/15 text-[#231F1C] hover:bg-[#EFE9DF] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono-tabular text-xs w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-[#231F1C]/15 text-[#231F1C] hover:bg-[#EFE9DF] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guest Details Form */}
              <form id="tasting-order-form" onSubmit={handleCheckout} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs text-[#6E655C] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g., Clara Vance"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C] focus:outline-none focus:border-[#7E5A3B]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6E655C] mb-1">
                    {diningMode === 'table' ? 'Table Number or Seating Area' : 'Mobile Number for Pickup'}
                  </label>
                  <input
                    type="text"
                    required
                    value={tableOrPhone}
                    onChange={(e) => setTableOrPhone(e.target.value)}
                    placeholder={
                      diningMode === 'table' ? 'e.g., Table 08 · Courtyard' : 'e.g., +1 (555) 234-5678'
                    }
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C] focus:outline-none focus:border-[#7E5A3B]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6E655C] mb-1">
                    Dietary or Table-Side Presentation Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Allergies, pacing preferences..."
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C] focus:outline-none focus:border-[#7E5A3B]"
                  />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && !orderReceipt && (
          <div className="p-6 bg-[#EFE9DF]/70 border-t border-[#231F1C]/10 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6E655C]">
                <span>Subtotal</span>
                <span className="font-mono-tabular">${subtotal}</span>
              </div>
              <div className="flex justify-between text-[#6E655C]">
                <span>Hospitality & Preparation (8%)</span>
                <span className="font-mono-tabular">${serviceFee}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-[#231F1C] pt-2 border-t border-[#231F1C]/10">
                <span>Total</span>
                <span className="font-mono-tabular">${total}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClearOrder}
                aria-label="Clear all items"
                className="p-3 text-[#6E655C] hover:text-[#231F1C] border border-[#231F1C]/15 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="submit"
                form="tasting-order-form"
                className="flex-1 py-3 px-4 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] transition-colors cursor-pointer whitespace-nowrap"
              >
                Confirm Tasting Order · ${total}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDish?: string;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  preselectedDish,
}) => {
  const [date, setDate] = useState('2026-10-06');
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState('2 Guests');
  const [seatingArea, setSeatingArea] = useState('Main Travertine Sanctuary');
  const [signaturePref, setSignaturePref] = useState(preselectedDish || 'All 4 Signature Tasting Flight');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<{
    reference: string;
    name: string;
    date: string;
    time: string;
    guests: string;
    seatingArea: string;
    signaturePref: string;
  } | null>(null);

  React.useEffect(() => {
    if (preselectedDish) {
      setSignaturePref(preselectedDish);
    }
  }, [preselectedDish]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refCode = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
    setConfirmedBooking({
      reference: refCode,
      name: name.trim() || 'Guest',
      date,
      time,
      guests,
      seatingArea,
      signaturePref,
    });
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231F1C]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Reserve a Table at The Shangaas Cafe"
    >
      <div className="w-full max-w-xl bg-[#FAF7F2] rounded-2xl border border-[#231F1C]/12 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 bg-[#EFE9DF] border-b border-[#231F1C]/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#7E5A3B]">The Shangaas Cafe · Sanctuary Reservations</p>
            <h2 className="font-display text-2xl sm:text-3xl text-[#231F1C]">
              Reserve Your Table
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close reservation modal"
            className="p-2 text-[#6E655C] hover:text-[#231F1C] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {confirmedBooking ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#4A5D4E] mx-auto stroke-[1.5]" />
              <p className="font-mono-tabular text-xs text-[#7E5A3B]">
                RESERVATION #{confirmedBooking.reference} CONFIRMED
              </p>
              <h3 className="font-display text-3xl text-[#231F1C]">
                We Look Forward to Welcoming You, {confirmedBooking.name}
              </h3>
              <div className="p-5 rounded-xl bg-[#EFE9DF] text-left text-xs space-y-2 border border-[#231F1C]/8 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#6E655C]">Date & Seating</span>
                  <span className="font-mono-tabular text-[#231F1C] font-medium">
                    {confirmedBooking.date} · {confirmedBooking.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E655C]">Party Size</span>
                  <span className="text-[#231F1C] font-medium">{confirmedBooking.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E655C]">Space</span>
                  <span className="text-[#231F1C] font-medium">{confirmedBooking.seatingArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E655C]">Table-Side Signature Request</span>
                  <span className="text-[#7E5A3B] font-medium">{confirmedBooking.signaturePref}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[#6E655C] mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7E5A3B]" />
                    <span>Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono-tabular bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[#6E655C] mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#7E5A3B]" />
                    <span>Seating Time</span>
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono-tabular bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C]"
                  >
                    <option value="11:30">11:30 AM · Morning Sun</option>
                    <option value="13:00">01:00 PM · Midday</option>
                    <option value="16:30">04:30 PM · Golden Hour</option>
                    <option value="19:30">07:30 PM · Candlelight</option>
                    <option value="21:00">09:00 PM · Late Tasting</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[#6E655C] mb-1.5">
                    <Users className="w-3.5 h-3.5 text-[#7E5A3B]" />
                    <span>Party Size</span>
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C]"
                  >
                    <option value="2 Guests">2 Guests</option>
                    <option value="3 Guests">3 Guests</option>
                    <option value="4 Guests">4 Guests</option>
                    <option value="6 Guests">6 Guests · Chef Table</option>
                    <option value="8 Guests">8 Guests · Private Salon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-[#6E655C] mb-1.5">Sanctuary Zone</label>
                  <select
                    value={seatingArea}
                    onChange={(e) => setSeatingArea(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C]"
                  >
                    <option value="Main Travertine Sanctuary">Main Travertine Sanctuary</option>
                    <option value="Sunlit Linen Courtyard">Sunlit Linen Courtyard</option>
                    <option value="Fluted Limestone Pour Counter">Fluted Limestone Pour Counter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#6E655C] mb-1.5">
                    Pre-Reserve Signature Creation
                  </label>
                  <select
                    value={signaturePref}
                    onChange={(e) => setSignaturePref(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C]"
                  >
                    <option value="All 4 Signature Tasting Flight">All 4 Signature Tasting Flight</option>
                    <option value="Signature Mocktails">01. Signature Mocktails</option>
                    <option value="Signature Dish 2">02. Signature Dish 2</option>
                    <option value="Signature Dish 3">03. Signature Dish 3</option>
                    <option value="Signature Dish 4">04. Signature Dish 4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-[#6E655C] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g.,Julian Sterling"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6E655C] mb-1.5">Email or Telephone</label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#231F1C]/15 rounded-lg text-[#231F1C]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-xs font-medium text-[#6E655C] hover:text-[#231F1C] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-medium bg-[#231F1C] text-[#FAF7F2] rounded-lg hover:bg-[#3A332C] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Confirm Table Reservation
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
