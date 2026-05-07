"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  vendor: { id: string; name: string };
  category: { id: string; name: string };
  stock: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: CartProduct;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return; // unauthenticated — silently keep empty
      const data = await res.json();
      setItems(data.cart?.cartItems ?? []);
    } catch {
      // network error — keep existing state
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Failed to add to cart");
        }
        await refresh();
        setIsOpen(true); // auto-open drawer
      } finally {
        setIsLoading(false);
      }
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/cart/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });
        if (!res.ok) throw new Error("Failed to update quantity");
        // Optimistic local update
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove item");
      // Optimistic local update
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isLoading,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        updateQuantity,
        removeItem,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
