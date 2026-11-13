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
    title: "აიღეთ ტონალური",
    body: "ჩვეულებრივი რაოდენობა ხელის ზურგზე ან პალიტრაზე — ის ტონი, რომელსაც ისედაც ხმარობთ.",
  },
  {
    n: "02",
    title: "ჩააწვეთეთ",
    body: "ორი ან სამი წვეთი საკმარისია მთელი სახისთვის. მეტი სჭირდება მხოლოდ მაშინ, თუ უფრო სველი შარავანდი გინდათ.",
  },
  {
    n: "03",
    title: "აურიეთ და წაისვით",
    body: "აურიეთ სანამ ფერი ისევ თქვენი ტონი იქნება, ოღონდ უფრო ცოცხალი. წაისვით როგორც ტონალურს.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-[#f7f1e8] text-[#2c241e]">
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-[1.2fr_0.8fr] md:pt-24">
        <div>
          <p className="text-xs tracking-[0.32em] text-[#8a6a52] uppercase">საქართველო · კოსმეტიკა</p>
          <h1 className="mt-6 font-[family-name:var(--font-georgian)] text-5xl leading-[1.05] md:text-7xl">
            რამდენიმე წვეთი.
            <span className="mt-2 block italic">მთელი სახე ნათდება.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#5c4d43]">
            Casa Kilicé-ს პირველი პროდუქტი კრემისებრი ნათების წვეთია. ერევა ნებისმიერი ტონის ტონალურ კრემში,
            ატენიანებს და ანათებს სახეს. ტონს არ ცვლის — რჩება თქვენი ფერი.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="#waitlist"
              className="inline-flex h-12 items-center bg-[#2c241e] px-7 text-xs tracking-[0.22em] text-[#f7f1e8] uppercase"
            >
              მელოდინის სია
            </a>
            <Link href="/product" className="text-sm underline decoration-[#c4a48c] underline-offset-4">
              პროდუქტის გვერდი
            </Link>
          </div>
        </div>
        <div className="relative mx-auto flex w-full max-w-sm justify-center">
          <div
            className="absolute inset-8 rounded-full"
            style={{ background: "radial-gradient(circle, #f6d7c4 0%, rgba(247,241,232,0) 70%)" }}
            aria-hidden
          />
          <BottleMark className="relative h-[420px] w-auto" />
        </div>
      </section>

      <section className="border-y border-[#2c241e]/10 bg-[#f3e6d8]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.28em] uppercase text-[#8a6a52]">პროდუქტი</p>
            <h2 className="mt-4 font-[family-name:var(--font-georgian)] text-4xl leading-tight md:text-5xl">
              კრემისებრი ნათების წვეთი
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-[#5c4d43]">
            <p>
              ერთი ფერი ყველასთვის. წვეთი თვითონ არ არის ტონალური კრემი — ის ემატება იმას, რაც უკვე გიხდებათ,
              ღია თუ მუქი.
            </p>
            <p>სახე რჩება დატენიანებული და ნათელი, ფერს კი არ „ასწორებს“ სხვის ტონზე.</p>
            <p className="text-base">ფასი ჯერ არ არის გამოცხადებული. ყიდვა ამ საიტზე არ იხსნება.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-[family-name:var(--font-georgian)] text-4xl">როგორ გამოიყენოთ</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n}>
              <p className="font-[family-name:var(--font-serif)] text-3xl text-[#c4a48c]">{step.n}</p>
              <h3 className="mt-3 text-xl">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-[#5c4d43]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="grid gap-8 border border-[#2c241e]/10 bg-[#fffaf4] p-8 md:grid-cols-[0.8fr_1.2fr] md:p-12">
          <h2 className="font-[family-name:var(--font-georgian)] text-3xl leading-tight">დაპირება შემადგენლობაზე</h2>
          <div className="space-y-4 leading-relaxed text-[#5c4d43]">
            <p>
              სრული INCI სია ჯერ არ ქვეყნდება. ფორმულა საჯარო გახდება მაშინ, როცა დასრულდება — გამოგონილ ინგრედიენტებს
              აქ არ ჩამოვთვლით.
            </p>
            <p>
              რას ვპირდებით დღეს: რამდენიმე წვეთი ატენიანებს და ანათებს მთელ სახეს და ნებისმიერ ტონალურთან რჩება
              ნეიტრალური ფერით. ლაბორატორიულ პროცენტებს და სამედიცინო დაპირებებს არ ვწერთ.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-[family-name:var(--font-georgian)] text-4xl">მელოდინის სია</h2>
        <p className="mt-4 max-w-xl text-[#5c4d43]">დატოვეთ სახელი და ელფოსტა, თუ გინდათ იცოდეთ როცა წვეთი გამოვა.</p>
        <WaitlistForm />
      </section>
    </div>
  );
}
