
"use client";

import StickerGallery from "../../components/stickers/StickerGallery";

export default function StickersPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-4 py-8 sm:px-6 lg:px-8">
      {/* PAGE HEADER */}
      <section className="relative mb-7 overflow-hidden rounded-4xl border-4 border-white bg-(--color-surface-pink) px-6 py-7 shadow-[0_7px_0_rgba(223,118,170,0.14)] sm:px-9">
        <span className="absolute right-8 top-5 rotate-12 text-3xl text-white">
          ✦
        </span>

        <span className="absolute bottom-4 right-20 -rotate-12 text-2xl text-(--color-blue-dark)">
          ♡
        </span>

        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-(--color-primary-dark)">
          Your personal collection
        </p>

        <h1 className="font-heading text-3xl font-bold text-(--color-text) sm:text-4xl">
          The sticker book!
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--color-text-light)">
          Your little creative collection. Explore, collect and
          find the perfect stickers for your next creation.
        </p>
      </section>

      {/* STICKER LIBRARY */}
      <section className="rounded-4xl border-4 border-white bg-(--color-surface-blue) p-3 shadow-[0_8px_0_rgba(117,182,233,0.16)] sm:p-5 lg:p-7">
        <div className="rounded-3xl border-2 border-dashed border-white bg-white/40 p-3 sm:p-5">
          <StickerGallery
            onSelectSticker={() => {}}
            showManagement={true}
          />
        </div>
      </section>
    </main>
  );
}
