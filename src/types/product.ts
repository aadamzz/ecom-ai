export type Category = "tops" | "bottoms" | "shoes" | "outerwear" | "accessories";

export type Style = "casual" | "elegant" | "smart-casual" | "streetwear" | "sporty" | "minimal";

export type Occasion = "everyday" | "wedding" | "date" | "office" | "party" | "vacation";

export type Season = "spring" | "summer" | "autumn" | "winter";

export type Gender = "men" | "women" | "unisex";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  category: Category;
  subcategory: string;
  colors: string[];
  sizes: string[];
  styles: Style[];
  occasions: Occasion[];
  seasons: Season[];
  gender: Gender;
  images: string[];
  material: string;
  inStock: boolean;
}

export interface Outfit {
  id: string;
  name: string;
  slug: string;
  description: string;
  occasion: Occasion;
  style: Style;
  items: Product[];
  totalPrice: number;
  coverImage?: string;
}
