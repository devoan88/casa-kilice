"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { getCartClientKey } from "@/lib/cartClientKey";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  qty: number;
};

type CartState = {
  open: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const snapshotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const key = getCartClientKey();
    if (!key) return;

    if (snapshotTimer.current) clearTimeout(snapshotTimer.current);
    snapshotTimer.current = setTimeout(() => {
      snapshotTimer.current = null;
      const payload = {
        clientKey: key,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          imageSrc: i.imageSrc,
          qty: i.qty,
        })),
      };
      void fetch("/api/public/cart-snapshot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);
    }, 900);

    return () => {
      if (snapshotTimer.current) clearTimeout(snapshotTimer.current);
    };
  }, [items]);

  const api = useMemo<CartState>(() => {
    const count = items.reduce((a, b) => a + b.qty, 0);
    const total = items.reduce((a, b) => a + b.qty * b.price, 0);

    return {
      open,
      items,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      addItem: (item) => {
        setItems((prev) => {
          const found = prev.find((p) => p.id === item.id);
          if (found) {
            return prev.map((p) =>
              p.id === item.id ? { ...p, qty: p.qty + 1 } : p,
            );
          }
          return [...prev, { ...item, qty: 1 }];
        });
        setOpen(true);
      },
      removeItem: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      setQty: (id, qty) =>
        setItems((prev) =>
          prev
            .map((p) => (p.id === id ? { ...p, qty } : p))
            .filter((p) => p.qty > 0),
        ),
      clearCart: () => setItems([]),
      count,
      total,
    };
  }, [items, open]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

