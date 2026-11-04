
"use client";

import Hero from "../components/home/Hero";
import StickerSheet from "../components/playground/StickerSheet";
import StickerGallery from "../components/stickers/StickerGallery";

import { useStickerStore } from "../store/stickerStore";

export default function Home() {
  // STICKER STORE
  const stickers = useStickerStore((state) => state.stickers);
  const addSticker = useStickerStore((state) => state.addSticker);
  const setStickers = useStickerStore((state) => state.setStickers);

  // BACKGROUND COLOR
  const backgroundColor = useStickerStore(
    (state) => state.backgroundColor
  );

  const setBackgroundColor = useStickerStore(
    (state) => state.setBackgroundColor
  );

  return (
    <>
      <Hero />

      <section
        id="playground"
        className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-8"
      >
        {/* INTRODUCTION */}
        <div className="relative mb-10 text-center">
          <span className="absolute left-[12%] top-0 hidden rotate-[-15deg] text-3xl text-[var(--color-primary)] md:block">
            ✧
          </span>

          <span className="absolute right-[12%] top-2 hidden rotate-12 text-3xl text-[var(--color-blue-dark)] md:block">
            ★
          </span>

          <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--color-primary-dark)]">
            Your little creative playground
          </p>

          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Let&apos;s make something cute!
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-light)]">
            Pick your favorite stickers, decorate your sheet and
            create something completely your own.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {[
              { icon: "↗", label: "Drag & drop", color: "var(--color-surface-blue)" },
              { icon: "✳", label: "Move & resize", color: "var(--color-surface-purple)" },
              { icon: "♡", label: "Make it yours", color: "var(--color-surface-pink)" },
            ].map((item) => (
              <span
                key={item.label}
                className="rounded-full border-2 border-white px-4 py-2 text-xs font-extrabold text-[var(--color-text)] shadow-sm"
                style={{ backgroundColor: item.color }}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* A4 WORKSPACE */}
        <section className="mb-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary-dark)]">
                Your workspace
              </p>

              <h3 className="mt-1 font-heading text-2xl font-bold">
                Sticker sheet
              </h3>
            </div>

            <span className="rounded-full border-2 border-white bg-[var(--color-surface-blue)] px-4 py-2 text-xs font-extrabold text-[var(--color-text)] shadow-sm">
              ✦ A4 · Landscape
            </span>
          </div>

          <div className="rounded-[32px] border-4 border-white bg-[var(--color-surface-blue)] p-3 shadow-[0_8px_0_rgba(117,182,233,0.18)] sm:p-5 lg:p-7">
            <div className="rounded-[24px] border-2 border-dashed border-white bg-white/40 p-2 sm:p-4">
              <StickerSheet
                stickers={stickers}
                setStickers={setStickers}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
              />
            </div>
          </div>
        </section>

        {/* STICKER LIBRARY */}
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-blue-dark)]">
                Pick your favorites
              </p>

              <h3 className="mt-1 font-heading text-2xl font-bold">
                Your sticker collection
              </h3>

              <p className="mt-1 text-sm text-[var(--color-text-light)]">
                Choose a sticker and add it to your sheet!
              </p>
            </div>

            <span className="rounded-full border-2 border-white bg-[var(--color-surface-pink)] px-4 py-2 text-sm font-extrabold text-[var(--color-text)] shadow-sm">
              ♡ Sticker time!
            </span>
          </div>

          <div className="rounded-[32px] border-4 border-white bg-[var(--color-surface-pink)] p-3 shadow-[0_8px_0_rgba(223,118,170,0.16)] sm:p-5 lg:p-7">
            <StickerGallery onSelectSticker={addSticker} />
          </div>
        </section>
      </section>
    </>
  );
}
