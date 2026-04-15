import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { categories, products } from "@/data/products";
import { ArrowRight } from "lucide-react";
import { OpenChatButton } from "@/components/chat/OpenChatButton";

export default function HomePage() {
  const featured = products.slice(0, 8);
  const onSale = products.filter((p) => p.salePrice);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-400">
            AI-Powered Fashion
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            NØRD
          </h1>
          <p className="mt-6 text-lg text-neutral-300 sm:text-xl">
            Your personal AI stylist. Tell us what you need — we'll build you an outfit.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-8 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200">
              Browse Collection
            </Link>
            <OpenChatButton />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-foreground/20"
            >
              <span className="text-3xl mb-3">
                {cat.slug === "tops" && "👕"}
                {cat.slug === "bottoms" && "👖"}
                {cat.slug === "shoes" && "👟"}
                {cat.slug === "outerwear" && "🧥"}
                {cat.slug === "accessories" && "⌚"}
              </span>
              <span className="font-semibold">{cat.name}</span>
              <span className="mt-1 text-xs text-muted-foreground text-center">{cat.description}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Bestsellers</h2>
          <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* On Sale */}
      {onSale.length > 0 && (
        <section className="bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-red-600">Sale 🔥</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {onSale.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
