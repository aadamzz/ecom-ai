"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/products";
import { useWishlist } from "@/store/wishlistStore";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.salePrice! / product.price) * 100)
    : 0;
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg hover:border-foreground/20"
    >
      {/* Product image */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-6xl">
            {product.category === "tops" && "👕"}
            {product.category === "bottoms" && "👖"}
            {product.category === "shoes" && "👟"}
            {product.category === "outerwear" && "🧥"}
            {product.category === "accessories" && "⌚"}
          </div>
        )}
        {hasDiscount && (
          <Badge className="absolute left-2 top-2 bg-red-600 text-white">
            -{discountPercent}%
          </Badge>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product.id); }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${wishlisted ? "fill-red-500 stroke-red-500" : "stroke-foreground"}`}
          />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs text-muted-foreground capitalize">{product.subcategory}</p>
        <h3 className="mt-1 text-sm font-medium leading-tight line-clamp-2">{product.name}</h3>
        <div className="mt-auto flex items-center gap-2 pt-2">
          {hasDiscount ? (
            <>
              <span className="font-semibold text-red-600">{formatPrice(product.salePrice!)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="font-semibold">{formatPrice(product.price)}</span>
          )}
        </div>
        {/* Color dots */}
        <div className="mt-2 flex gap-1">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color}
              className="h-3 w-3 rounded-full border border-neutral-300"
              style={{ backgroundColor: colorMap[color] ?? "#888" }}
              title={color}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

const colorMap: Record<string, string> = {
  black: "#111",
  white: "#fff",
  grey: "#888",
  navy: "#1a2744",
  beige: "#d4c5a9",
  olive: "#5c6b3c",
  cream: "#f5f0e1",
  camel: "#c19a6b",
  charcoal: "#36454f",
  burgundy: "#800020",
  pink: "#e8a0bf",
  "light-blue": "#add8e6",
  "forest-green": "#228b22",
  tan: "#d2b48c",
  "dark-brown": "#3e2723",
  khaki: "#c3b091",
  sage: "#b2ac88",
  champagne: "#f7e7ce",
  emerald: "#046307",
  gold: "#d4af37",
  nude: "#e3bc9a",
  sand: "#c2b280",
  "pale-blue": "#afeeee",
  natural: "#f5f5dc",
  tortoise: "#7b3f00",
  crystal: "#e0e0e0",
  silver: "#c0c0c0",
  "washed-black": "#333",
  "washed-grey": "#777",
  "washed-blue": "#6688aa",
  "light-wash": "#a4c2d8",
  "medium-wash": "#5b8ba0",
  "dark-wash": "#2c3e50",
  "white-gum": "#faf0e6",
  "all-black": "#000",
  "black-grey": "#444",
  "white-blue": "#e8f0fe",
  "grey-neon": "#b0b0b0",
  "silver-black": "#555",
  "gold-white": "#f0e68c",
  "silver-blue": "#7393B3",
  "multicolor-blue": "#4a90d9",
  "multicolor-earth": "#a0826d",
  "multicolor-rose": "#c27c7c",
};
