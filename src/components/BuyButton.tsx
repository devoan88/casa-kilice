"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { useI18n } from "@/i18n/LanguageProvider";

export function BuyButton({
  slug,
  name,
  priceGel,
  imageSrc,
}: {
  slug: string;
  name: string;
  priceGel: number;
  imageSrc: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const cart = useCart();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        cart.addItem({ id: slug, name, price: priceGel, imageSrc });
        router.push("/checkout");
      }}
      className="ck-metallic inline-flex h-12 items-center justify-center rounded-full px-6 text-sm tracking-[0.14em] disabled:opacity-60"
    >
      {loading ? t("buy_preparing") : t("buy_now")}
    </button>
  );
}
