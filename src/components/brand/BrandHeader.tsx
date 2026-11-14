"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/product", label: "პროდუქტი" },
  { href: "/#ritual", label: "რიტუალი" },
  { href: "/journal", label: "ჟურნალი" },
  { href: "/about", label: "სახლი" },
  { href: "/contact", label: "კონტაქტი" },
];

export function BrandHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#2c241e]/10 bg-[#f6f0e7]/92 backdrop-blur-md">
      <div className="mx-auto grid h-[4.25rem] max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5">
        <nav className="hidden items-center gap-7 text-[13px] tracking-[0.04em] text-[#2c241e] md:flex" aria-label="მთავარი">
          {links.slice(0, 3).map((link) => (
            <Link key={link.href} href={link.href} className="hover:opacity-55">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="justify-self-start font-[family-name:var(--font-serif)] text-[1.35rem] tracking-[0.14em] text-[#2c241e] md:justify-self-center"
        >
          Casa Kilicé
        </Link>
        <div className="hidden items-center justify-end gap-7 text-[13px] md:flex">
          {links.slice(3).map((link) => (
            <Link key={link.href} href={link.href} className="hover:opacity-55">
              {link.label}
            </Link>
          ))}
          <Link href="/#waitlist" className="border border-[#2c241e] px-4 py-2 text-[11px] tracking-[0.18em] uppercase">
            სია
          </Link>
        </div>
        <button
          type="button"
          className="col-start-3 justify-self-end text-sm md:hidden"
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
          <Link href="/#waitlist" onClick={() => setOpen(false)}>
            მელოდინის სია
          </Link>
          <Link href="/account/sign-in" onClick={() => setOpen(false)}>
            ანგარიში
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
