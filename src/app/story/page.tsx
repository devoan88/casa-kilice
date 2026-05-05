import Link from "next/link";

export default function StoryPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="rounded-[36px] border border-border bg-surface p-8 md:p-12">
        <p className="text-sm tracking-[0.28em] uppercase text-muted">
          Our story
        </p>
        <h1 className="mt-3 text-3xl tracking-tight md:text-5xl">
          სილამაზე, როგორც ხელწერა.
        </h1>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-muted">
            <p className="leading-7">
              Casa Kilicé არის სახლი, სადაც სილამაზე იწყება სიმშვიდით. ჩვენთვის
              “უმაღლესი ხარისხი” ნიშნავს არა მხოლოდ ინგრედიენტებს, არამედ
              გამოცდილებას — ტექსტურას, სურნელის სინაზეს, შეფუთვის ტაქტილურ
              შეგრძნებას და იმას, როგორ გრძნობს თავი ადამიანი სარკის წინ.
            </p>
            <p className="leading-7">
              ჩვენი ტონალობა — ბეჟი, ყავისფერი და ღია ქარვისფერი — არის თბილი,
              ბუნებრივი და მარადიული. ეს არის კანის ფერი, ქვიშის სინაზე და მზის
              რბილი სხივი.
            </p>
          </div>

          <div className="space-y-4 text-muted">
            <p className="leading-7">
              ჩვენ ვაშენებთ “რიტუალს”: მცირე ნაბიჯებს, რომლებიც დიდ ცვლილებას
              ქმნის. ყოველდღიური გამოყენება, უსაფრთხო ფორმულები და კომფორტი —
              ეს არის Casa Kilicé-ს იდეა.
            </p>
            <p className="leading-7">
              საიტი შექმნილია მსოფლიოს ნებისმიერი წერტილიდან შესაძენად — სწრაფი
              კატალოგი, უსაფრთხო გადახდები და ადმინისტრატორისთვის ვიზიტორების
              რუკა, რათა უკეთ გაიგოთ თქვენი აუდიტორია.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm tracking-[0.14em] text-background"
          >
            Shop worldwide
          </Link>
          <Link
            href="/account/sign-in"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface px-6 text-sm tracking-[0.14em] text-foreground hover:bg-[color-mix(in_srgb,var(--surface)_70%,var(--accent)_30%)]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

