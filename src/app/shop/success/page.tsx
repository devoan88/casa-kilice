import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <div className="rounded-[32px] border border-border bg-surface p-8 md:p-12">
        <p className="text-sm tracking-[0.28em] uppercase text-muted">
          Thank you
        </p>
        <h1 className="mt-3 text-3xl tracking-tight md:text-4xl">
          Your order is on its way.
        </h1>
        <p className="mt-4 max-w-prose text-muted">
          გადახდა წარმატებით შესრულდა. მალე მიიღებთ დადასტურებას ელფოსტაზე.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm tracking-[0.14em] text-background"
          >
            Continue shopping
          </Link>
          <Link
            href="/story"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface px-6 text-sm tracking-[0.14em] text-foreground hover:bg-[color-mix(in_srgb,var(--surface)_70%,var(--accent)_30%)]"
          >
            Our story
          </Link>
        </div>
      </div>
    </div>
  );
}

