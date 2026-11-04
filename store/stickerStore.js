
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** @typedef {import("../types").StickerLibraryItem} StickerLibraryItem */
/** @typedef {import("../types").SheetSticker} SheetSticker */
/** @typedef {import("../types").FloatingSticker} FloatingSticker */
/** @typedef {import("../types").StickerStoreState} StickerStoreState */

export const useStickerStore = create(
  persist(
    (set, get) => ({
      // STICKER LIBRARY
      library: [],

      // STICKERS PLACED ON A4
      stickers: [],

      // STICKERS PLACED ON THE WEBSITE
      floatingStickers: [],

      // HIDDEN STICKERS
      hiddenStickerIds: [],

      // FAVORITES
      favorites: [],

      // BACKGROUND COLOR
      backgroundColor: "#FFFFFF",

      // UPDATE LIBRARY FROM API
      setLibrary: (newStickers) =>
        set({ library: newStickers }),

      // ADD STICKER TO A4
      addSticker: (sticker) =>
        set((state) => ({
          stickers: [
            ...state.stickers,
            {
              ...sticker,
              id: crypto.randomUUID(),
              x: 50,
              y: 50,
              size: 18,
              rotation: 0,
            },
          ],
        })),

      // ADD STICKER TO WEBSITE
      addFloatingSticker: (sticker, x, y, pagePath = "/") => {
        const id = crypto.randomUUID();

        set((state) => ({
          floatingStickers: [
            ...state.floatingStickers,
            {
              ...sticker,
              id,
              x,
              y,
              size: 100,
              rotation: 0,
              pagePath,
            },
          ],
        }));

        return id;
      },

      // MOVE FLOATING STICKER
      moveFloatingSticker: (id, x, y) =>
        set((state) => ({
          floatingStickers: state.floatingStickers.map((sticker) =>
            sticker.id === id
              ? { ...sticker, x, y }
              : sticker
          ),
        })),

      // UPDATE SIZE, ROTATION OR POSITION OF FLOATING STICKER
      updateFloatingSticker: (id, updates) =>
        set((state) => ({
          floatingStickers: state.floatingStickers.map((sticker) =>
            sticker.id === id
              ? { ...sticker, ...updates }
              : sticker
          ),
        })),

      // DELETE FLOATING STICKER
      deleteFloatingSticker: (id) =>
        set((state) => ({
          floatingStickers: state.floatingStickers.filter(
            (sticker) => sticker.id !== id
          ),
        })),

      // HIDE STICKER FROM GALLERY
      hideStickerFromGallery: (id) =>
        set((state) => ({
          hiddenStickerIds: state.hiddenStickerIds.includes(id)
            ? state.hiddenStickerIds
            : [...state.hiddenStickerIds, id],
        })),

      // RESTORE STICKER TO GALLERY
      restoreStickerToGallery: (id) =>
        set((state) => ({
          hiddenStickerIds: state.hiddenStickerIds.filter(
            (hiddenId) => hiddenId !== id
          ),
        })),

      // UPDATE A4 STICKER
      updateSticker: (id, updates) =>
        set((state) => ({
          stickers: state.stickers.map((sticker) =>
            sticker.id === id
              ? { ...sticker, ...updates }
              : sticker
          ),
        })),

      // REPLACE OR UPDATE A4 STICKERS
      setStickers: (updates) =>
        set((state) => ({
          stickers:
            typeof updates === "function"
              ? updates(state.stickers)
              : updates,
        })),

      // DELETE STICKER FROM A4
      deleteSticker: (id) =>
        set((state) => ({
          stickers: state.stickers.filter(
            (sticker) => sticker.id !== id
          ),
        })),

      // CLEAR A4 SHEET
      clearSheet: () => set({ stickers: [] }),

      // CHANGE BACKGROUND
      setBackgroundColor: (color) =>
        set({ backgroundColor: color }),

      // TOGGLE FAVORITE
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter(
                (favoriteId) => favoriteId !== id
              )
            : [...state.favorites, id],
        })),

      // CHECK FAVORITE
      isFavorite: (id) => get().favorites.includes(id),
    }),
    {
      name: "sticker-studio-storage",

      // KEEP SAVED USER DATA AFTER REFRESH
      partialize: (state) => ({
        stickers: state.stickers,
        floatingStickers: state.floatingStickers,
        hiddenStickerIds: state.hiddenStickerIds,
        favorites: state.favorites,
        backgroundColor: state.backgroundColor,
      }),
    }
  )
);
