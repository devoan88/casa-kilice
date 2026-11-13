import type { Metadata } from "next";

import { BottleMark } from "@/components/brand/BottleMark";
import { WaitlistForm } from "@/components/brand/WaitlistForm";

export const metadata: Metadata = {
  title: "კრემისებრი ნათების წვეთი",
  description: "ტონალურ კრემში ჩასარევი ნათების წვეთი Casa Kilicé-სგან. ტონს არ ცვლის.",
};

export default function ProductPage() {
  return (
    <article className="bg-[#f7f1e8] text-[#2c241e]">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[0.7fr_1.3fr] md:py-24">
        <div className="flex justify-center bg-[#f3e6d8] py-10">
          <BottleMark className="h-[380px] w-auto" />
        </div>
        <div>
          <p className="text-xs tracking-[0.28em] text-[#8a6a52] uppercase">პირველი პროდუქტი</p>
          <h1 className="mt-4 font-[family-name:var(--font-georgian)] text-5xl leading-tight">კრემისებრი ნათების წვეთი</h1>
          <p className="mt-6 text-lg leading-relaxed text-[#5c4d43]">
            სქელი, კრემისებრი წვეთი, რომელიც ერევა ნებისმიერ ტონალურ კრემში. რამდენიმე წვეთი ანათებს და ატენიანებს მთელ
            სახეს. ფერი ნეიტრალურია: არ ღიავდება და არ მუქდება თქვენი ტონი.
          </p>
          <dl className="mt-10 grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="tracking-[0.18em] text-[#8a6a52] uppercase">ვისთვის</dt>
              <dd className="mt-2 text-base">ყველას, ვინც უკვე იყენებს ტონალურ კრემს — ნებისმიერ ტონში.</dd>
            </div>
            <div>
              <dt className="tracking-[0.18em] text-[#8a6a52] uppercase">რა არ არის</dt>
              <dd className="mt-2 text-base">არ არის ცალკე ტონალური კრემი და არც ფერადი ჰაილაითერი ერთ კონკრეტულ ტონზე.</dd>
            </div>
            <div>
              <dt className="tracking-[0.18em] text-[#8a6a52] uppercase">ფასი</dt>
              <dd className="mt-2 text-base">ჯერ არ არის. ამ გვერდიდან გადახდა არ ხდება.</dd>
            </div>
            <div>
              <dt className="tracking-[0.18em] text-[#8a6a52] uppercase">შემადგენლობა</dt>
              <dd className="mt-2 text-base">INCI გამოქვეყნდება ფორმულის დასრულებისას. სიას არ ვიგონებთ.</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-8">
        <h2 className="font-[family-name:var(--font-georgian)] text-3xl">გამოყენება</h2>
        <ol className="mt-6 max-w-2xl list-decimal space-y-3 pl-5 leading-relaxed text-[#5c4d43]">
          <li>აიღეთ ჩვეული ტონალური კრემი.</li>
          <li>დაუმატეთ ორი ან სამი წვეთი.</li>
          <li>აურიეთ ერთგვაროვანამდე და წაისვით სახეზე.</li>
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-[family-name:var(--font-georgian)] text-3xl">მელოდინის სია</h2>
        <WaitlistForm id="product-waitlist" />
      </section>
    </article>
  );
}
