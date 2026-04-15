"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Menu, Search, Heart, User, LogOut, BookmarkPlus } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/store/authStore";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { categories } from "@/data/products";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/products?q=${encodeURIComponent(trimmed)}`);
      setQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              <Link href="/" className="text-xl font-bold tracking-tighter" onClick={() => setOpen(false)}>
                NØRD
              </Link>
              <nav className="flex flex-col gap-4">
                <form onSubmit={(e) => { handleSearch(e); setOpen(false); }} className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </form>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  href="/products"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setOpen(false)}
                >
                  All Products
                </Link>
                <Link
                  href="/collections"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Collections
                </Link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tighter">
          NØRD
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            All
          </Link>
          <Link
            href="/collections"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Collections
          </Link>
        </nav>

        {/* Search + Cart */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="hidden sm:flex items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-44 rounded-md border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:w-56"
              />
            </div>
          </form>
          <Link href="/cart" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
          {mounted && (
            user ? (
              <div className="flex items-center gap-2">
                <Link href="/collections" title="Collections">
                  <BookmarkPlus className="h-5 w-5" />
                </Link>
                <Link href="/wishlist" title="Wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
                <button onClick={signOut} title="Sign out">
                  <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                <User className="h-5 w-5" />
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
