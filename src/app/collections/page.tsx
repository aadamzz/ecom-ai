"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, BookmarkPlus, ShoppingBag, LogIn } from "lucide-react";
import { useCollections } from "@/store/collectionsStore";
import { useAuth } from "@/store/authStore";
import { useCart } from "@/lib/cart";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/products";

export default function CollectionsPage() {
  const { collections, removeCollection } = useCollections();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <LogIn className="mx-auto h-14 w-14 text-muted-foreground/40 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to see your collections</h1>
        <p className="text-muted-foreground mb-8">
          Collections are saved to your account and accessible from any device.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  function addAllToCart(productIds: string[]) {
    for (const id of productIds) {
      const product = products.find((p) => p.id === id);
      if (product && product.sizes[0]) {
        addItem(product, product.sizes[0]);
      }
    }
  }

  if (collections.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <BookmarkPlus className="mx-auto h-14 w-14 text-muted-foreground/40 mb-4" />
        <h1 className="text-2xl font-bold mb-2">No collections yet</h1>
        <p className="text-muted-foreground mb-8">
          Select products in the AI chat and save them as a named collection.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {" / "}
        <span className="text-foreground">Collections</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight mb-8">My Collections</h1>

      <div className="flex flex-col gap-6">
        {collections.map((col) => {
          const colProducts = col.productIds
            .map((id) => products.find((p) => p.id === id))
            .filter(Boolean) as typeof products;
          const isExpanded = expandedId === col.id;

          return (
            <div key={col.id} className="rounded-2xl border bg-card overflow-hidden">
              {/* Collection header */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Thumbnail strip */}
                <div
                  className="flex cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : col.id)}
                >
                  {colProducts.slice(0, 4).map((p, i) => (
                    <div
                      key={p.id}
                      className="relative h-14 w-14 overflow-hidden rounded-lg border-2 border-background bg-muted"
                      style={{ marginLeft: i > 0 ? "-1rem" : undefined, zIndex: 4 - i }}
                    >
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {colProducts.length > 4 && (
                    <div
                      className="relative flex h-14 w-14 items-center justify-center rounded-lg border-2 border-background bg-muted text-xs font-semibold text-muted-foreground"
                      style={{ marginLeft: "-1rem", zIndex: 0 }}
                    >
                      +{colProducts.length - 4}
                    </div>
                  )}
                </div>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : col.id)}
                >
                  <h2 className="font-semibold truncate">{col.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {colProducts.length} item{colProducts.length !== 1 ? "s" : ""} ·{" "}
                    {new Date(col.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => addAllToCart(col.productIds)}
                    title="Add all to cart"
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Add all
                  </button>
                  <button
                    onClick={() => removeCollection(col.id)}
                    title="Delete collection"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded product grid */}
              {isExpanded && (
                <div className="border-t px-5 py-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {colProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="group flex flex-col gap-2"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium leading-tight line-clamp-2 group-hover:underline">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatPrice(p.salePrice ?? p.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
