"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <p className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--espresso)]">Something went wrong</p>
      <p className="text-sm text-muted">{error.message}</p>
      {error.digest ? (
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Ref: {error.digest}</p>
      ) : null}
      <button
        type="button"
        className="ck-metallic inline-flex h-11 items-center justify-center rounded-full px-8 text-xs font-medium uppercase tracking-[0.22em]"
        onClick={() => reset()}
      >
        Try again
      </button>
      <a
        href="/"
        className="text-xs uppercase tracking-[0.24em] text-muted underline-offset-4 hover:text-[color:var(--hermes)] hover:underline"
      >
        Home
      </a>
    </div>
  );
}
