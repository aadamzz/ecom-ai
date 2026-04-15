"use client";

import { useWishlist } from "@/store/wishlistStore";
import { useAuth } from "@/store/authStore";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/product-card";
import Link from "next/link";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const { wishlist } = useWishlist();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">Sign in to see your wishlist</p>
        <Link
          href="/auth/login"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const wishlisted = products.filter((p) => wishlist.has(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Wishlist</h1>
      {wishlisted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">🤍</p>
          <p className="text-lg font-medium">Your wishlist is empty</p>
          <p className="mt-1 text-muted-foreground">Hover a product card and click the heart to save it</p>
          <Link href="/products" className="mt-4 text-sm font-medium hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishlisted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
