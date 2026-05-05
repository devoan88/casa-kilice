export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 text-sm text-muted">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="tracking-wide">
            © {new Date().getFullYear()} Casa Kilicé. Crafted with care.
          </p>
          <p className="tracking-wide">
            Insured logistics (DHL · FedEx · Aramex) • Secure checkout • Premium
            ingredients
          </p>
        </div>
      </div>
    </footer>
  );
}

