import type { Metadata } from "next";

import { ContactForm } from "@/components/brand/ContactForm";

export const metadata: Metadata = {
  title: "კონტაქტი",
  description: "მოგვწერეთ Casa Kilicé-ს. შეტყობინება ინახება თქვენს ბრაუზერში.",
};

export default function ContactPage() {
  return (
    <article className="bg-[#f7f1e8] text-[#2c241e]">
      <div className="mx-auto grid max-w-6xl gap-16 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-xs tracking-[0.28em] text-[#8a6a52] uppercase">კონტაქტი</p>
          <h1 className="mt-4 font-[family-name:var(--font-georgian)] text-5xl">მოგვწერეთ</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#5c4d43]">
            კითხვა პროდუქტზე, თანამშრომლობაზე ან უბრალოდ სიახლეებზე — დატოვეთ წერილი. ელფოსტა ჯერ არსად არ იგზავნება:
            ტექსტი რჩება ამ ბრაუზერში, სანამ საფოსტო არხს არ დავაკავშირებთ.
          </p>
          <p className="mt-6 text-sm text-[#6d5c50]">აუდიტორია: საქართველო.</p>
        </div>
        <ContactForm />
      </div>
    </article>
  );
}
