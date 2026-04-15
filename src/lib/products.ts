import { Product, Category, Style, Occasion } from "@/types/product";
import { products } from "@/data/products";

export function searchProducts(filters: {
  category?: Category;
  color?: string;
  style?: Style;
  occasion?: Occasion;
  minPrice?: number;
  maxPrice?: number;
  season?: string;
  gender?: string;
  query?: string;
}): Product[] {
  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.color && !product.colors.some((c) => c.toLowerCase().includes(filters.color!.toLowerCase()))) return false;
    if (filters.style && !product.styles.includes(filters.style)) return false;
    if (filters.occasion && !product.occasions.includes(filters.occasion)) return false;
    if (filters.minPrice && product.price < filters.minPrice) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    if (filters.season && !product.seasons.includes(filters.season as Product["seasons"][number])) return false;
    if (filters.gender && product.gender !== filters.gender && product.gender !== "unisex") return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = `${product.name} ${product.description} ${product.subcategory} ${product.material}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(limit = 8): Product[] {
  return products.slice(0, limit);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(0)}`;
}
