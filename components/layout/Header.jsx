
import Link from "next/link";

export default function Header() {
  return (
    <header className="relative z-40 w-full border-b-4 border-white bg-[var(--color-surface-pink)] shadow-[0_5px_0_rgba(223,118,170,0.12)]">
      <div className="mx-auto flex min-h-[104px] max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">

        {/* LOGO */}
        <Link
          href="/"
          className="group relative flex items-center gap-2"
          aria-label="Sticker Studio – forsiden"
        >
          <span className="absolute -left-4 -top-3 rotate-[-15deg] text-xl text-[var(--color-blue-dark)] transition-transform duration-300 group-hover:-rotate-45 group-hover:scale-125">
            ✦
          </span>

          <span
            className="text-3xl font-bold tracking-tight text-[var(--color-text)] transition-transform duration-300 group-hover:scale-105 sm:text-4xl"
            style={{
              fontFamily: "var(--font-heading)",
              textShadow: "2px 3px 0 #ffffff",
            }}
          >
            Sticker Studio
            <span className="ml-1 text-[var(--color-primary-dark)]">!</span>
          </span>

          <span className="absolute -right-4 bottom-0 rotate-12 text-lg text-[var(--color-yellow)]">
            ✧
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav
          aria-label="Hovednavigation"
          className="flex flex-wrap items-center gap-3 sm:gap-4"
        >
          <Link
            href="/"
            className="toy-hover inline-flex min-h-12 items-center justify-center rounded-full border-[3px] border-white bg-[var(--color-blue)] px-6 py-2 text-base font-extrabold text-[var(--color-text)] shadow-[0_5px_0_rgba(117,182,233,0.35)] transition-all duration-200 hover:bg-[var(--color-blue-light)]"
          >
            <span className="mr-2 text-lg">✿</span>
            Playground
          </Link>

          <Link
            href="/stickers"
            className="toy-hover inline-flex min-h-12 items-center justify-center rounded-full border-[3px] border-white bg-[var(--color-primary)] px-6 py-2 text-base font-extrabold text-[var(--color-text)] shadow-[0_5px_0_rgba(223,118,170,0.35)] transition-all duration-200 hover:bg-[var(--color-primary-light)]"
          >
            <span className="mr-2 text-lg">♡</span>
            Stickers
          </Link>
        </nav>
      </div>

      {/* DECORATIVE DETAILS */}
      <div className="pointer-events-none absolute right-[30%] top-3 hidden text-xl text-white sm:block">
        ✧
      </div>

      <div className="pointer-events-none absolute bottom-3 left-[38%] hidden rotate-12 text-sm text-[var(--color-blue-dark)] sm:block">
        ★
      </div>
    </header>
  );
}
