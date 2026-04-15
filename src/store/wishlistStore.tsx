"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/store/authStore";

interface WishlistContextValue {
  wishlist: Set<string>;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue>({
  wishlist: new Set(),
  toggle: async () => {},
  isWishlisted: () => false,
});

export function WishlistProvider({ children }: { children: ReactNode }): JSX.Element {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setWishlist(new Set());
      return;
    }
    supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setWishlist(new Set(data.map((r) => r.product_id)));
      });
  }, [user]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }
      const isInWishlist = wishlist.has(productId);
      if (isInWishlist) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        setWishlist((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await supabase
          .from("wishlists")
          .insert({ user_id: user.id, product_id: productId });
        setWishlist((prev) => new Set(prev).add(productId));
      }
    },
    [user, wishlist]
  );

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggle, isWishlisted: (id) => wishlist.has(id) }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
