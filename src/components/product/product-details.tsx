"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/product-card";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/types/product";
import { Check, ShoppingBag, Heart, X } from "lucide-react";
import Link from "next/link";

export function ProductDetails({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const hasDiscount = product.salePrice && product.salePrice < product.price;

  function handleAddToCart() {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {" / "}
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {" / "}
        <Link href={`/products?category=${product.category}`} className="hover:text-foreground capitalize">
          {product.category}
        </Link>
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div
          className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted cursor-zoom-in"
          onClick={() => product.images[0] && setLightbox(true)}
        >
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-9xl">
              {product.category === "tops" && "👕"}
              {product.category === "bottoms" && "👖"}
              {product.category === "shoes" && "👟"}
              {product.category === "outerwear" && "🧥"}
              {product.category === "accessories" && "⌚"}
            </div>
          )}
          <button
            onClick={() => toggle(product.id)}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow"
            title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart className={`h-5 w-5 transition-colors ${wishlisted ? "fill-red-500 stroke-red-500" : "stroke-foreground"}`} />
          </button>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground capitalize">{product.subcategory}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-bold text-red-600">{formatPrice(product.salePrice!)}</span>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            )}
          </div>

          <Separator className="my-6" />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Sizes */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-input hover:border-foreground/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 space-y-2 text-sm">
            <p><span className="font-medium">Material:</span> {product.material}</p>
            <p><span className="font-medium">Gender:</span> {product.gender === "men" ? "Men" : product.gender === "women" ? "Women" : "Unisex"}</p>
            <div className="flex flex-wrap gap-1">
              {product.styles.map((s) => (
                <Badge key={s} variant="outline" className="capitalize">{s}</Badge>
              ))}
              {product.occasions.map((o) => (
                <Badge key={o} variant="secondary" className="capitalize">{o}</Badge>
              ))}
            </div>
          </div>

          {/* Add to cart + wishlist */}
          <div className="mt-8 flex gap-2">
            <Button
              size="lg"
              className="flex-1"
              disabled={!selectedSize}
              onClick={handleAddToCart}
            >
              {added ? (
                <><Check className="mr-2 h-4 w-4" /> Added to cart!</>
              ) : (
                <><ShoppingBag className="mr-2 h-4 w-4" /> {selectedSize ? "Add to Cart" : "Select a size"}</>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => toggle(product.id)}
              title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500 stroke-red-500" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight mb-6">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && product.images[0] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-black/40"
            onClick={() => setLightbox(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={product.images[0]}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
