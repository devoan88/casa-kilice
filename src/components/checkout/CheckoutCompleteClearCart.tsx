"use client";

import { useEffect, useRef } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { getCartClientKey } from "@/lib/cartClientKey";

/** Clears the cart once after a successful checkout redirect (see CheckoutClient). */
export function CheckoutCompleteClearCart() {
  const cart = useCart();
  const didClear = useRef(false);
  useEffect(() => {
    if (didClear.current) return;
    didClear.current = true;
    const key = getCartClientKey();
    if (key) {
      void fetch("/api/public/cart-snapshot/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientKey: key }),
      }).catch(() => null);
    }
    cart.clearCart();
  }, [cart]);
  return null;
}
