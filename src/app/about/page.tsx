import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ჩვენ შესახებ",
  description: "Casa Kilicé — კოსმეტიკის სახლი საქართველოს აუდიტორიისთვის. პირველი პროდუქტი ნათების წვეთია.",
};

export default function AboutPage() {
  return (
    <article className="bg-[#f7f1e8] text-[#2c241e]">
      <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <p className="text-xs tracking-[0.28em] text-[#8a6a52] uppercase">სახლი</p>
        <h1 className="mt-4 font-[family-name:var(--font-georgian)] text-5xl leading-tight">Casa Kilicé</h1>
        <div className="mt-8 space-y-6 text-lg leading-relaxed text-[#5c4d43]">
          <p>
            Casa Kilicé კოსმეტიკის სახელია, რომელიც საქართველოში მცხოვრებ ადამიანებს ელაპარაკება. პირველი ნაბიჯი ერთი
            პროდუქტია: კრემისებრი ნათების წვეთი, რომელიც ნებისმიერ ტონალურ კრემს ერევა.
          </p>
          <p>
            იდეა მარტივია. ტონალური უკვე გაქვთ — თქვენი ტონი, თქვენი ჩვევა. წვეთი ამას ანათებს და ატენიანებს, ახალ ფერს კი
            არ გიწერს.
          </p>
          <p>
            ისტორიას არ ვაგრძელებთ გამოგონილი წლებით, ლაბორატორიით ან ჯილდოებით. ბრენდი ახლა იწყება. როცა ფორმულა,
            შეფუთვა და გაყიდვა მზად იქნება, ამას აქვე დავწერთ — ფასითა და შემადგენლობით ერთად.
          </p>
          <p>სანამ ეს მოხდება, შეგიძლიათ დატოვოთ კონტაქტი ან ჩაეწეროთ მელოდინის სიაში.</p>
        </div>
      </div>
    </article>
  );
}
