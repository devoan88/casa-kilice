"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="p-6 font-sans">
        <h1 className="text-xl font-semibold">Global error</h1>
        <p className="mt-3 text-sm opacity-80">{error.message}</p>
        {error.digest ? <p className="mt-2 text-xs opacity-60">Ref: {error.digest}</p> : null}
        <button
          type="button"
          className="mt-6 rounded border px-4 py-2 text-sm"
          onClick={() => reset()}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

