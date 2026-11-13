"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "მთავარი" },
  { href: "/product", label: "პროდუქტი" },
  { href: "/about", label: "ჩვენ შესახებ" },
  { href: "/contact", label: "კონტაქტი" },
];

export function BrandHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#2c241e]/10 bg-[#f7f1e8]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-[family-name:var(--font-serif)] text-xl tracking-[0.08em] text-[#2c241e]">
          Casa Kilicé
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[#2c241e] md:flex" aria-label="მთავარი">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:opacity-60">
              {link.label}
            </Link>
          ))}
          <Link href="/account/sign-in" className="text-xs tracking-[0.16em] uppercase opacity-70">
            ანგარიში
          </Link>
        </nav>
        <button
          type="button"
          className="text-sm md:hidden"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "დახურვა" : "მენიუ"}
        </button>
      </div>
      {open ? (
        <nav className="flex flex-col gap-4 border-t border-[#2c241e]/10 px-5 py-5 md:hidden" aria-label="მობილური">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/account/sign-in" onClick={() => setOpen(false)}>
            ანგარიში
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
