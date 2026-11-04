export interface StickerLibraryItem {
  id: string;
  name: string;
  category: string;
  categoryPath: string;
  mainCategory: string;
  src: string;
}

export interface SheetSticker extends StickerLibraryItem {
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface FloatingSticker extends StickerLibraryItem {
  x: number;
  y: number;
  size: number;
}

export interface StickerCategory {
  value: string;
  label: string;
  mainCategory: string;
}

export interface StickerStoreState {
  library: StickerLibraryItem[];
  stickers: SheetSticker[];
  floatingStickers: FloatingSticker[];
  hiddenStickerIds: string[];
  favorites: string[];
  backgroundColor: string;
  setLibrary: (newStickers: StickerLibraryItem[]) => void;
  addSticker: (sticker: StickerLibraryItem) => void;
  addFloatingSticker: (
    sticker: StickerLibraryItem,
    x: number,
    y: number
  ) => void;
  moveFloatingSticker: (id: string, x: number, y: number) => void;
  deleteFloatingSticker: (id: string) => void;
  hideStickerFromGallery: (id: string) => void;
  restoreStickerToGallery: (id: string) => void;
  updateSticker: (id: string, updates: Partial<SheetSticker>) => void;
  setStickers: (
    updates:
      | SheetSticker[]
      | ((current: SheetSticker[]) => SheetSticker[])
  ) => void;
  deleteSticker: (id: string) => void;
  clearSheet: () => void;
  setBackgroundColor: (color: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}
