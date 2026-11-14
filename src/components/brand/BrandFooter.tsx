import Link from "next/link";

const columns = [
  {
    title: "სახლი",
    links: [
      { href: "/about", label: "ჩვენ შესახებ" },
      { href: "/journal", label: "ჟურნალი" },
      { href: "/contact", label: "კონტაქტი" },
    ],
  },
  {
    title: "პროდუქტი",
    links: [
      { href: "/product", label: "ნათების წვეთი" },
      { href: "/#ritual", label: "როგორ გამოიყენოთ" },
      { href: "/#formula", label: "შემადგენლობა" },
      { href: "/#waitlist", label: "მელოდინის სია" },
    ],
  },
  {
    title: "სხვა",
    links: [
      { href: "/legal/terms", label: "პირობები" },
      { href: "/account/sign-in", label: "ანგარიში" },
    ],
  },
];

export function BrandFooter() {
  return (
    <footer className="border-t border-[#2c241e]/15 bg-[#efe4d6] text-[#2c241e]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-serif)] text-3xl tracking-[0.08em]">Casa Kilicé</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#5c4d43]">
            კოსმეტიკის სახლი საქართველოსთვის. პირველი პროდუქტი კრემისებრი ნათების წვეთია. ფასი ჯერ არ არის.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#8a6a52]">{column.title}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:opacity-60">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-[#2c241e]/10 px-5 py-6 text-xs tracking-[0.14em] text-[#6d5c50] uppercase md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} Casa Kilicé</span>
        <span>საქართველო</span>
      </div>
    </footer>
  );
}
