"use client";

import { AISkinScan } from "@/components/future/AISkinScan";
import { useCart } from "@/components/cart/CartProvider";
import { productAssetPath } from "@/lib/productMedia";
import { productDefs } from "@/lib/products";

export function ScanExperience() {
  const cart = useCart();
  return (
    <AISkinScan
      onAddToCart={(id) => {
        const def = productDefs.find((d) => d.slug === id);
        if (!def) return;
        const base =
          def.tone === "light" ? "light-cream" : def.tone === "bronzer" ? "bronzer-cream" : "deep-cream";
        cart.addItem({
          id,
          name: def.name,
          price: def.priceGel,
          imageSrc: productAssetPath(base),
        });
        cart.openCart();
      }}
    />
  );
}
