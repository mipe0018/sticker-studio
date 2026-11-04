
export default function Footer() {
  return (
    <footer className="relative w-full border-t-4 border-white bg-[var(--color-surface-blue)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-7 sm:flex-row">

        {/* COPYRIGHT */}
        <p className="text-sm font-bold text-[var(--color-text-light)]">
          © 2026 Sticker Studio
        </p>

        {/* BRAND MESSAGE */}
        <p
          className="text-lg font-bold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Made with creativity
          <span className="ml-2 text-xl text-[var(--color-primary-dark)]">
            ♡
          </span>
        </p>

        {/* DECORATION */}
        <div className="flex items-center gap-3 text-lg" aria-hidden="true">
          <span className="rotate-[-12deg] text-[var(--color-primary-dark)]">✦</span>
          <span className="translate-y-1 text-[var(--color-yellow)]">★</span>
          <span className="rotate-12 text-[var(--color-lavender)]">✧</span>
        </div>

      </div>
    </footer>
  );
}
