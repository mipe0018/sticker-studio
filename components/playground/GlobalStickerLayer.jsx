
"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStickerStore } from "../../store/stickerStore";

export default function GlobalStickerLayer({ children }) {
  const pathname = usePathname();

  const [selectedId, setSelectedId] = useState(null);
  const interactionRef = useRef(null);
  const wrapperRef = useRef(null);

  const allFloatingStickers = useStickerStore(
    (state) => state.floatingStickers
  );

  const floatingStickers = allFloatingStickers.filter((sticker) => {
    // Older stickers without pagePath stay on the homepage
    const stickerPage = sticker.pagePath || "/";
    return stickerPage === pathname;
  });

  const visibleSelectedId = floatingStickers.some(
    (sticker) => sticker.id === selectedId
  )
    ? selectedId
    : null;

  const addFloatingSticker = useStickerStore(
    (state) => state.addFloatingSticker
  );

  const updateFloatingSticker = useStickerStore(
    (state) => state.updateFloatingSticker
  );

  const deleteFloatingSticker = useStickerStore(
    (state) => state.deleteFloatingSticker
  );

  // RESET ACTIVE INTERACTION WHEN CHANGING PAGE
  useEffect(() => {
    interactionRef.current = null;
  }, [pathname]);

  // HANDLE DRAG OVER
  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  // HANDLE DROP
  function handleDrop(event) {
    const target = event.target;

    // Let the A4 sheet handle its own stickers
    if (
      target instanceof Element &&
      target.closest("[data-a4-sheet]")
    ) {
      return;
    }

    event.preventDefault();

    try {
      const sticker = JSON.parse(
        event.dataTransfer.getData("application/json")
      );

      if (!sticker?.src) return;

      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newId = addFloatingSticker(
        sticker,
        x,
        y,
        pathname
      );

      setSelectedId(newId);
    } catch {
      // Ignore invalid drop data
    }
  }

  // START MOVE, ROTATE OR RESIZE
  function startInteraction(event, sticker, mode) {
    event.preventDefault();
    event.stopPropagation();

    setSelectedId(sticker.id);

    interactionRef.current = {
      id: sticker.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      originalX: sticker.x,
      originalY: sticker.y,
      originalSize: sticker.size || 100,
      originalRotation: sticker.rotation || 0,
    };
  }

  // HANDLE POINTER MOVEMENT
  useEffect(() => {
    function handlePointerMove(event) {
      const interaction = interactionRef.current;
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
      } = interaction;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (mode === "move") {
        updateFloatingSticker(id, {
          x: originalX + deltaX,
          y: originalY + deltaY,
        });
      }

      if (mode === "rotate") {
        updateFloatingSticker(id, {
          rotation: originalRotation + deltaX * 1.5,
        });
      }

      if (mode === "resize") {
        const change = (deltaX + deltaY) / 2;

        updateFloatingSticker(id, {
          size: Math.max(
            30,
            Math.min(400, originalSize + change)
          ),
        });
      }
    }

    function handlePointerUp() {
      interactionRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [updateFloatingSticker]);

  // DESELECT WHEN CLICKING OUTSIDE
  function handleOutsideClick(event) {
    const target = event.target;

    if (
      target instanceof Element &&
      !target.closest("[data-floating-sticker]")
    ) {
      setSelectedId(null);
    }
  }

  // DELETE SELECTED STICKER WITH KEYBOARD
  useEffect(() => {
    function handleKeyDown(event) {
      const activeTag = document.activeElement?.tagName;

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        visibleSelectedId &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)
      ) {
        event.preventDefault();
        deleteFloatingSticker(visibleSelectedId);
        setSelectedId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visibleSelectedId, deleteFloatingSticker]);

  return (
    <div
      ref={wrapperRef}
      className="relative flex min-h-screen flex-col"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPointerDownCapture={handleOutsideClick}
      tabIndex={-1}
    >
      {children}

      <div className="pointer-events-none absolute inset-0 z-40">
        {floatingStickers.map((sticker) => {
          const isSelected = visibleSelectedId === sticker.id;

          return (
            <div
              key={sticker.id}
              data-floating-sticker
              className="pointer-events-auto absolute touch-none"
              style={{
                left: `${sticker.x}px`,
                top: `${sticker.y}px`,
                width: `${sticker.size || 100}px`,
                height: `${sticker.size || 100}px`,
                transform: `rotate(${sticker.rotation || 0}deg)`,
                transformOrigin: "center center",
              }}
              onPointerDown={(event) =>
                startInteraction(event, sticker, "move")
              }
            >
              <div
                className={`relative h-full w-full cursor-move rounded-lg ${
                  isSelected
                    ? "outline outline-2 outline-dashed outline-[var(--color-primary)]"
                    : ""
                }`}
              >
                <Image
                  src={sticker.src}
                  alt={sticker.name}
                  width={500}
                  height={500}
                  draggable={false}
                  loading="eager"
                  unoptimized={sticker.src
                    .toLowerCase()
                    .endsWith(".svg")}
                  className="pointer-events-none h-full w-full select-none object-contain"
                />
              </div>

              {isSelected && (
                <>
                  <button
                    type="button"
                    aria-label="Roter sticker"
                    title="Træk for at rotere"
                    onPointerDown={(event) =>
                      startInteraction(event, sticker, "rotate")
                    }
                    className="absolute left-1/2 top-0 z-50 flex h-7 w-7 -translate-x-1/2 -translate-y-[150%] cursor-grab items-center justify-center rounded-full border-2 border-white bg-blue-300 text-white shadow-md hover:bg-blue-400 active:cursor-grabbing"
                  >
                    <span className="text-lg leading-none">↻</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Ændr størrelse"
                    title="Træk for at ændre størrelse"
                    onPointerDown={(event) =>
                      startInteraction(event, sticker, "resize")
                    }
                    className="absolute bottom-0 right-0 z-50 h-5 w-5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-full border-2 border-white bg-pink-400 shadow-md hover:bg-pink-500"
                  />

                  <button
                    type="button"
                    aria-label="Slet sticker"
                    title="Slet sticker"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteFloatingSticker(sticker.id);
                      setSelectedId(null);
                    }}
                    className="absolute right-0 top-0 z-50 flex h-6 w-6 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-red-400 text-sm font-bold text-white shadow-md hover:bg-red-500"
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
