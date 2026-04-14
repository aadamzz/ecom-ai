"use client";

import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; size: string }
  | { type: "REMOVE_ITEM"; productId: string; size: string }
  | { type: "UPDATE_QUANTITY"; productId: string; size: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) => item.product.id === action.product.id && item.size === action.size
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === action.product.id && item.size === action.size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { product: action.product, size: action.size, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter(
          (item) => !(item.product.id === action.productId && item.size === action.size)
        ),
      };
    case "UPDATE_QUANTITY":
      return {
        items: state.items.map((item) =>
          item.product.id === action.productId && item.size === action.size
            ? { ...item, quantity: action.quantity }
            : item
        ).filter((item) => item.quantity > 0),
      };
    case "CLEAR_CART":
      return { items: [] };
    case "LOAD_CART":
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "nord-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => ({
    items: loadCart(),
  }));

  const addItem = useCallback((product: Product, size: string) => {
    dispatch({ type: "ADD_ITEM", product, size });
  }, []);

  const removeItem = useCallback((productId: string, size: string) => {
    dispatch({ type: "REMOVE_ITEM", productId, size });
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", productId, size, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  );

  // Persist to localStorage
  if (typeof window !== "undefined") {
    saveCart(state.items);
  }

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
