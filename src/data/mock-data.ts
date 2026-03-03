export interface Seller {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  distance: string;
  photo: string;
  verified: boolean;
  isLive: boolean;
  isPremium: boolean;
  available: boolean;
  category: string;
  products: Product[];
  venmo?: string;
  followers: number;
}

export interface Product {
  name: string;
  price: string;
  available: boolean;
}

export interface FeedUpdate {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhoto: string;
  message: string;
  type: "restock" | "live" | "update";
  timestamp: string;
}

export const categories = [
  { id: "all", label: "All", emoji: "🌿" },
  { id: "eggs", label: "Eggs", emoji: "🥚" },
  { id: "bread", label: "Bread", emoji: "🍞" },
  { id: "produce", label: "Produce", emoji: "🥬" },
  { id: "meat", label: "Meat", emoji: "🥩" },
  { id: "honey", label: "Honey", emoji: "🍯" },
  { id: "dairy", label: "Dairy", emoji: "🧀" },
  { id: "stands", label: "Farm Stands", emoji: "🏡" },
];

export const mockSellers: Seller[] = [
  {
    id: "1",
    name: "Vital Pastures",
    tagline: "Eggs available today",
    bio: "We raise pasture-raised chickens on our 10-acre family farm. Fresh eggs daily, fed with organic grain and lots of sunshine.",
    distance: "1.2 mi",
    photo: "https://images.unsplash.com/photo-1569127959161-2b1297b2d9a6?w=400&h=300&fit=crop",
    verified: true,
    isLive: false,
    isPremium: true,
    available: true,
    category: "eggs",
    products: [
      { name: "Farm Fresh Eggs", price: "$7/dozen", available: true },
      { name: "Duck Eggs", price: "$9/dozen", available: false },
    ],
    venmo: "@vital-pastures",
    followers: 234,
  },
  {
    id: "2",
    name: "Hilltop Farm Stand",
    tagline: "Self serve stand open daily",
    bio: "Honor-system farm stand at the corner of Hilltop & Main. Fresh seasonal produce, eggs, and homemade preserves.",
    distance: "0.6 mi",
    photo: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop",
    verified: true,
    isLive: false,
    isPremium: false,
    available: true,
    category: "stands",
    products: [
      { name: "Seasonal Vegetables", price: "$5/bag", available: true },
      { name: "Strawberry Jam", price: "$8/jar", available: true },
    ],
    followers: 89,
  },
  {
    id: "3",
    name: "Grandma Mae's Sourdough",
    tagline: "Pickup Thursday",
    bio: "Handcrafted sourdough bread made with a 30-year-old starter. Every loaf is shaped by hand and baked in a wood-fired oven.",
    distance: "2.3 mi",
    photo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
    verified: true,
    isLive: true,
    isPremium: true,
    available: true,
    category: "bread",
    products: [
      { name: "Classic Sourdough", price: "$12/loaf", available: true },
      { name: "Rosemary Focaccia", price: "$10/loaf", available: true },
      { name: "Cinnamon Raisin", price: "$14/loaf", available: false },
    ],
    venmo: "@grandma-mae",
    followers: 512,
  },
  {
    id: "4",
    name: "Sweet Creek Apiary",
    tagline: "Raw wildflower honey",
    bio: "Small-batch raw honey from our apiaries in the creek valley. Unfiltered, unpasteurized, pure goodness.",
    distance: "3.1 mi",
    photo: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop",
    verified: false,
    isLive: false,
    isPremium: false,
    available: true,
    category: "honey",
    products: [
      { name: "Wildflower Honey", price: "$15/jar", available: true },
      { name: "Honeycomb", price: "$20/piece", available: true },
    ],
    followers: 156,
  },
  {
    id: "5",
    name: "Riverbend Ranch",
    tagline: "Grass-fed beef cuts",
    bio: "100% grass-fed, pasture-raised beef. We practice regenerative grazing on 200 acres along the Brazos River.",
    distance: "4.8 mi",
    photo: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop",
    verified: true,
    isLive: false,
    isPremium: true,
    available: false,
    category: "meat",
    products: [
      { name: "Ground Beef (1lb)", price: "$10/lb", available: false },
      { name: "Ribeye Steak", price: "$22/lb", available: false },
    ],
    venmo: "@riverbend-ranch",
    followers: 321,
  },
  {
    id: "6",
    name: "Sunny Meadow Dairy",
    tagline: "Fresh goat cheese weekly",
    bio: "Small herd of alpine goats producing the creamiest cheese in the county. Weekly batches, always fresh.",
    distance: "1.9 mi",
    photo: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop",
    verified: true,
    isLive: false,
    isPremium: false,
    available: true,
    category: "dairy",
    products: [
      { name: "Chèvre", price: "$8/log", available: true },
      { name: "Feta", price: "$10/block", available: true },
    ],
    followers: 198,
  },
];

export const mockFeedUpdates: FeedUpdate[] = [
  {
    id: "f1",
    sellerId: "1",
    sellerName: "Vital Pastures",
    sellerPhoto: "https://images.unsplash.com/photo-1569127959161-2b1297b2d9a6?w=80&h=80&fit=crop",
    message: "Restocked eggs — 24 dozen available!",
    type: "restock",
    timestamp: "2 hours ago",
  },
  {
    id: "f2",
    sellerId: "3",
    sellerName: "Grandma Mae's Sourdough",
    sellerPhoto: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&h=80&fit=crop",
    message: "is LIVE — folding sourdough 🍞",
    type: "live",
    timestamp: "12 min ago",
  },
  {
    id: "f3",
    sellerId: "2",
    sellerName: "Hilltop Farm Stand",
    sellerPhoto: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=80&h=80&fit=crop",
    message: "Updated inventory — new strawberry jam!",
    type: "update",
    timestamp: "5 hours ago",
  },
  {
    id: "f4",
    sellerId: "4",
    sellerName: "Sweet Creek Apiary",
    sellerPhoto: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=80&h=80&fit=crop",
    message: "New batch of honeycomb ready for pickup",
    type: "restock",
    timestamp: "1 day ago",
  },
];
