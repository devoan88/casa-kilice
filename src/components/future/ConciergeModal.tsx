"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

import { AISkinScan } from "@/components/future/AISkinScan";
import { productAssetPath } from "@/lib/productMedia";
import { productDefs } from "@/lib/products";
import { useCart } from "@/components/cart/CartProvider";

export function ConciergeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const cart = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[120] bg-[color:rgba(45,27,27,0.42)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-[130] w-[860px] max-w-[94vw] -translate-x-1/2 -translate-y-1/2 rounded-[34px] border border-border bg-[color:var(--surface-strong)] p-6 shadow-[0_30px_90px_rgba(45,27,27,0.12)]"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.28em] uppercase text-muted">
                  Casa Kilicé Concierge
                </p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
                  Your ritual, curated.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-[color:var(--surface)] transition-colors duration-500 hover:border-[color:var(--hermes)]"
                onClick={onClose}
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6">
              <AISkinScan
                onAddToCart={(id) => {
                  const def = productDefs.find((d) => d.slug === id);
                  if (!def) return;
                  const base =
                    def.tone === "light"
                      ? "light-cream"
                      : def.tone === "bronzer"
                        ? "bronzer-cream"
                        : "deep-cream";
                  cart.addItem({
                    id,
                    name: def.name,
                    price: def.priceGel,
                    imageSrc: productAssetPath(base),
                  });
                  cart.openCart();
                }}
              />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

