import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ჟურნალი",
  description: "Casa Kilicé-ს მოკლე ჩანაწერები პროდუქტზე. კვლევით დაპირებებს არ ვწერთ.",
};

const entries = [
  {
    title: "ერთი პროდუქტი, ჯერ",
    body: "სახლი იწყება კრემისებრი ნათების წვეთით. სხვა კატეგორიებს, ნაკრებებს და ლიმიტირებულ კოლექციებს არ ვაცხადებთ, სანამ ეს ერთი პროდუქტი მზად არ იქნება გასაყიდად.",
  },
  {
    title: "რატომ ტონალურში",
    body: "წვეთი ცალკე ტონალური კრემი არ არის. ის ერევა იმ ტონში, რომელიც უკვე გიხდებათ, რათა ფერი არ გადავწეროთ სხვის ტონალობაზე.",
  },
  {
    title: "რას არ ვწერთ ჯერ",
    body: "არ არის გამოქვეყნებული INCI, ფასი, ლაბორატორიული პროცენტი ან კლინიკური შედეგი. როცა ეს ფაქტები იარსებებს, აქვე დავწერთ. მანამდე ტექსტი რჩება გამოყენებაზე და დაპირებაზე: ანათებს, ატენიანებს, ტონს არ ცვლის.",
  },
];

export default function JournalPage() {
  return (
    <article className="bg-[#f6f0e7] text-[#2c241e]">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <p className="text-[11px] tracking-[0.28em] text-[#8a6a52] uppercase">ჟურნალი</p>
        <h1 className="mt-4 font-[family-name:var(--font-georgian)] text-5xl leading-tight">სახლის ჩანაწერები</h1>
        <p className="mt-6 text-lg leading-relaxed text-[#5c4d43]">
          ეს არ არის კვლევითი არქივი. სამი მოკლე შენიშვნაა იმაზე, რაც ახლა სიმართლეა.
        </p>
        <div className="mt-14 space-y-12">
          {entries.map((entry, index) => (
            <section key={entry.title} className="border-t border-[#2c241e]/15 pt-8">
              <p className="font-[family-name:var(--font-serif)] text-2xl text-[#b08968]">0{index + 1}</p>
              <h2 className="mt-3 text-2xl">{entry.title}</h2>
              <p className="mt-4 leading-relaxed text-[#5c4d43]">{entry.body}</p>
            </section>
          ))}
        </div>
        <Link href="/product" className="mt-14 inline-block text-sm underline underline-offset-8">
          პროდუქტის გვერდი
        </Link>
      </div>
    </article>
  );
}
