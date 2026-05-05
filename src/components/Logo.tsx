import Link from "next/link";

/** No text lockup — brand mark lives on the home hero only. */
export function Logo() {
  return (
    <Link href="/" prefetch className="sr-only">
      Home
    </Link>
  );
}
