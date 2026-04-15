"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/products";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <h1 className="mt-6 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add something nice — or ask the AI Stylist!</p>
        <Link href="/products" className={buttonVariants({ className: "mt-6" })}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/products" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Continue Shopping
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Cart ({items.length})</h1>

      <div className="mt-8 space-y-4">
        {items.map((item) => {
          const price = item.product.salePrice ?? item.product.price;
          return (
            <div key={`${item.product.id}-${item.size}`} className="flex gap-4 rounded-lg border p-4">
              {/* Image placeholder */}
              <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded bg-muted text-3xl">
                {item.product.category === "tops" && "👕"}
                {item.product.category === "bottoms" && "👖"}
                {item.product.category === "shoes" && "👟"}
                {item.product.category === "outerwear" && "🧥"}
                {item.product.category === "accessories" && "⌚"}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/products/${item.product.slug}`} className="font-medium hover:underline">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded border hover:bg-muted"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded border hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatPrice(price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Separator className="my-6" />

      <div className="flex items-center justify-between text-lg">
        <span className="font-medium">Total</span>
        <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" className="w-full">
          Checkout (demo)
        </Button>
        <Button variant="outline" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>
    </div>
  );
}
