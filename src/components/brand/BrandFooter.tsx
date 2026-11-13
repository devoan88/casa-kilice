import Link from "next/link";

export function BrandFooter() {
  return (
    <footer className="mt-24 border-t border-[#2c241e]/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 text-sm text-[#6d5c50] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-serif)] text-2xl text-[#2c241e]">Casa Kilicé</p>
          <p className="mt-2 max-w-sm leading-relaxed">კოსმეტიკა საქართველოსთვის. პირველი პროდუქტი — კრემისებრი ნათების წვეთი.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="ქვედა">
          <Link href="/product">პროდუქტი</Link>
          <Link href="/about">ჩვენ შესახებ</Link>
          <Link href="/contact">კონტაქტი</Link>
          <Link href="/legal/terms">პირობები</Link>
        </nav>
        <p>© {new Date().getFullYear()} Casa Kilicé</p>
      </div>
    </footer>
  );
}
