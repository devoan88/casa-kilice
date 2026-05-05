import Link from "next/link";

export default async function SkinApiSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ subscription?: string }>;
}) {
  const sp = await searchParams;
  const isSub = sp.subscription === "1";

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[color:var(--espresso)]">Payment received</h1>
      <p className="mt-4 text-sm text-muted">
        {isSub ? (
          <>
            Stripe has confirmed your subscription. Your partner account is active, billing renews automatically, and API
            access follows your subscription status (including automatic reactivation after successful invoice payment).
            Create API keys in the Casa Kilicé admin console when you are ready to integrate.
          </>
        ) : (
          <>
            Stripe has confirmed your checkout. API access is now enabled on your partner account, and credits were
            applied automatically. Create API keys in the Casa Kilicé admin console, or email your billing contact if you
            need onboarding help.
          </>
        )}
      </p>
      <Link
        href="/skin-api"
        className="mt-8 inline-block rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
      >
        Back to Skin API
      </Link>
    </div>
  );
}
