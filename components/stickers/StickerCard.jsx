
import Image from "next/image";

/**
 * @param {object} props
 * @param {import("../../types").StickerLibraryItem} props.sticker
 * @param {(sticker: import("../../types").StickerLibraryItem) => void} [props.onSelect]
 * @param {boolean} props.isFavorite
 * @param {(id: string) => void} props.onToggleFavorite
 * @param {() => void} props.onHide
 */
export default function StickerCard({
  sticker,
  onSelect,
  isFavorite,
  onToggleFavorite,
  onHide,
}) {
  /** @param {import("react").DragEvent<HTMLButtonElement>} event */
  function handleDragStart(event) {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify(sticker)
    );

    event.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div className="relative flex aspect-square flex-col rounded-2xl border border-(--color-border) bg-white p-3 transition hover:-translate-y-1 hover:shadow-(--shadow-soft)">
      {/* FAVORITE */}
      <button
        type="button"
        aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
        onClick={() => onToggleFavorite(sticker.id)}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow-sm transition hover:scale-110"
      >
        <span className={isFavorite ? "text-pink-600" : "text-gray-400"}>
          ♥
        </span>
      </button>

      {/* STICKER */}
      <button
        type="button"
        draggable="true"
        onClick={() => onSelect?.(sticker)}
        onDragStart={handleDragStart}
        className="flex min-h-0 flex-1 items-center justify-center p-3"
        title="Drag sticker onto your website or A4 sheet"
      >
        <Image
          src={sticker.src}
          alt={sticker.name}
          width={500}
          height={500}
          draggable={false}
          loading="eager"
          decoding="auto"
          unoptimized={sticker.src.toLowerCase().endsWith(".svg")}
          className="h-full w-full select-none object-contain"
        />
      </button>

      {/* NAME */}
      <p className="truncate px-1 pt-1 text-center text-sm font-medium capitalize">
        {sticker.name}
      </p>

      {/* HIDE FROM GALLERY */}
      <button
        type="button"
        onClick={onHide}
        className="mt-2 rounded-full border border-(--color-border) px-3 py-1.5 text-xs transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        Remove from gallery
      </button>
    </div>
  );
}
