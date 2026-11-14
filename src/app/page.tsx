import type { Metadata } from "next";
import Link from "next/link";

import { BottleMark } from "@/components/brand/BottleMark";
import { WaitlistForm } from "@/components/brand/WaitlistForm";

export const metadata: Metadata = {
  title: "Casa Kilicé — ნათების წვეთი",
  description:
    "კრემისებრი ნათების წვეთი ნებისმიერ ტონალურ კრემში. რამდენიმე წვეთი ანათებს და ატენიანებს სახეს, ტონს არ ცვლის.",
};

const steps = [
  {
    n: "01",
    title: "ტონალური",
    body: "აიღეთ ის რაოდენობა, რომელსაც ისედაც ხმარობთ. ტონი რჩება თქვენი.",
  },
  {
    n: "02",
    title: "ორი ან სამი წვეთი",
    body: "საკმარისია მთელი სახისთვის. მეტი მხოლოდ მაშინ, თუ უფრო სველი შარავანდი გინდათ.",
  },
  {
    n: "03",
    title: "აურიეთ და წაისვით",
    body: "აურიეთ სანამ ფერი ისევ თქვენი ტონი იქნება, ოღონდ უფრო ცოცხალი. წაისვით როგორც ტონალურს.",
  },
];

const notes = [
  {
    kicker: "ჟურნალი",
    title: "ერთი პროდუქტი, ჯერ",
    body: "სახლი იწყება ერთი წვეთით. კოლექციას არ ვაცხადებთ, სანამ ეს ერთი არ დასრულდება.",
  },
  {
    kicker: "ჟურნალი",
    title: "ტონი რჩება თქვენი",
    body: "წვეთი ტონალურს ემატება. ის თვითონ არ ირჩევს ფერს და არ ცვლის თქვენს ტონს.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-[#f6f0e7] text-[#2c241e]">
      <section className="relative overflow-hidden border-b border-[#2c241e]/10">
        <div className="mx-auto grid min-h-[calc(100vh-4.25rem)] max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-10">
          <div>
            <p className="text-[11px] tracking-[0.34em] text-[#8a6a52] uppercase">საქართველო · კოსმეტიკა</p>
            <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-georgian)] text-5xl leading-[1.02] md:text-7xl">
              რამდენიმე წვეთი.
              <span className="mt-3 block">მთელი სახე ნათდება.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#5c4d43]">
              კრემისებრი ნათების წვეთი ერევა ნებისმიერი ტონის ტონალურ კრემში. ანათებს და ატენიანებს. ტონს არ ცვლის.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="#waitlist"
                className="inline-flex h-12 items-center bg-[#2c241e] px-7 text-[11px] tracking-[0.22em] text-[#f6f0e7] uppercase"
              >
                მელოდინის სია
              </a>
              <Link href="/product" className="text-sm underline decoration-[#c4a48c] underline-offset-8">
                პროდუქტის ამბავი
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div
              className="absolute top-8 h-80 w-80 rounded-full"
              style={{ background: "radial-gradient(circle, #f3d2be 0%, rgba(246,240,231,0) 72%)" }}
              aria-hidden
            />
            <BottleMark className="relative h-[460px] w-auto" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:items-end">
        <div>
          <p className="text-[11px] tracking-[0.28em] text-[#8a6a52] uppercase">პროდუქტის ამბავი</p>
          <h2 className="mt-4 font-[family-name:var(--font-georgian)] text-4xl leading-tight md:text-5xl">
            კრემისებრი ნათების წვეთი
          </h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-[#5c4d43]">
          <p>
            ერთი ფერი ყველასთვის. წვეთი თვითონ არ არის ტონალური კრემი — ის ემატება იმას, რაც უკვე გიხდებათ, ღია თუ მუქი.
          </p>
          <p>სახე რჩება დატენიანებული და ნათელი. ფერს კი არ „ასწორებს“ სხვის ტონზე.</p>
          <p className="text-base">ფასი ჯერ არ არის გამოცხადებული. ამ საიტიდან გადახდა არ ხდება.</p>
          <Link href="/product" className="inline-block text-sm underline underline-offset-8">
            სრული გვერდი
          </Link>
        </div>
      </section>

      <section id="ritual" className="border-y border-[#2c241e]/10 bg-[#f3e6d8]">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <p className="text-[11px] tracking-[0.28em] text-[#8a6a52] uppercase">როგორ გამოიყენოთ</p>
          <h2 className="mt-4 font-[family-name:var(--font-georgian)] text-4xl">სამი მოძრაობა</h2>
          <ol className="mt-14 grid gap-12 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.n} className="border-t border-[#2c241e]/20 pt-6">
                <p className="font-[family-name:var(--font-serif)] text-3xl text-[#b08968]">{step.n}</p>
                <h3 className="mt-4 text-xl">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-[#5c4d43]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="formula" className="mx-auto grid max-w-7xl gap-10 px-5 py-24 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[11px] tracking-[0.28em] text-[#8a6a52] uppercase">შემადგენლობა</p>
          <h2 className="mt-4 font-[family-name:var(--font-georgian)] text-4xl leading-tight">რას ვპირდებით ახლა</h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-[#5c4d43]">
          <p>
            სრული INCI სია ჯერ არ ქვეყნდება. ფორმულა საჯარო გახდება მაშინ, როცა დასრულდება. გამოგონილ ინგრედიენტებს აქ არ
            ჩამოვთვლით.
          </p>
          <p>
            დღევანდელი დაპირება მოკლეა: რამდენიმე წვეთი ატენიანებს და ანათებს მთელ სახეს და ნებისმიერ ტონალურთან რჩება
            ნეიტრალური ფერით. ლაბორატორიულ პროცენტებს და სამედიცინო დაპირებებს არ ვწერთ.
          </p>
        </div>
      </section>

      <section className="bg-[#2c241e] text-[#f6f0e7]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {[
            { label: "ნათება", line: "მთელ სახეზე, რამდენიმე წვეთით." },
            { label: "ტონი", line: "რჩება ის, რაც ტონალურში უკვე გაქვთ." },
            { label: "ტენი", line: "კრემისებრი ფენა, არა მშრალი ფხვნილი." },
          ].map((panel) => (
            <div key={panel.label} className="border-[#f6f0e7]/15 px-8 py-20 md:border-l md:first:border-l-0">
              <p className="text-[11px] tracking-[0.28em] text-[#e7c2ae] uppercase">რედაქცია</p>
              <h2 className="mt-6 font-[family-name:var(--font-georgian)] text-5xl">{panel.label}</h2>
              <p className="mt-6 max-w-xs leading-relaxed text-[#f6f0e7]/75">{panel.line}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-24 md:grid-cols-2">
        {notes.map((note) => (
          <article key={note.title} className="border border-[#2c241e]/12 bg-[#fffaf4] p-8 md:p-10">
            <p className="text-[11px] tracking-[0.24em] text-[#8a6a52] uppercase">{note.kicker}</p>
            <h2 className="mt-4 font-[family-name:var(--font-georgian)] text-3xl">{note.title}</h2>
            <p className="mt-4 leading-relaxed text-[#5c4d43]">{note.body}</p>
          </article>
        ))}
        <Link href="/journal" className="self-end text-sm underline underline-offset-8 md:col-span-2">
          ჟურნალის გვერდი
        </Link>
      </section>

      <section className="border-t border-[#2c241e]/10">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-[#8a6a52] uppercase">სახლი</p>
            <h2 className="mt-4 font-[family-name:var(--font-georgian)] text-4xl">Casa Kilicé საქართველოსთვის</h2>
            <p className="mt-6 max-w-md leading-relaxed text-[#5c4d43]">
              ბრენდი ახლა იწყება. ისტორიას არ ვაგრძელებთ გამოგონილი წლებით ან ჯილდოებით. პირველი ნაბიჯი ერთი პროდუქტია.
            </p>
            <Link href="/about" className="mt-8 inline-block text-sm underline underline-offset-8">
              ჩვენ შესახებ
            </Link>
          </div>
          <div id="waitlist">
            <p className="text-[11px] tracking-[0.28em] text-[#8a6a52] uppercase">მელოდინის სია</p>
            <h2 className="mt-4 font-[family-name:var(--font-georgian)] text-4xl">როცა წვეთი გამოვა</h2>
            <p className="mt-4 text-[#5c4d43]">სახელი და ელფოსტა. ყიდვა აქ არ იხსნება.</p>
            <WaitlistForm />
          </div>
        </div>
      </section>
    </div>
  );
}
