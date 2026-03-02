export interface Product {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly price: number;
  readonly inStock: boolean;
  readonly createdAt: Date;
}

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Tools'] as const;
const STATUSES = ['Active', 'Discontinued', 'Draft'] as const;

const PRODUCT_NAMES: readonly string[] = [
  'Wireless Mouse',
  'USB-C Hub',
  'Mechanical Keyboard',
  'Monitor Stand',
  'Webcam HD',
  'Desk Lamp',
  'Noise-Cancelling Headphones',
  'Portable SSD',
  'Bluetooth Speaker',
  'Laptop Sleeve',
  'Cable Organizer',
  'Screen Protector',
  'Phone Mount',
  'Tablet Stand',
  'Ethernet Adapter',
  'Power Strip',
  'LED Strip Lights',
  'Desk Mat',
  'Ergonomic Chair Pad',
  'Wrist Rest',
  'Cotton T-Shirt',
  'Denim Jacket',
  'Running Shoes',
  'Wool Socks',
  'Baseball Cap',
  'Leather Belt',
  'Silk Scarf',
  'Rain Jacket',
  'Cargo Pants',
  'Polo Shirt',
  'Linen Shorts',
  'Fleece Hoodie',
  'Canvas Tote',
  'Beanie Hat',
  'Dress Shirt',
  'Swim Trunks',
  'Organic Coffee',
  'Green Tea',
  'Dark Chocolate',
  'Trail Mix',
  'Olive Oil',
  'Honey Jar',
  'Dried Mango',
  'Granola Bars',
  'Protein Powder',
  'Coconut Water',
  'Almond Butter',
  'Rice Crackers',
  'Dried Pasta',
  'Canned Tomatoes',
  'Maple Syrup',
  'Hot Sauce',
  'Cordless Drill',
  'Tape Measure',
  'Screwdriver Set',
  'Utility Knife',
  'Socket Wrench',
  'Level Tool',
  'Pliers Set',
  'Hammer',
  'Allen Key Set',
  'Stud Finder',
  'Wire Stripper',
  'Clamp Set',
  'Sandpaper Pack',
  'Safety Goggles',
  'Work Gloves',
  'Tool Belt',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateProducts(count = 200): Product[] {
  const random = seededRandom(42);
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const nameIndex = i % PRODUCT_NAMES.length;
    const suffix = i >= PRODUCT_NAMES.length ? ` v${Math.floor(i / PRODUCT_NAMES.length) + 1}` : '';
    const baseDate = new Date(2024, 0, 1);
    const offsetDays = Math.floor(random() * 365);
    products.push({
      id: i + 1,
      name: PRODUCT_NAMES[nameIndex] + suffix,
      category: CATEGORIES[Math.floor(random() * CATEGORIES.length)],
      status: STATUSES[Math.floor(random() * STATUSES.length)],
      price: Math.round(random() * 500 * 100) / 100 + 0.99,
      inStock: random() > 0.2,
      createdAt: new Date(baseDate.getTime() + offsetDays * 86_400_000),
    });
  }

  return products;
}

export const MOCK_PRODUCTS: readonly Product[] = generateProducts();
