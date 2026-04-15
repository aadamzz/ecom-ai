"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { products, categories } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Category, Style, Gender } from "@/types/product";

const styles: { value: Style; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "elegant", label: "Elegant" },
  { value: "smart-casual", label: "Smart Casual" },
  { value: "streetwear", label: "Streetwear" },
  { value: "sporty", label: "Sporty" },
  { value: "minimal", label: "Minimal" },
];

const genders: { value: Gender; label: string }[] = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "unisex", label: "Unisex" },
];

function buildFilterUrl(params: { category?: string | null; style?: string | null; gender?: string | null; q?: string | null }) {
  const parts: string[] = [];
  if (params.category) parts.push(`category=${params.category}`);
  if (params.style) parts.push(`style=${params.style}`);
  if (params.gender) parts.push(`gender=${params.gender}`);
  if (params.q) parts.push(`q=${encodeURIComponent(params.q)}`);
  return `/products${parts.length ? `?${parts.join("&")}` : ""}`;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") as Category | null;
  const activeStyle = searchParams.get("style") as Style | null;
  const activeGender = searchParams.get("gender") as Gender | null;
  const searchQuery = searchParams.get("q");

  const filtered = products.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (activeStyle && !p.styles.includes(activeStyle)) return false;
    if (activeGender && p.gender !== activeGender && p.gender !== "unisex" && activeGender !== "unisex") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const haystack = `${p.name} ${p.description} ${p.category} ${p.subcategory} ${p.material} ${p.colors.join(" ")} ${p.styles.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {searchQuery
            ? `Results for "${searchQuery}"`
            : activeCategoryName ?? "All Products"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
          {searchQuery && (
            <Link href={buildFilterUrl({ category: activeCategory, style: activeStyle, gender: activeGender })} className="ml-2 text-red-500 hover:underline">
              ✕ Clear search
            </Link>
          )}
        </p>
      </div>

      {/* Category Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href={buildFilterUrl({ style: activeStyle, gender: activeGender, q: searchQuery })}>
          <Badge variant={!activeCategory ? "default" : "outline"} className="cursor-pointer">
            All
          </Badge>
        </Link>
        {categories.map((cat) => (
          <Link key={cat.slug} href={buildFilterUrl({ category: cat.slug, style: activeStyle, gender: activeGender, q: searchQuery })}>
            <Badge variant={activeCategory === cat.slug ? "default" : "outline"} className="cursor-pointer">
              {cat.name}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Gender Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {genders.map((g) => (
          <Link
            key={g.value}
            href={buildFilterUrl({ category: activeCategory, style: activeStyle, gender: activeGender === g.value ? null : g.value, q: searchQuery })}
          >
            <Badge variant={activeGender === g.value ? "default" : "outline"} className="cursor-pointer">
              {g.label}
            </Badge>
          </Link>
        ))}
        {activeGender && (
          <Link href={buildFilterUrl({ category: activeCategory, style: activeStyle, q: searchQuery })}>
            <Badge variant="outline" className="cursor-pointer text-red-500">
              ✕ Clear Gender
            </Badge>
          </Link>
        )}
      </div>

      {/* Style Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {styles.map((style) => (
          <Link
            key={style.value}
            href={buildFilterUrl({ category: activeCategory, style: activeStyle === style.value ? null : style.value, gender: activeGender, q: searchQuery })}
          >
            <Badge variant={activeStyle === style.value ? "default" : "outline"} className="cursor-pointer">
              {style.label}
            </Badge>
          </Link>
        ))}
        {activeStyle && (
          <Link href={buildFilterUrl({ category: activeCategory, gender: activeGender, q: searchQuery })}>
            <Badge variant="outline" className="cursor-pointer text-red-500">
              ✕ Clear Style
            </Badge>
          </Link>
        )}
      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">🤷</p>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-muted-foreground">Try changing your filters</p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><p>Loading...</p></div>}>
      <ProductsContent />
    </Suspense>
  );
}
