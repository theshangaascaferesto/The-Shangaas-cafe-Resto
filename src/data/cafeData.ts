import signatureAssets from './signatureAssets.json';

export const ORIGINAL_MENU_CATEGORIES = [
  'Mocktails',
  'Appetizers',
  'Non-Veg Appetizer',
  'Breakfast',
  'Veg Soup',
  'Non-Veg Soup',
  'Veg Noodles',
  'Non-Veg Noodles',
  "Veg Momo's",
  "Non-Veg Momo's",
  'Quick Bites',
  'Veg Tandoori',
  'Non-Veg Tandoori',
  'Veg Main Course',
  'Non-Veg Main Course',
  'Veg Thali',
  'Non-Veg Thali',
  'Choice of Rice',
  'Choice of Roti',
  'Salad',
  'Veg Burgers',
  'Non-Veg Burgers',
  'Breads & Sandwiches',
  'Non-Veg Breads & Sandwiches',
  'Pizza',
  'Pasta',
  'Veg Wraps',
  'Non-Veg Wraps',
  'Coffee',
  'Tea',
  'Kahwa',
  'Cold Beverages',
  'Shakes',
  'Raita Varieties',
  'Quenchers',
  'Dessert',
] as const;

export type OriginalMenuCategory = (typeof ORIGINAL_MENU_CATEGORIES)[number];

export interface SignatureItem {
  id: string;
  indexNumber: string;
  name: string;
  subtitle: string;
  description: string;
  tastingNotes: string[];
  price: number | string;
  servingNote: string;
  ctaLabel: string;
  /**
   * DEDICATED ANIMATED GIF SLOT:
   * Paste your animated GIF path here or upload directly on the website.
   */
  gifUrl: string;
  slotCodeName: string;
  motionTheme: 'botanical-pour' | 'velvet-steam' | 'golden-glaze' | 'flambe-infusion';
  accentTone: string;
}

export interface StaticMenuItem {
  id: string;
  name: string;
  category: OriginalMenuCategory;
  price: string;
}

export interface OriginalMenuCardPhoto {
  id: string;
  title: string;
  categoryGroup: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  aspect: 'wide' | 'standard';
  imageUrl: string;
}

export const INITIAL_SIGNATURE_ITEMS: SignatureItem[] = [
  {
    id: 'sig-1',
    indexNumber: '01',
    name: 'Beetroot & Spinach Momos',
    subtitle: '',
    description: '',
    tastingNotes: [],
    price: '',
    servingNote: 'Signature Collection · 01',
    ctaLabel: 'Select Beetroot & Spinach Momos',
    gifUrl: signatureAssets['sig-1'] || '',
    slotCodeName: '/src/assets/images/beetroot-spinach-momos.gif',
    motionTheme: 'velvet-steam',
    accentTone: '#C8A98E',
  },
  {
    id: 'sig-2',
    indexNumber: '02',
    name: 'Signature Mocktails',
    subtitle: '',
    description: '',
    tastingNotes: [],
    price: '',
    servingNote: 'Signature Collection · 02',
    ctaLabel: 'Select Signature Mocktails',
    gifUrl: signatureAssets['sig-2'] || '',
    slotCodeName: '/src/assets/images/signature-mocktails.gif',
    motionTheme: 'botanical-pour',
    accentTone: '#B89F82',
  },
  {
    id: 'sig-3',
    indexNumber: '03',
    name: 'Makki Ki Roti & Sarson Ka Saag',
    subtitle: '',
    description: '',
    tastingNotes: [],
    price: '',
    servingNote: 'Signature Collection · 03',
    ctaLabel: 'Select Makki Ki Roti & Sarson Ka Saag',
    gifUrl: signatureAssets['sig-3'] || '',
    slotCodeName: '/src/assets/images/makki-ki-roti-sarson-ka-saag.gif',
    motionTheme: 'golden-glaze',
    accentTone: '#9BA899',
  },
  {
    id: 'sig-4',
    indexNumber: '04',
    name: 'Himachali Siddu',
    subtitle: '',
    description: '',
    tastingNotes: [],
    price: '',
    servingNote: 'Signature Collection · 04',
    ctaLabel: 'Select Himachali Siddu',
    gifUrl: signatureAssets['sig-4'] || '',
    slotCodeName: '/src/assets/images/himachali-siddu.gif',
    motionTheme: 'flambe-infusion',
    accentTone: '#C29D86',
  },
];

export const INITIAL_STATIC_MENU_ITEMS: StaticMenuItem[] = [
  // 1. Mocktails
  { id: 'mk-1', category: 'Mocktails', name: 'Virgin Mojito', price: '₹149' },
  { id: 'mk-2', category: 'Mocktails', name: 'Green Apple Mojito', price: '₹159' },
  { id: 'mk-3', category: 'Mocktails', name: 'Watermelon Mojito', price: '₹159' },
  { id: 'mk-4', category: 'Mocktails', name: 'Blue Lagoon', price: '₹159' },
  { id: 'mk-5', category: 'Mocktails', name: 'Peach Iced Cooler', price: '₹159' },
  { id: 'mk-6', category: 'Mocktails', name: 'Strawberry Fizz', price: '₹169' },
  { id: 'mk-7', category: 'Mocktails', name: 'Fruit Punch', price: '₹189' },
  { id: 'mk-8', category: 'Mocktails', name: 'Fresh Lime Soda', price: '₹99' },

  // 2. Appetizers
  { id: 'ap-1', category: 'Appetizers', name: 'Chilli Potato', price: '₹169' },
  { id: 'ap-2', category: 'Appetizers', name: 'Honey Chilli Potato', price: '₹189' },
  { id: 'ap-3', category: 'Appetizers', name: 'Crispy Corn', price: '₹189' },
  { id: 'ap-4', category: 'Appetizers', name: 'Veg Spring Roll', price: '₹159' },
  { id: 'ap-5', category: 'Appetizers', name: 'Veg Manchurian (Dry / Gravy)', price: '₹189 / ₹199' },
  { id: 'ap-6', category: 'Appetizers', name: 'Chilli Paneer (Dry / Gravy)', price: '₹249 / ₹259' },
  { id: 'ap-7', category: 'Appetizers', name: 'Chilli Mushroom', price: '₹239' },
  { id: 'ap-8', category: 'Appetizers', name: 'Crispy Honey Cauliflower', price: '₹199' },
  { id: 'ap-9', category: 'Appetizers', name: 'Peanut Masala', price: '₹129' },

  // 3. Non-Veg Appetizer
  { id: 'nva-1', category: 'Non-Veg Appetizer', name: 'Chilli Chicken (Dry / Gravy)', price: '₹289 / ₹299' },
  { id: 'nva-2', category: 'Non-Veg Appetizer', name: 'Chicken Manchurian', price: '₹289' },
  { id: 'nva-3', category: 'Non-Veg Appetizer', name: 'Crispy Honey Chicken', price: '₹299' },
  { id: 'nva-4', category: 'Non-Veg Appetizer', name: 'Chicken 65', price: '₹289' },
  { id: 'nva-5', category: 'Non-Veg Appetizer', name: 'Drums of Heaven', price: '₹319' },
  { id: 'nva-6', category: 'Non-Veg Appetizer', name: 'Lemon Chicken', price: '₹299' },
  { id: 'nva-7', category: 'Non-Veg Appetizer', name: 'Garlic Chicken', price: '₹289' },
  { id: 'nva-8', category: 'Non-Veg Appetizer', name: 'Fish Finger', price: '₹349' },
  { id: 'nva-9', category: 'Non-Veg Appetizer', name: 'Chilli Fish', price: '₹359' },

  // 4. Breakfast
  { id: 'bf-1', category: 'Breakfast', name: 'Aloo Paratha', price: '₹99' },
  { id: 'bf-2', category: 'Breakfast', name: 'Gobi Paratha', price: '₹109' },
  { id: 'bf-3', category: 'Breakfast', name: 'Mix Veg Paratha', price: '₹119' },
  { id: 'bf-4', category: 'Breakfast', name: 'Paneer Paratha', price: '₹139' },
  { id: 'bf-5', category: 'Breakfast', name: 'Poori Bhaji', price: '₹129' },
  { id: 'bf-6', category: 'Breakfast', name: 'Chole Bhature', price: '₹149' },
  { id: 'bf-7', category: 'Breakfast', name: 'Poha', price: '₹109' },
  { id: 'bf-8', category: 'Breakfast', name: 'Butter Toast', price: '₹69' },
  { id: 'bf-9', category: 'Breakfast', name: 'Plain Omelette', price: '₹89' },
  { id: 'bf-10', category: 'Breakfast', name: 'Masala Omelette', price: '₹109' },
  { id: 'bf-11', category: 'Breakfast', name: 'Cheese Omelette', price: '₹139' },
  { id: 'bf-12', category: 'Breakfast', name: 'Boiled Eggs (2 Pcs)', price: '₹59' },

  // 5. Veg Soup
  { id: 'vs-1', category: 'Veg Soup', name: 'Tomato Soup', price: '₹109' },
  { id: 'vs-2', category: 'Veg Soup', name: 'Sweet Corn Veg Soup', price: '₹119' },
  { id: 'vs-3', category: 'Veg Soup', name: 'Hot & Sour Veg Soup', price: '₹119' },
  { id: 'vs-4', category: 'Veg Soup', name: 'Manchow Veg Soup', price: '₹129' },
  { id: 'vs-5', category: 'Veg Soup', name: 'Lemon Coriander Veg Soup', price: '₹119' },
  { id: 'vs-6', category: 'Veg Soup', name: 'Cream of Mushroom Soup', price: '₹139' },

  // 6. Non-Veg Soup
  { id: 'nvs-1', category: 'Non-Veg Soup', name: 'Chicken Clear Soup', price: '₹139' },
  { id: 'nvs-2', category: 'Non-Veg Soup', name: 'Chicken Sweet Corn Soup', price: '₹149' },
  { id: 'nvs-3', category: 'Non-Veg Soup', name: 'Chicken Hot & Sour Soup', price: '₹149' },
  { id: 'nvs-4', category: 'Non-Veg Soup', name: 'Chicken Manchow Soup', price: '₹159' },
  { id: 'nvs-5', category: 'Non-Veg Soup', name: 'Chicken Lemon Coriander Soup', price: '₹149' },
  { id: 'nvs-6', category: 'Non-Veg Soup', name: 'Cream of Chicken Soup', price: '₹169' },

  // 7. Veg Noodles (Exact from original menu)
  { id: 'vn-1', category: 'Veg Noodles', name: 'Veg Noodles', price: '₹149' },
  { id: 'vn-2', category: 'Veg Noodles', name: 'Hakka Noodles', price: '₹189' },
  { id: 'vn-3', category: 'Veg Noodles', name: 'Chilli Garlic Noodles', price: '₹199' },
  { id: 'vn-4', category: 'Veg Noodles', name: 'Thupka', price: '₹169' },
  { id: 'vn-5', category: 'Veg Noodles', name: 'Maggi', price: '₹59' },
  { id: 'vn-6', category: 'Veg Noodles', name: 'Veg Maggi', price: '₹89' },

  // 8. Non-Veg Noodles (Exact from original menu)
  { id: 'nvn-1', category: 'Non-Veg Noodles', name: 'Chicken Noodles', price: '₹199' },
  { id: 'nvn-2', category: 'Non-Veg Noodles', name: 'Chicken Hakka Noodles', price: '₹229' },
  { id: 'nvn-3', category: 'Non-Veg Noodles', name: 'Chicken Chilli Garlic Noodles', price: '₹259' },
  { id: 'nvn-4', category: 'Non-Veg Noodles', name: 'Chicken Thupka', price: '₹229' },
  { id: 'nvn-5', category: 'Non-Veg Noodles', name: 'Egg Maggi', price: '₹119' },
  { id: 'nvn-6', category: 'Non-Veg Noodles', name: 'Chicken Maggi', price: '₹169' },

  // 9. Veg Momo's
  { id: 'vm-1', category: "Veg Momo's", name: 'Veg Momos', price: 'Steam ₹129 | Fried ₹159' },
  { id: 'vm-2', category: "Veg Momo's", name: 'Paneer Momos', price: 'Steam ₹159 | Fried ₹189' },
  { id: 'vm-3', category: "Veg Momo's", name: 'Cheese Corn Momos', price: 'Steam ₹179 | Fried ₹209' },
  { id: 'vm-4', category: "Veg Momo's", name: 'Veg Kurkure Momos', price: '₹189' },
  { id: 'vm-5', category: "Veg Momo's", name: 'Veg Chilli Momos', price: '₹199' },
  { id: 'vm-6', category: "Veg Momo's", name: 'Veg Tandoori Momos', price: '₹209' },

  // 10. Non-Veg Momo's
  { id: 'nvm-1', category: "Non-Veg Momo's", name: 'Chicken Momos', price: 'Steam ₹189 | Fried ₹219' },
  { id: 'nvm-2', category: "Non-Veg Momo's", name: 'Chicken Cheese Momos', price: 'Steam ₹219 | Fried ₹249' },
  { id: 'nvm-3', category: "Non-Veg Momo's", name: 'Chicken Kurkure Momos', price: '₹239' },
  { id: 'nvm-4', category: "Non-Veg Momo's", name: 'Chicken Chilli Momos', price: '₹249' },
  { id: 'nvm-5', category: "Non-Veg Momo's", name: 'Chicken Tandoori Momos', price: '₹259' },
  { id: 'nvm-6', category: "Non-Veg Momo's", name: 'Mutton Momos', price: 'Steam ₹229 | Fried ₹259' },

  // 11. Quick Bites
  { id: 'qb-1', category: 'Quick Bites', name: 'French Fries', price: '₹109' },
  { id: 'qb-2', category: 'Quick Bites', name: 'Peri Peri Fries', price: '₹129' },
  { id: 'qb-3', category: 'Quick Bites', name: 'Cheesy Fries', price: '₹159' },
  { id: 'qb-4', category: 'Quick Bites', name: 'Garlic Bread', price: '₹119' },
  { id: 'qb-5', category: 'Quick Bites', name: 'Cheese Garlic Bread', price: '₹149' },
  { id: 'qb-6', category: 'Quick Bites', name: 'Veg Pakora', price: '₹139' },
  { id: 'qb-7', category: 'Quick Bites', name: 'Paneer Pakora', price: '₹189' },

  // 12. Veg Tandoori
  { id: 'vt-1', category: 'Veg Tandoori', name: 'Paneer Tikka', price: '₹269' },
  { id: 'vt-2', category: 'Veg Tandoori', name: 'Paneer Malai Tikka', price: '₹289' },
  { id: 'vt-3', category: 'Veg Tandoori', name: 'Paneer Achari Tikka', price: '₹269' },
  { id: 'vt-4', category: 'Veg Tandoori', name: 'Tandoori Mushroom', price: '₹249' },
  { id: 'vt-5', category: 'Veg Tandoori', name: 'Tandoori Soya Chaap', price: '₹219' },
  { id: 'vt-6', category: 'Veg Tandoori', name: 'Malai Soya Chaap', price: '₹239' },
  { id: 'vt-7', category: 'Veg Tandoori', name: 'Veg Seekh Kebab', price: '₹219' },
  { id: 'vt-8', category: 'Veg Tandoori', name: 'Hara Bhara Kebab', price: '₹229' },

  // 13. Non-Veg Tandoori
  { id: 'nvt-1', category: 'Non-Veg Tandoori', name: 'Tandoori Chicken', price: '₹329 / ₹499' },
  { id: 'nvt-2', category: 'Non-Veg Tandoori', name: 'Afghani Chicken', price: '₹349 / ₹529' },
  { id: 'nvt-3', category: 'Non-Veg Tandoori', name: 'Chicken Tikka', price: '₹319' },
  { id: 'nvt-4', category: 'Non-Veg Tandoori', name: 'Chicken Malai Tikka', price: '₹339' },
  { id: 'nvt-5', category: 'Non-Veg Tandoori', name: 'Chicken Kali Mirch Tikka', price: '₹329' },
  { id: 'nvt-6', category: 'Non-Veg Tandoori', name: 'Chicken Seekh Kebab', price: '₹299' },
  { id: 'nvt-7', category: 'Non-Veg Tandoori', name: 'Mutton Seekh Kebab', price: '₹349' },
  { id: 'nvt-8', category: 'Non-Veg Tandoori', name: 'Fish Tikka', price: '₹369' },

  // 14. Veg Main Course
  { id: 'vmc-1', category: 'Veg Main Course', name: 'Dal Tadka', price: '₹169' },
  { id: 'vmc-2', category: 'Veg Main Course', name: 'Dal Makhani', price: '₹219' },
  { id: 'vmc-3', category: 'Veg Main Course', name: 'Mix Veg', price: '₹199' },
  { id: 'vmc-4', category: 'Veg Main Course', name: 'Jeera Aloo', price: '₹149' },
  { id: 'vmc-5', category: 'Veg Main Course', name: 'Aloo Gobi', price: '₹169' },
  { id: 'vmc-6', category: 'Veg Main Course', name: 'Matar Mushroom', price: '₹229' },
  { id: 'vmc-7', category: 'Veg Main Course', name: 'Kadhai Mushroom', price: '₹249' },
  { id: 'vmc-8', category: 'Veg Main Course', name: 'Shahi Paneer', price: '₹269' },
  { id: 'vmc-9', category: 'Veg Main Course', name: 'Kadhai Paneer', price: '₹279' },
  { id: 'vmc-10', category: 'Veg Main Course', name: 'Paneer Butter Masala', price: '₹279' },
  { id: 'vmc-11', category: 'Veg Main Course', name: 'Matar Paneer', price: '₹249' },
  { id: 'vmc-12', category: 'Veg Main Course', name: 'Palak Paneer', price: '₹259' },
  { id: 'vmc-13', category: 'Veg Main Course', name: 'Paneer Lababdar', price: '₹289' },
  { id: 'vmc-14', category: 'Veg Main Course', name: 'Paneer Bhurji', price: '₹269' },
  { id: 'vmc-15', category: 'Veg Main Course', name: 'Malai Kofta', price: '₹269' },
  { id: 'vmc-16', category: 'Veg Main Course', name: 'Chana Masala', price: '₹189' },

  // 15. Non-Veg Main Course
  { id: 'nvmc-1', category: 'Non-Veg Main Course', name: 'Butter Chicken', price: '₹329 / ₹499' },
  { id: 'nvmc-2', category: 'Non-Veg Main Course', name: 'Kadhai Chicken', price: '₹329 / ₹499' },
  { id: 'nvmc-3', category: 'Non-Veg Main Course', name: 'Chicken Curry Home Style', price: '₹299 / ₹469' },
  { id: 'nvmc-4', category: 'Non-Veg Main Course', name: 'Chicken Masala', price: '₹319 / ₹489' },
  { id: 'nvmc-5', category: 'Non-Veg Main Course', name: 'Chicken Rara', price: '₹349 / ₹529' },
  { id: 'nvmc-6', category: 'Non-Veg Main Course', name: 'Chicken Tikka Masala', price: '₹349' },
  { id: 'nvmc-7', category: 'Non-Veg Main Course', name: 'Chicken Kali Mirch', price: '₹329 / ₹499' },
  { id: 'nvmc-8', category: 'Non-Veg Main Course', name: 'Egg Curry', price: '₹179' },
  { id: 'nvmc-9', category: 'Non-Veg Main Course', name: 'Egg Bhurji', price: '₹129' },
  { id: 'nvmc-10', category: 'Non-Veg Main Course', name: 'Mutton Rogan Josh', price: '₹429' },
  { id: 'nvmc-11', category: 'Non-Veg Main Course', name: 'Mutton Curry', price: '₹419' },
  { id: 'nvmc-12', category: 'Non-Veg Main Course', name: 'Rara Mutton', price: '₹449' },

  // 16. Veg Thali
  { id: 'vth-1', category: 'Veg Thali', name: 'Regular Veg Thali', price: '₹199' },
  { id: 'vth-2', category: 'Veg Thali', name: 'Special Veg Thali', price: '₹269' },

  // 17. Non-Veg Thali
  { id: 'nvth-1', category: 'Non-Veg Thali', name: 'Chicken Thali', price: '₹279' },
  { id: 'nvth-2', category: 'Non-Veg Thali', name: 'Special Non-Veg Thali', price: '₹349' },

  // 18. Choice of Rice
  { id: 'cr-1', category: 'Choice of Rice', name: 'Steamed Rice', price: '₹109' },
  { id: 'cr-2', category: 'Choice of Rice', name: 'Jeera Rice', price: '₹129' },
  { id: 'cr-3', category: 'Choice of Rice', name: 'Veg Pulao', price: '₹159' },
  { id: 'cr-4', category: 'Choice of Rice', name: 'Matar Pulao', price: '₹149' },
  { id: 'cr-5', category: 'Choice of Rice', name: 'Veg Fried Rice', price: '₹169' },
  { id: 'cr-6', category: 'Choice of Rice', name: 'Egg Fried Rice', price: '₹189' },
  { id: 'cr-7', category: 'Choice of Rice', name: 'Chicken Fried Rice', price: '₹219' },
  { id: 'cr-8', category: 'Choice of Rice', name: 'Veg Biryani', price: '₹219' },
  { id: 'cr-9', category: 'Choice of Rice', name: 'Egg Biryani', price: '₹229' },
  { id: 'cr-10', category: 'Choice of Rice', name: 'Chicken Biryani', price: '₹289' },
  { id: 'cr-11', category: 'Choice of Rice', name: 'Mutton Biryani', price: '₹349' },

  // 19. Choice of Roti
  { id: 'rot-1', category: 'Choice of Roti', name: 'Tandoori Roti', price: '₹19' },
  { id: 'rot-2', category: 'Choice of Roti', name: 'Tandoori Butter Roti', price: '₹25' },
  { id: 'rot-3', category: 'Choice of Roti', name: 'Tawa Roti', price: '₹19' },
  { id: 'rot-4', category: 'Choice of Roti', name: 'Tawa Butter Roti', price: '₹25' },
  { id: 'rot-5', category: 'Choice of Roti', name: 'Plain Naan', price: '₹45' },
  { id: 'rot-6', category: 'Choice of Roti', name: 'Butter Naan', price: '₹55' },
  { id: 'rot-7', category: 'Choice of Roti', name: 'Garlic Naan', price: '₹69' },
  { id: 'rot-8', category: 'Choice of Roti', name: 'Cheese Garlic Naan', price: '₹99' },
  { id: 'rot-9', category: 'Choice of Roti', name: 'Stuff Naan', price: '₹79' },
  { id: 'rot-10', category: 'Choice of Roti', name: 'Lachha Paratha', price: '₹49' },
  { id: 'rot-11', category: 'Choice of Roti', name: 'Missi Roti', price: '₹39' },

  // 20. Salad
  { id: 'sal-1', category: 'Salad', name: 'Onion Salad', price: '₹49' },
  { id: 'sal-2', category: 'Salad', name: 'Green Salad', price: '₹79' },
  { id: 'sal-3', category: 'Salad', name: 'Kachumber Salad', price: '₹89' },
  { id: 'sal-4', category: 'Salad', name: 'Russian Salad', price: '₹149' },

  // 21. Veg Burgers
  { id: 'vb-1', category: 'Veg Burgers', name: 'Aloo Tikki Burger', price: '₹79' },
  { id: 'vb-2', category: 'Veg Burgers', name: 'Veg Burger', price: '₹99' },
  { id: 'vb-3', category: 'Veg Burgers', name: 'Veg Cheese Burger', price: '₹119' },
  { id: 'vb-4', category: 'Veg Burgers', name: 'Crispy Paneer Burger', price: '₹149' },
  { id: 'vb-5', category: 'Veg Burgers', name: 'Double Decker Veg Burger', price: '₹159' },

  // 22. Non-Veg Burgers
  { id: 'nvb-1', category: 'Non-Veg Burgers', name: 'Egg Burger', price: '₹99' },
  { id: 'nvb-2', category: 'Non-Veg Burgers', name: 'Chicken Burger', price: '₹139' },
  { id: 'nvb-3', category: 'Non-Veg Burgers', name: 'Chicken Cheese Burger', price: '₹159' },
  { id: 'nvb-4', category: 'Non-Veg Burgers', name: 'Crispy Chicken Burger', price: '₹179' },

  // 23. Breads & Sandwiches
  { id: 'bs-1', category: 'Breads & Sandwiches', name: 'Veg Sandwich', price: '₹99' },
  { id: 'bs-2', category: 'Breads & Sandwiches', name: 'Veg Grilled Sandwich', price: '₹129' },
  { id: 'bs-3', category: 'Breads & Sandwiches', name: 'Veg Cheese Grilled Sandwich', price: '₹149' },
  { id: 'bs-4', category: 'Breads & Sandwiches', name: 'Paneer Tikka Sandwich', price: '₹169' },
  { id: 'bs-5', category: 'Breads & Sandwiches', name: 'Corn & Cheese Sandwich', price: '₹159' },
  { id: 'bs-6', category: 'Breads & Sandwiches', name: 'Veg Club Sandwich', price: '₹179' },

  // 24. Non-Veg Breads & Sandwiches
  { id: 'nvbs-1', category: 'Non-Veg Breads & Sandwiches', name: 'Egg Sandwich', price: '₹119' },
  { id: 'nvbs-2', category: 'Non-Veg Breads & Sandwiches', name: 'Chicken Grilled Sandwich', price: '₹169' },
  { id: 'nvbs-3', category: 'Non-Veg Breads & Sandwiches', name: 'Chicken Cheese Grilled Sandwich', price: '₹189' },
  { id: 'nvbs-4', category: 'Non-Veg Breads & Sandwiches', name: 'Chicken Tikka Sandwich', price: '₹199' },
  { id: 'nvbs-5', category: 'Non-Veg Breads & Sandwiches', name: 'Non-Veg Club Sandwich', price: '₹219' },

  // 25. Pizza
  { id: 'pz-1', category: 'Pizza', name: 'Margherita Pizza', price: '₹199' },
  { id: 'pz-2', category: 'Pizza', name: 'Onion & Capsicum Pizza', price: '₹219' },
  { id: 'pz-3', category: 'Pizza', name: 'Sweet Corn & Cheese Pizza', price: '₹229' },
  { id: 'pz-4', category: 'Pizza', name: 'Farm House Veg Pizza', price: '₹259' },
  { id: 'pz-5', category: 'Pizza', name: 'Paneer Tikka Pizza', price: '₹279' },
  { id: 'pz-6', category: 'Pizza', name: 'Mushroom & Olive Pizza', price: '₹269' },
  { id: 'pz-7', category: 'Pizza', name: 'Chicken Tikka Pizza', price: '₹319' },
  { id: 'pz-8', category: 'Pizza', name: 'BBQ Chicken Pizza', price: '₹329' },

  // 26. Pasta
  { id: 'ps-1', category: 'Pasta', name: 'Red Sauce Arrabbiata Pasta (Veg / Chicken)', price: '₹199 / ₹249' },
  { id: 'ps-2', category: 'Pasta', name: 'White Sauce Alfredo Pasta (Veg / Chicken)', price: '₹219 / ₹269' },
  { id: 'ps-3', category: 'Pasta', name: 'Mix Pink Sauce Pasta (Veg / Chicken)', price: '₹229 / ₹279' },
  { id: 'ps-4', category: 'Pasta', name: 'Baked Cheese Pasta', price: '₹249' },

  // 27. Veg Wraps
  { id: 'vw-1', category: 'Veg Wraps', name: 'Veg Roll', price: '₹119' },
  { id: 'vw-2', category: 'Veg Wraps', name: 'Aloo Tikki Wrap', price: '₹109' },
  { id: 'vw-3', category: 'Veg Wraps', name: 'Paneer Tikka Roll', price: '₹159' },
  { id: 'vw-4', category: 'Veg Wraps', name: 'Chilli Paneer Wrap', price: '₹169' },
  { id: 'vw-5', category: 'Veg Wraps', name: 'Soya Chaap Roll', price: '₹149' },

  // 28. Non-Veg Wraps
  { id: 'nvw-1', category: 'Non-Veg Wraps', name: 'Egg Roll', price: '₹119' },
  { id: 'nvw-2', category: 'Non-Veg Wraps', name: 'Double Egg Roll', price: '₹139' },
  { id: 'nvw-3', category: 'Non-Veg Wraps', name: 'Chicken Roll', price: '₹179' },
  { id: 'nvw-4', category: 'Non-Veg Wraps', name: 'Chicken Tikka Wrap', price: '₹199' },
  { id: 'nvw-5', category: 'Non-Veg Wraps', name: 'Egg Chicken Roll', price: '₹199' },
  { id: 'nvw-6', category: 'Non-Veg Wraps', name: 'Mutton Seekh Roll', price: '₹229' },

  // 29. Coffee
  { id: 'cf-1', category: 'Coffee', name: 'Hot Coffee', price: '₹69' },
  { id: 'cf-2', category: 'Coffee', name: 'Black Coffee / Americano', price: '₹89' },
  { id: 'cf-3', category: 'Coffee', name: 'Cappuccino', price: '₹119' },
  { id: 'cf-4', category: 'Coffee', name: 'Cafe Latte', price: '₹129' },
  { id: 'cf-5', category: 'Coffee', name: 'Cafe Mocha', price: '₹139' },
  { id: 'cf-6', category: 'Coffee', name: 'Classic Cold Coffee', price: '₹139' },
  { id: 'cf-7', category: 'Coffee', name: 'Cold Coffee with Ice Cream', price: '₹169' },

  // 30. Tea
  { id: 'tea-1', category: 'Tea', name: 'Regular Tea', price: '₹29' },
  { id: 'tea-2', category: 'Tea', name: 'Masala Tea', price: '₹39' },
  { id: 'tea-3', category: 'Tea', name: 'Ginger Honey Lemon Tea', price: '₹59' },
  { id: 'tea-4', category: 'Tea', name: 'Green Tea', price: '₹49' },
  { id: 'tea-5', category: 'Tea', name: 'Black Tea', price: '₹29' },
  { id: 'tea-6', category: 'Tea', name: 'Kullad Chai', price: '₹49' },

  // 31. Kahwa
  { id: 'kh-1', category: 'Kahwa', name: 'Traditional Kashmiri Kahwa', price: '₹89' },
  { id: 'kh-2', category: 'Kahwa', name: 'Honey Lemon Kahwa', price: '₹99' },
  { id: 'kh-3', category: 'Kahwa', name: 'Almond Saffron Kahwa', price: '₹119' },

  // 32. Cold Beverages
  { id: 'cb-1', category: 'Cold Beverages', name: 'Mineral Water', price: '₹20' },
  { id: 'cb-2', category: 'Cold Beverages', name: 'Soft Drink', price: '₹40' },
  { id: 'cb-3', category: 'Cold Beverages', name: 'Fresh Lime Water', price: '₹69' },
  { id: 'cb-4', category: 'Cold Beverages', name: 'Masala Shikanji', price: '₹79' },
  { id: 'cb-5', category: 'Cold Beverages', name: 'Sweet / Salted Lassi', price: '₹89' },
  { id: 'cb-6', category: 'Cold Beverages', name: 'Buttermilk (Chaas)', price: '₹59' },

  // 33. Shakes
  { id: 'sh-1', category: 'Shakes', name: 'Vanilla Shake', price: '₹139' },
  { id: 'sh-2', category: 'Shakes', name: 'Strawberry Shake', price: '₹149' },
  { id: 'sh-3', category: 'Shakes', name: 'Chocolate Shake', price: '₹159' },
  { id: 'sh-4', category: 'Shakes', name: 'Oreo Shake', price: '₹169' },
  { id: 'sh-5', category: 'Shakes', name: 'KitKat Shake', price: '₹169' },
  { id: 'sh-6', category: 'Shakes', name: 'Butterscotch Shake', price: '₹149' },
  { id: 'sh-7', category: 'Shakes', name: 'Mango Shake', price: '₹149' },
  { id: 'sh-8', category: 'Shakes', name: 'Banana Shake', price: '₹129' },

  // 34. Raita Varieties
  { id: 'rt-1', category: 'Raita Varieties', name: 'Plain Curd', price: '₹69' },
  { id: 'rt-2', category: 'Raita Varieties', name: 'Boondi Raita', price: '₹89' },
  { id: 'rt-3', category: 'Raita Varieties', name: 'Mix Veg Raita', price: '₹99' },
  { id: 'rt-4', category: 'Raita Varieties', name: 'Pineapple Raita', price: '₹129' },

  // 35. Quenchers
  { id: 'qn-1', category: 'Quenchers', name: 'Lemon Iced Tea', price: '₹119' },
  { id: 'qn-2', category: 'Quenchers', name: 'Peach Iced Tea', price: '₹129' },
  { id: 'qn-3', category: 'Quenchers', name: 'Watermelon Quencher', price: '₹139' },
  { id: 'qn-4', category: 'Quenchers', name: 'Mint Mojito Quencher', price: '₹129' },
  { id: 'qn-5', category: 'Quenchers', name: 'Kala Khatta Quencher', price: '₹129' },

  // 36. Dessert
  { id: 'ds-1', category: 'Dessert', name: 'Gulab Jamun (2 Pcs)', price: '₹79' },
  { id: 'ds-2', category: 'Dessert', name: 'Hot Gulab Jamun with Ice Cream', price: '₹119' },
  { id: 'ds-3', category: 'Dessert', name: 'Vanilla Ice Cream', price: '₹79' },
  { id: 'ds-4', category: 'Dessert', name: 'Chocolate Ice Cream', price: '₹89' },
  { id: 'ds-5', category: 'Dessert', name: 'Hot Chocolate Brownie with Ice Cream', price: '₹189' },
];

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Gallery Photo 01',
    caption: '',
    category: 'The Shangaas Cafe',
    aspect: 'wide',
    imageUrl: '',
  },
  {
    id: 'gal-2',
    title: 'Gallery Photo 02',
    caption: '',
    category: 'The Shangaas Cafe',
    aspect: 'standard',
    imageUrl: '',
  },
  {
    id: 'gal-3',
    title: 'Gallery Photo 03',
    caption: '',
    category: 'The Shangaas Cafe',
    aspect: 'standard',
    imageUrl: '',
  },
  {
    id: 'gal-4',
    title: 'Gallery Photo 04',
    caption: '',
    category: 'The Shangaas Cafe',
    aspect: 'standard',
    imageUrl: '',
  },
  {
    id: 'gal-5',
    title: 'Gallery Photo 05',
    caption: '',
    category: 'The Shangaas Cafe',
    aspect: 'standard',
    imageUrl: '',
  },
  {
    id: 'gal-6',
    title: 'Gallery Photo 06',
    caption: '',
    category: 'The Shangaas Cafe',
    aspect: 'wide',
    imageUrl: '',
  },
];
