
"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import StickerCard from "./StickerCard";
import { useStickerStore } from "../../store/stickerStore";

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

export default function StickerGallery({
  onSelectSticker,
  showManagement = false,
}) {
  const library = useStickerStore((state) => state.library);
  const favorites = useStickerStore((state) => state.favorites);
  const toggleFavorite = useStickerStore((state) => state.toggleFavorite);

  const hiddenStickerIds = useStickerStore(
    (state) => state.hiddenStickerIds
  );

  const hideStickerFromGallery = useStickerStore(
    (state) => state.hideStickerFromGallery
  );

  const restoreStickerToGallery = useStickerStore(
    (state) => state.restoreStickerToGallery
  );

  const setLibrary = useStickerStore((state) => state.setLibrary);

  const [categories, setCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const [file, setFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState("stickers");

  const [parentCategory, setParentCategory] = useState("stickers");
  const [newCategory, setNewCategory] = useState("");

  const [uploading, setUploading] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  function formatCategory(value) {
    return value
      .split("/")
      .map((part) =>
        part
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
      )
      .join(" / ");
  }

  const loadLibrary = useCallback(async () => {
    try {
      const response = await fetch("/api/stickers", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load stickers.");
      }

      setLibrary(result.stickers || []);
      setCategories(result.categories || []);

      return true;
    } catch (error) {
      setMessage(error.message || "Could not load the sticker library.");
      setMessageType("error");
      return false;
    }
  }, [setLibrary]);

  useEffect(() => {
    void Promise.resolve().then(loadLibrary);
  }, [loadLibrary]);

  const visibleStickers = useMemo(
    () =>
      library.filter(
        (sticker) => !hiddenStickerIds.includes(sticker.id)
      ),
    [library, hiddenStickerIds]
  );

  const hiddenStickers = useMemo(
    () =>
      library.filter((sticker) =>
        hiddenStickerIds.includes(sticker.id)
      ),
    [library, hiddenStickerIds]
  );

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((item) => item.value.includes("/"))
        .sort((a, b) => a.value.localeCompare(b.value)),
    [categories]
  );

  // Find direct subcategories of the selected folder.
  const subcategories = useMemo(() => {
    if (!selectedMain) return [];

    const parentPath = selectedPath || selectedMain;

    return categories
      .filter((item) => {
        const parts = item.value.split("/");
        const parent = parts.slice(0, -1).join("/");

        return parent === parentPath;
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories, selectedMain, selectedPath]);

  // Stickers belonging directly to the selected folder.
  const folderStickers = useMemo(() => {
    if (!selectedPath) return [];

    return visibleStickers.filter(
      (sticker) =>
        (sticker.categoryPath || sticker.category) === selectedPath
    );
  }, [visibleStickers, selectedPath]);

  const filteredFolderStickers = useMemo(
    () =>
      folderStickers.filter((sticker) =>
        sticker.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [folderStickers, searchTerm]
  );

  const filteredFavorites = useMemo(
    () =>
      visibleStickers.filter(
        (sticker) =>
          favorites.includes(sticker.id) &&
          sticker.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [visibleStickers, favorites, searchTerm]
  );

  const filteredHiddenStickers = hiddenStickers.filter((sticker) =>
    sticker.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function selectMainCategory(categoryPath) {
    setSelectedMain(categoryPath);
    setSelectedPath(categoryPath);
    setShowHidden(false);
    setShowFavorites(false);
    setSearchTerm("");
  }

  function openSubcategory(categoryPath) {
    setSelectedPath(categoryPath);
    setSearchTerm("");
  }

  function showAllCategories() {
    setSelectedMain(null);
    setSelectedPath(null);
    setShowHidden(false);
    setShowFavorites(false);
    setSearchTerm("");
  }

  function goBack() {
    if (!selectedPath || selectedPath === selectedMain) return;

    const parts = selectedPath.split("/");
    parts.pop();

    setSelectedPath(parts.join("/"));
    setSearchTerm("");
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;

    setMessage("");
    setFile(null);

    if (!selectedFile) return;

    const extension = selectedFile.name
      .slice(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (![".svg", ".png"].includes(extension)) {
      setMessage("Please select an SVG or PNG file.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setMessage("The file must be smaller than 2 MB.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload(event) {
    event.preventDefault();

    const form = event.currentTarget;
    setMessage("");

    if (!file) {
      setMessage("Please choose a file first.");
      setMessageType("error");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("category", uploadCategory);

      const response = await fetch("/api/stickers", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed.");
      }

      const refreshed = await loadLibrary();

      if (!refreshed) {
        throw new Error(
          "Sticker uploaded, but the gallery could not refresh."
        );
      }

      const mainCategory = result.sticker.categoryPath.split("/")[0];

      setSelectedMain(mainCategory);
      setSelectedPath(result.sticker.categoryPath);
      setShowHidden(false);
      setShowFavorites(false);
      setSearchTerm("");
      setFile(null);

      form.reset();

      setMessage("Your sticker was uploaded successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateCategory(event) {
    event.preventDefault();
    setMessage("");

    if (!newCategory.trim()) {
      setMessage("Please enter a category name.");
      setMessageType("error");
      return;
    }

    setCreatingCategory(true);

    try {
      const response = await fetch("/api/stickers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create-category",
          parentCategory,
          newCategory,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not create category."
        );
      }

      const refreshed = await loadLibrary();

      if (!refreshed) {
        throw new Error(
          "Category created, but the gallery could not refresh."
        );
      }

      const mainCategory = result.category.value.split("/")[0];

      setUploadCategory(result.category.value);
      setParentCategory(result.category.value);
      setSelectedMain(mainCategory);
      setSelectedPath(result.category.value);
      setShowHidden(false);
      setShowFavorites(false);
      setNewCategory("");

      setMessage("Category created successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
      setMessageType("error");
    } finally {
      setCreatingCategory(false);
    }
  }

  return (
    <div className="w-full">
      {/* GALLERY HEADER */}
      <div className="mb-5">
        <h3 className="mb-1 font-heading text-2xl font-bold">
          Your sticker collection
        </h3>

        <p className="text-sm text-[var(--color-text-light)]">
          Pick a category and explore your creative collection.
        </p>
      </div>

      {/* MANAGEMENT */}
      {showManagement && (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {/* CREATE CATEGORY */}
          <form
            onSubmit={handleCreateCategory}
            className="toy-shadow rounded-[24px] border-4 border-white bg-[var(--color-surface-purple)] p-4"
          >
            <h4 className="mb-1 font-heading text-lg font-bold">
              ✨ Create a category
            </h4>

            <p className="mb-3 text-sm text-[var(--color-text-light)]">
              Create folders and subcategories.
            </p>

            <div className="flex flex-col gap-3">
              <label
                htmlFor="create-parent-category"
                className="text-sm font-bold"
              >
                Create inside
              </label>

              <select
                id="create-parent-category"
                value={parentCategory}
                onChange={(event) =>
                  setParentCategory(event.target.value)
                }
                className="w-full rounded-2xl border-2 border-white bg-white px-4 py-3 text-sm"
              >
                {mainCategories.map((item) => (
                  <option key={item} value={item}>
                    {formatCategory(item)}
                  </option>
                ))}

                {categoryOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {formatCategory(item.value)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="New category name"
                aria-label="New category name"
                className="w-full rounded-2xl border-2 border-white bg-white px-4 py-3 text-sm"
              />

              <button
                type="submit"
                disabled={creatingCategory || !newCategory.trim()}
                className="toy-hover rounded-full border-2 border-white bg-[var(--color-primary)] px-5 py-3 text-sm font-extrabold shadow-sm disabled:opacity-50"
              >
                {creatingCategory ? "Creating..." : "+ Create category"}
              </button>
            </div>
          </form>

          {/* UPLOAD */}
          <form
            onSubmit={handleUpload}
            className="toy-shadow rounded-[24px] border-4 border-white bg-[var(--color-surface-blue)] p-4"
          >
            <h4 className="mb-1 font-heading text-lg font-bold">
              🎀 Add your own sticker
            </h4>

            <p className="mb-3 text-sm text-[var(--color-text-light)]">
              Upload your own SVG or PNG design.
            </p>

            <div className="flex flex-col gap-3">
              <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-white bg-white/70 p-4 text-center transition hover:bg-white">
                <span className="mb-1 block text-2xl">＋</span>
                <span className="block text-sm font-bold">
                  Choose file from computer
                </span>
                <span className="mt-1 block text-xs text-[var(--color-text-light)]">
                  SVG or PNG · Maximum 2 MB
                </span>

                <input
                  type="file"
                  accept=".svg,.png,image/svg+xml,image/png"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              {file && (
                <p className="break-all rounded-xl bg-white p-3 text-sm">
                  Selected: {file.name}
                </p>
              )}

              <label
                htmlFor="upload-category"
                className="text-sm font-bold"
              >
                Save sticker in
              </label>

              <select
                id="upload-category"
                value={uploadCategory}
                onChange={(event) =>
                  setUploadCategory(event.target.value)
                }
                className="w-full rounded-2xl border-2 border-white bg-white px-4 py-3 text-sm"
              >
                {mainCategories.map((item) => (
                  <option key={item} value={item}>
                    {formatCategory(item)}
                  </option>
                ))}

                {categoryOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {formatCategory(item.value)}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={uploading || !file}
                className="toy-hover rounded-full border-2 border-white bg-[var(--color-blue)] px-5 py-3 text-sm font-extrabold shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload sticker"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STATUS MESSAGE */}
      {message && (
        <p
          role="status"
          className={`mb-5 rounded-2xl px-4 py-3 text-sm font-bold ${
            messageType === "error"
              ? "bg-red-50 text-red-600"
              : messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-[var(--color-surface-blue)] text-[var(--color-text)]"
          }`}
        >
          {message}
        </p>
      )}

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search your stickers..."
          aria-label="Search stickers"
          className="w-full rounded-full border-2 border-white bg-white px-5 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--color-primary)]"
        />
      </div>

      {/* GALLERY FILTERS */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={showAllCategories}
          className={`toy-hover rounded-full border-2 border-white px-4 py-2 text-sm font-extrabold ${
            !showHidden && !showFavorites
              ? "bg-[var(--color-primary)] shadow-sm"
              : "bg-white"
          }`}
        >
          ✿ Gallery
        </button>

        <button
          type="button"
          onClick={() => {
            setShowHidden(false);
            setShowFavorites(true);
            setSelectedMain(null);
            setSelectedPath(null);
          }}
          className={`toy-hover rounded-full border-2 border-white px-4 py-2 text-sm font-extrabold ${
            showFavorites && !showHidden
              ? "bg-[var(--color-surface-pink)] shadow-sm"
              : "bg-white"
          }`}
        >
          ♥ Favorites
        </button>

        <button
          type="button"
          onClick={() => {
            setShowHidden(true);
            setShowFavorites(false);
            setSelectedMain(null);
            setSelectedPath(null);
          }}
          className={`toy-hover rounded-full border-2 border-white px-4 py-2 text-sm font-extrabold ${
            showHidden
              ? "bg-[var(--color-blue)] shadow-sm"
              : "bg-white"
          }`}
        >
          Hidden ({hiddenStickers.length})
        </button>
      </div>

      {!showHidden && !showFavorites ? (
        <>
          {/* MAIN CATEGORIES - ONE HORIZONTAL ROW */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-heading text-lg font-bold">
                Explore categories
              </h4>
              <span className="text-xs font-bold text-[var(--color-text-light)]">
                Scroll to explore →
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-3">
              {mainCategories.map((item, index) => {
                const colors = [
                  "bg-[var(--color-surface-pink)]",
                  "bg-[var(--color-surface-blue)]",
                  "bg-[var(--color-surface-purple)]",
                  "bg-[var(--color-surface-yellow)]",
                ];

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectMainCategory(item)}
                    className={`toy-hover shrink-0 rounded-full border-2 border-white px-5 py-3 text-sm font-extrabold transition ${
                      colors[index % colors.length]
                    } ${
                      selectedMain === item
                        ? "ring-2 ring-[var(--color-primary-dark)] shadow-md"
                        : "shadow-sm"
                    }`}
                  >
                    {formatCategory(item)}
                    {selectedMain === item && (
                      <span className="ml-2">♡</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUBCATEGORIES - TWO COLUMNS */}
          {!selectedMain ? (
            <EmptyState message="Choose a category above to explore your stickers." />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary-dark)]">
                    Your category
                  </p>
                  <h4 className="font-heading text-xl font-bold">
                    {formatCategory(selectedMain)}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={showAllCategories}
                  className="text-xs font-bold text-[var(--color-primary-dark)] hover:underline"
                >
                  All categories
                </button>
              </div>

              {selectedPath !== selectedMain && (
                <button
                  type="button"
                  onClick={goBack}
                  className="mb-4 text-sm font-bold text-[var(--color-primary-dark)] hover:underline"
                >
                  ← Back
                </button>
              )}

              {subcategories.length > 0 ? (
                <div className="mb-6 grid grid-cols-2 gap-3">
                  {subcategories.map((item, index) => {
                    const colors = [
                      "bg-[var(--color-surface-pink)]",
                      "bg-[var(--color-surface-blue)]",
                      "bg-[var(--color-surface-purple)]",
                      "bg-[var(--color-surface-yellow)]",
                    ];

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => openSubcategory(item.value)}
                        className={`toy-hover flex min-h-16 items-center justify-between gap-2 rounded-[20px] border-2 border-white px-4 py-3 text-left text-sm font-extrabold shadow-sm transition ${
                          colors[index % colors.length]
                        }`}
                      >
                        <span>
                          {formatCategory(item.value.split("/").pop())}
                        </span>
                        <span aria-hidden="true">→</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mb-5 text-sm text-[var(--color-text-light)]">
                  No subcategories yet. You can create one above.
                </p>
              )}

              {/* STICKERS IN SELECTED FOLDER */}
              {filteredFolderStickers.length > 0 && (
                <StickerShelf
                  title={
                    selectedPath === selectedMain
                      ? "Stickers in this category"
                      : formatCategory(selectedPath)
                  }
                  stickers={filteredFolderStickers}
                  onSelectSticker={onSelectSticker}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  hideStickerFromGallery={hideStickerFromGallery}
                />
              )}

              {subcategories.length === 0 &&
                filteredFolderStickers.length === 0 && (
                  <EmptyState message="This category is waiting for some stickers!" />
                )}
            </>
          )}
        </>
      ) : showFavorites ? (
        filteredFavorites.length > 0 ? (
          <StickerShelf
            title="Your favorite stickers"
            stickers={filteredFavorites}
            onSelectSticker={onSelectSticker}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            hideStickerFromGallery={hideStickerFromGallery}
          />
        ) : (
          <EmptyState message="You have no favorite stickers yet." />
        )
      ) : (
        <>
          <p className="mb-5 text-sm text-[var(--color-text-light)]">
            Hidden stickers are still saved in your folders. Restore one
            to show it in the gallery again.
          </p>

          {filteredHiddenStickers.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredHiddenStickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="rounded-[24px] border-4 border-white bg-white p-3 shadow-sm"
                >
                  <div className="flex aspect-square items-center justify-center rounded-2xl bg-[var(--color-surface-blue)] p-3">
                    <Image
                      src={sticker.src}
                      alt={sticker.name}
                      width={300}
                      height={300}
                      unoptimized={sticker.src
                        .toLowerCase()
                        .endsWith(".svg")}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <p className="mb-3 mt-2 truncate text-center text-sm font-bold capitalize">
                    {sticker.name}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      restoreStickerToGallery(sticker.id)
                    }
                    className="w-full rounded-full border-2 border-white bg-[var(--color-surface-mint)] px-3 py-2 text-sm font-bold transition hover:scale-[1.02]"
                  >
                    Restore to gallery
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No hidden stickers." />
          )}
        </>
      )}
    </div>
  );
}

function StickerShelf({
  title,
  stickers,
  onSelectSticker,
  favorites,
  toggleFavorite,
  hideStickerFromGallery,
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border-4 border-white bg-[var(--color-surface-pink)] p-3 shadow-[0_5px_0_rgba(223,118,170,0.12)] sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h4 className="font-heading text-lg font-bold text-[var(--color-text)]">
            {title}
          </h4>
          <p className="mt-1 text-xs font-bold text-[var(--color-text-light)]">
            {stickers.length}{" "}
            {stickers.length === 1 ? "sticker" : "stickers"}
          </p>
        </div>

        <span
          className="text-lg text-[var(--color-primary-dark)]"
          aria-hidden="true"
        >
          ✦
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3">
        {stickers.map((sticker) => (
          <div key={sticker.id} className="w-36 shrink-0 sm:w-40">
            <StickerCard
              sticker={sticker}
              onSelect={onSelectSticker}
              isFavorite={favorites.includes(sticker.id)}
              onToggleFavorite={toggleFavorite}
              onHide={() => hideStickerFromGallery(sticker.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-[24px] border-4 border-dashed border-white bg-[var(--color-surface-blue)] p-6 text-center">
      <span className="mb-2 block text-3xl" aria-hidden="true">
        ✧
      </span>
      <p className="text-sm font-bold text-[var(--color-text-light)]">
        {message}
      </p>
    </div>
  );
}
