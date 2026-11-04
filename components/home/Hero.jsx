
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-background)] px-6 py-14 md:py-20">
      <div className="mx-auto max-w-7xl text-center">

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-primary-dark)]">
          Your little creative corner
        </p>

        <h1 className="mx-auto max-w-4xl font-heading text-5xl font-bold leading-tight text-[var(--color-text)] md:text-7xl">
          A little space for
          <span className="block text-[var(--color-primary-dark)]">
            big creativity.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--color-text-light)] md:text-lg">
          Collect your favorite doodles, play with colors
          and create your very own sticker sheets.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <Link
            href="/stickers"
            className="rounded-full bg-[var(--color-primary)] px-8 py-3 font-medium text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            Explore stickers
          </Link>

          <Link
            href="#playground"
            className="rounded-full border border-[var(--color-border)] px-8 py-3 font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
          >
            Start creating
          </Link>
        </div>

      </div>
    </section>
  );
}
