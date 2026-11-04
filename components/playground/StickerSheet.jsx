
"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ColorWheel from "./ColorWheel";
import { useStickerStore } from "../../store/stickerStore";

const MIN_SIZE = 5;
const MAX_SIZE = 75;

const mainCategories = [
  "stickers",
  "doodles",
  "illustrations",
  "icons",
  "geometric",
  "abstract",
  "typography",
  "secret",
];

function formatCategory(value) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StickerSheet({
  stickers,
  setStickers,
  backgroundColor,
  setBackgroundColor,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [interaction, setInteraction] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("stickers");

  const trashRef = useRef(null);
  const sheetRef = useRef(null);

  const library = useStickerStore((state) => state.library);

  const hiddenStickerIds = useStickerStore(
    (state) => state.hiddenStickerIds
  );

  const selectedSticker = stickers.find(
    (sticker) => sticker.id === selectedId
  );

  const trayStickers = useMemo(
    () =>
      library.filter(
        (sticker) => !hiddenStickerIds.includes(sticker.id)
      ),
    [library, hiddenStickerIds]
  );

  const categoryOptions = useMemo(() => {
    const paths = new Set(mainCategories);

    library.forEach((sticker) => {
      const path = sticker.categoryPath || sticker.category;

      if (!path) return;

      const parts = path.split("/");

      for (let i = 1; i <= parts.length; i++) {
        paths.add(parts.slice(0, i).join("/"));
      }
    });

    return [...paths].map((value) => ({
      value,
      label: formatCategory(value.split("/").pop()),
      depth: value.split("/").length,
    }));
  }, [library]);

  const visibleTrayStickers = useMemo(
    () =>
      trayStickers.filter((sticker) => {
        const path = sticker.categoryPath || sticker.category || "";

        return (
          path === selectedCategory ||
          path.startsWith(`${selectedCategory}/`)
        );
      }),
    [trayStickers, selectedCategory]
  );

  const deleteSticker = useCallback(
    (id) => {
      setStickers((current) =>
        current.filter((sticker) => sticker.id !== id)
      );

      setSelectedId(null);
      setInteraction(null);
    },
    [setStickers]
  );

  // Deselect when clicking outside the editor.
  useEffect(() => {
    function handleOutsideClick(event) {
      const target = event.target;

      if (!(target instanceof Element)) return;
      if (target.closest("[data-sticker]")) return;
      if (target.closest("[data-editor-controls]")) return;
      if (target.closest("[data-sticker-tray]")) return;

      if (interaction) return;

      setSelectedId(null);
    }

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [interaction]);

  // Keyboard deletion.
  useEffect(() => {
    function handleKeyDown(event) {
      const tagName = event.target?.tagName;

      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT"
      ) {
        return;
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedId
      ) {
        event.preventDefault();
        deleteSticker(selectedId);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId, deleteSticker]);

  // Add a sticker to the sheet.
  function addSticker(sticker) {
    const newSticker = {
      ...sticker,
      id: crypto.randomUUID(),
      x: 50,
      y: 50,
      size: 18,
      rotation: 0,
    };

    setStickers((current) => [...current, newSticker]);
    setSelectedId(newSticker.id);
  }

  // Drag from the sticker tray.
  function handleTrayDragStart(event, sticker) {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify(sticker)
    );

    event.dataTransfer.effectAllowed = "copy";
  }

  // Drop onto the sheet.
  function handleDrop(event) {
    event.preventDefault();

    const data = event.dataTransfer.getData("application/json");

    if (!data) return;

    try {
      const sticker = JSON.parse(data);

      if (sticker?.src) {
        addSticker(sticker);
      }
    } catch (error) {
      console.error("Could not add sticker:", error);
    }
  }

  // Start moving, resizing or rotating.
  function startInteraction(event, sticker, mode) {
    event.preventDefault();
    event.stopPropagation();

    const sheet = sheetRef.current;

    if (!sheet) return;

    const rect = sheet.getBoundingClientRect();

    setSelectedId(sticker.id);

    setInteraction({
      id: sticker.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      originalX: sticker.x,
      originalY: sticker.y,
      originalSize: sticker.size,
      originalRotation: sticker.rotation ?? 0,
      sheetWidth: rect.width,
      sheetHeight: rect.height,
    });
  }

  // Handle all pointer movement.
  const handlePointerMove = useCallback(
    (event) => {
      if (!interaction) return;

      const {
        id,
        mode,
        startX,
        startY,
        originalX,
        originalY,
        originalSize,
        originalRotation,
        sheetWidth,
        sheetHeight,
      } = interaction;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      setStickers((current) =>
        current.map((sticker) => {
          if (sticker.id !== id) return sticker;

          if (mode === "move") {
            return {
              ...sticker,
              x: Math.max(
                0,
                Math.min(100, originalX + (deltaX / sheetWidth) * 100)
              ),
              y: Math.max(
                0,
                Math.min(100, originalY + (deltaY / sheetHeight) * 100)
              ),
            };
          }

          if (mode === "resize") {
            const change = (deltaX - deltaY) / 2;

            return {
              ...sticker,
              size: Math.min(
                MAX_SIZE,
                Math.max(MIN_SIZE, originalSize + change)
              ),
            };
          }

          if (mode === "rotate") {
            return {
              ...sticker,
              rotation: originalRotation + deltaX,
            };
          }

          return sticker;
        })
      );
    },
    [interaction, setStickers]
  );

  // Finish interaction and check whether sticker was dropped in trash.
  const handlePointerUp = useCallback(
    (event) => {
      if (!interaction) return;

      if (interaction.mode === "move" && trashRef.current) {
        const rect = trashRef.current.getBoundingClientRect();

        const droppedInTrash =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (droppedInTrash) {
          deleteSticker(interaction.id);
          return;
        }
      }

      setInteraction(null);
    },
    [interaction, deleteSticker]
  );

  // Listen globally while an interaction is active.
  useEffect(() => {
    if (!interaction) return;

    function onCancel() {
      setInteraction(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", onCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [interaction, handlePointerMove, handlePointerUp]);

  return (
    <section className="relative h-[90svh] max-h-[90vh] min-h-[420px] w-full overflow-hidden">
      {/* TOY IPAD FRAME */}
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border-[5px] border-white bg-[var(--color-surface-blue)] p-2 shadow-[0_10px_0_rgba(117,182,233,0.22)] sm:rounded-[36px] sm:border-[7px] sm:p-3">

        {/* DECORATIVE BACKGROUND */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
          viewBox="0 0 900 700"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="toyPattern"
              width="90"
              height="90"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M20 12 L23 20 L31 23 L23 26 L20 34 L17 26 L9 23 L17 20 Z"
                fill="#ffffff"
              />
              <circle cx="65" cy="65" r="4" fill="#f5a6ca" />
              <path
                d="M48 12 C40 4 31 16 48 27 C65 16 56 4 48 12Z"
                fill="#cdb9f5"
              />
            </pattern>
          </defs>

          <rect width="900" height="700" fill="url(#toyPattern)" />
        </svg>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2">

          {/* TABLET TOP BAR */}
          <header className="flex shrink-0 items-center justify-between gap-2 rounded-[18px] border-[3px] border-white bg-[var(--color-surface-pink)] px-3 py-2 shadow-sm sm:rounded-[22px] sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-lg shadow-sm">
                ♡
              </span>

              <div className="min-w-0">
                <h3 className="truncate font-heading text-base font-bold text-[var(--color-text)] sm:text-lg">
                  My little sticker iPad
                </h3>

                <p className="hidden text-[10px] font-bold text-[var(--color-text-light)] sm:block">
                  Your creative playground
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full border-2 border-white bg-[var(--color-surface-yellow)] px-3 py-1.5 text-[10px] font-extrabold text-[var(--color-text)] sm:text-xs">
              ✦ CREATIVE SPACE
            </span>
          </header>

          {/* STICKER TRAY */}
          <div
            data-sticker-tray
            className="shrink-0 rounded-[18px] border-[3px] border-white bg-white/90 p-2 shadow-sm sm:rounded-[22px] sm:p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="font-heading text-sm font-bold text-[var(--color-text)] sm:text-base">
                Sticker tray
              </h4>

              <span className="text-[10px] font-bold text-[var(--color-text-light)]">
                Drag onto your paper ✧
              </span>
            </div>

            {/* CATEGORIES */}
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {categoryOptions.map((category, index) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`shrink-0 rounded-full border-2 border-white px-3 py-1.5 text-[10px] font-extrabold shadow-sm transition sm:text-xs ${
                    selectedCategory === category.value
                      ? "bg-[var(--color-primary)] ring-2 ring-[var(--color-primary-dark)]"
                      : index % 4 === 0
                        ? "bg-[var(--color-surface-pink)]"
                        : index % 4 === 1
                          ? "bg-[var(--color-surface-blue)]"
                          : index % 4 === 2
                            ? "bg-[var(--color-surface-purple)]"
                            : "bg-[var(--color-surface-yellow)]"
                  }`}
                >
                  {category.depth > 1 ? "↳ " : ""}
                  {category.label}
                </button>
              ))}
            </div>

            {/* STICKER PREVIEWS */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {visibleTrayStickers.length > 0 ? (
                visibleTrayStickers.map((sticker) => (
                  <button
                    key={sticker.id}
                    type="button"
                    draggable="true"
                    onDragStart={(event) =>
                      handleTrayDragStart(event, sticker)
                    }
                    onClick={() => addSticker(sticker)}
                    title={`Add ${sticker.name} to your sheet`}
                    className="toy-hover flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-[var(--color-surface-pink)] p-2 shadow-sm transition sm:h-[76px] sm:w-[76px]"
                  >
                    <Image
                      src={sticker.src}
                      alt={sticker.name}
                      width={120}
                      height={120}
                      draggable={false}
                      unoptimized={sticker.src.toLowerCase().endsWith(".svg")}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))
              ) : (
                <p className="py-3 text-xs text-[var(--color-text-light)]">
                  No stickers in this category yet.
                </p>
              )}
            </div>
          </div>

          {/* FULL SIZE WORKSPACE */}
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-[16px] border-2 border-white/70 bg-white/30 p-1 shadow-inner sm:rounded-[20px] sm:p-1.5">
            <div className="flex h-full min-h-0 w-full items-center justify-center">
              <div
                ref={sheetRef}
                data-a4-sheet
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className="relative h-full w-full overflow-visible rounded-md shadow-[0_5px_18px_rgba(65,50,70,0.18)]"
                style={{
                  backgroundColor,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5 L32 12 L39 15 L32 18 L30 25 L28 18 L21 15 L28 12Z' fill='%23f5a6ca' fill-opacity='.10'/%3E%3C/svg%3E")`,
                }}
              >
                {stickers.map((sticker) => {
                  const isSelected = selectedId === sticker.id;

                  return (
                    <div
                      key={sticker.id}
                      data-sticker
                      data-sticker-id={sticker.id}
                      onPointerDown={(event) =>
                        startInteraction(event, sticker, "move")
                      }
                      onClick={() => setSelectedId(sticker.id)}
                      className="absolute flex cursor-grab items-center justify-center active:cursor-grabbing"
                      style={{
                        left: `${sticker.x}%`,
                        top: `${sticker.y}%`,
                        width: `${sticker.size}%`,
                        aspectRatio: "1",
                        transform: `translate(-50%, -50%) rotate(${sticker.rotation ?? 0}deg)`,
                        zIndex: isSelected ? 100 : 10,
                        touchAction: "none",
                      }}
                    >
                      <Image
                        src={sticker.src}
                        alt={sticker.name}
                        fill
                        unoptimized={sticker.src.toLowerCase().endsWith(".svg")}
                        draggable={false}
                        className="pointer-events-none select-none object-contain"
                      />

                      {isSelected && (
                        <>
                          {/* SELECTION BORDER */}
                          <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-[var(--color-primary-dark)]" />

                          {/* ROTATE HANDLE */}
                          <button
                            type="button"
                            aria-label="Rotate sticker"
                            onPointerDown={(event) =>
                              startInteraction(event, sticker, "rotate")
                            }
                            className="absolute -top-8 left-1/2 z-30 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-[var(--color-surface-purple)] text-lg shadow-md cursor-grab"
                            style={{ touchAction: "none" }}
                          >
                            ↻
                          </button>

                          {/* RESIZE HANDLE */}
                          <button
                            type="button"
                            aria-label="Resize sticker"
                            onPointerDown={(event) =>
                              startInteraction(event, sticker, "resize")
                            }
                            className="absolute -bottom-3 -right-3 z-30 h-7 w-7 rounded-full border-2 border-white bg-[var(--color-primary)] shadow-md cursor-nwse-resize"
                            style={{ touchAction: "none" }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TOOLBAR */}
          <footer
            data-editor-controls
            className="relative z-20 flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-[18px] border-[3px] border-white bg-[var(--color-surface-yellow)] px-2 py-2 shadow-sm sm:rounded-[22px] sm:px-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-xs font-bold text-[var(--color-text)]">
                {selectedSticker
                  ? `♡ ${selectedSticker.name}`
                  : "Ready to create!"}
              </span>

              <button
                type="button"
                onClick={() => setShowColorPicker((current) => !current)}
                className="toy-hover flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[var(--color-surface-purple)] text-base shadow-sm"
                title="Change paper color"
                aria-label="Change paper color"
              >
                🎨
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!selectedId}
                onClick={() => selectedId && deleteSticker(selectedId)}
                className="toy-hover rounded-full border-2 border-white bg-[var(--color-surface-pink)] px-3 py-1.5 text-[10px] font-extrabold text-[var(--color-text)] shadow-sm disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
              >
                Delete
              </button>

              <button
                type="button"
                disabled={stickers.length === 0}
                onClick={() => {
                  setStickers([]);
                  setSelectedId(null);
                  setInteraction(null);
                }}
                className="toy-hover rounded-full border-2 border-white bg-[var(--color-surface-blue)] px-3 py-1.5 text-[10px] font-extrabold text-[var(--color-text)] shadow-sm disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
              >
                Clear
              </button>

              {/* TRASH */}
              <div
                ref={trashRef}
                className="flex h-8 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-white bg-[var(--color-surface-pink)] text-base shadow-sm"
                title="Drop a sticker here to delete it"
                aria-label="Drop a sticker here to delete it"
              >
                🗑️
              </div>
            </div>

            {/* COLOR PICKER */}
            {showColorPicker && (
              <div className="absolute bottom-full left-2 z-50 mb-2 max-h-[45vh] w-[min(340px,90vw)] overflow-y-auto rounded-[22px] border-4 border-white bg-[var(--color-surface-purple)] p-3 shadow-[0_8px_25px_rgba(65,50,70,0.2)]">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-heading text-sm font-bold text-[var(--color-text)]">
                    Paper color
                  </h4>

                  <button
                    type="button"
                    onClick={() => setShowColorPicker(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white text-sm font-bold"
                    aria-label="Close color picker"
                  >
                    ×
                  </button>
                </div>

                <ColorWheel
                  backgroundColor={backgroundColor}
                  setBackgroundColor={setBackgroundColor}
                />
              </div>
            )}
          </footer>
        </div>
      </div>
    </section>
  );
}
