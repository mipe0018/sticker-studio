
import { NextResponse } from "next/server";
import { mkdir, writeFile, readdir } from "fs/promises";
import path from "path";

const allowedCategories = [
  "stickers",
  "doodles",
  "illustrations",
  "icons",
  "geometric",
  "abstract",
  "typography",
  "secret",
];

const stickersRoot = path.join(
  process.cwd(),
  "public",
  "stickers_svg"
);

function validateCategoryPath(categoryPath) {
  if (typeof categoryPath !== "string") return false;

  const parts = categoryPath.split("/");

  if (!allowedCategories.includes(parts[0])) return false;

  return parts.every(
    (part) =>
      /^[a-z0-9_-]+$/.test(part) &&
      part !== "." &&
      part !== ".."
  );
}

function formatCategoryName(categoryPath) {
  return categoryPath
    .split("/")
    .map((part) =>
      part
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    )
    .join(" / ");
}

async function findStickers(relativePath = "") {
  const folderPath = path.join(
    process.cwd(),
    "public",
    "stickers_svg",
    relativePath
  );
  let entries;

  try {
    entries = await readdir(folderPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const stickers = [];

  for (const entry of entries) {
    const relativeFilePath = relativePath
      ? `${relativePath}/${entry.name}`
      : entry.name;

    if (entry.isDirectory()) {
      stickers.push(...(await findStickers(relativeFilePath)));
      continue;
    }

    if (!entry.isFile()) continue;

    const extension = path.extname(entry.name).toLowerCase();

    if (![".svg", ".png"].includes(extension)) continue;

    const categoryPath = relativePath;
    const fileName = path.basename(entry.name, extension);

    stickers.push({
      id: relativeFilePath,
      name: fileName.replace(/[-_]/g, " "),
      category: formatCategoryName(categoryPath),
      categoryPath,
      mainCategory: categoryPath.split("/")[0],
      src: `/stickers_svg/${relativeFilePath}`,
    });
  }

  return stickers;
}

async function findCategories(relativePath = "") {
  const folderPath = path.join(
    process.cwd(),
    "public",
    "stickers_svg",
    relativePath
  );
  let entries;

  try {
    entries = await readdir(folderPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const categories = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const categoryPath = relativePath
      ? `${relativePath}/${entry.name}`
      : entry.name;

    categories.push({
      value: categoryPath,
      label: formatCategoryName(categoryPath),
      mainCategory: categoryPath.split("/")[0],
    });

    const nestedCategories = await findCategories(categoryPath);

    categories.push(...nestedCategories);
  }

  return categories;
}

// GET: Hent stickers og kategorier
export async function GET() {
  try {
    await mkdir(stickersRoot, { recursive: true });

    await Promise.all(
      allowedCategories.map((category) =>
        mkdir(path.join(stickersRoot, category), {
          recursive: true,
        })
      )
    );

    const [stickers, categories] = await Promise.all([
      findStickers(),
      findCategories(),
    ]);

    return NextResponse.json({
      success: true,
      stickers,
      categories,
    });
  } catch (error) {
    console.error("Sticker library error:", error);

    return NextResponse.json(
      { error: "Could not load the sticker library." },
      { status: 500 }
    );
  }
}

// POST: Opret kategori eller upload sticker
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let body = null;
    let formData = null;

    // JSON – bruges til oprettelse af kategorier
    if (contentType.includes("application/json")) {
      body = await request.json();
    }
    // FormData – bruges til upload af billeder
    else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      formData = await request.formData();
    } else {
      // Fallback: forsøg at læse JSON, hvis headeren mangler
      const rawBody = await request.text();

      try {
        body = JSON.parse(rawBody);
      } catch {
        return NextResponse.json(
          { error: "Unsupported request format." },
          { status: 415 }
        );
      }
    }

    const action = body?.action ?? formData?.get("action");

    // OPRET NY KATEGORI
    if (action === "create-category") {
      const parentCategory =
        body?.parentCategory ?? formData?.get("parentCategory");

      const newCategory =
        body?.newCategory ?? formData?.get("newCategory");

      if (
        typeof parentCategory !== "string" ||
        !validateCategoryPath(parentCategory)
      ) {
        return NextResponse.json(
          { error: "Please select a valid parent category." },
          { status: 400 }
        );
      }

      if (
        typeof newCategory !== "string" ||
        !newCategory.trim()
      ) {
        return NextResponse.json(
          { error: "Please enter a category name." },
          { status: 400 }
        );
      }

      const safeCategoryName = newCategory
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9_-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      if (!safeCategoryName) {
        return NextResponse.json(
          { error: "Please enter a valid category name." },
          { status: 400 }
        );
      }

      const categoryPath = `${parentCategory}/${safeCategoryName}`;

      if (!validateCategoryPath(categoryPath)) {
        return NextResponse.json(
          { error: "Invalid category path." },
          { status: 400 }
        );
      }

      const folderPath = path.join(
        stickersRoot,
        ...categoryPath.split("/")
      );

      const parentFolderPath = path.join(
        stickersRoot,
        ...parentCategory.split("/")
      );

      await mkdir(parentFolderPath, { recursive: true });

      // recursive: false sikrer, at en eksisterende kategori ikke overskrives
      await mkdir(folderPath, { recursive: false });

      const category = {
        value: categoryPath,
        label: formatCategoryName(categoryPath),
        mainCategory: categoryPath.split("/")[0],
      };

      return NextResponse.json({
        success: true,
        category,
      });
    }

    // UPLOAD STICKER
    if (!formData) {
      return NextResponse.json(
        { error: "The upload requires a multipart form." },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    const category = formData.get("category");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Please select an image file." },
        { status: 400 }
      );
    }

    if (
      typeof category !== "string" ||
      !validateCategoryPath(category)
    ) {
      return NextResponse.json(
        { error: "Invalid sticker category." },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name).toLowerCase();

    if (![".svg", ".png"].includes(extension)) {
      return NextResponse.json(
        { error: "Only SVG and PNG files are allowed." },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "The file must be smaller than 2 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Kontrollér SVG-indhold
    if (extension === ".svg") {
      const svgContent = buffer.toString("utf8");

      if (
        !/<svg[\s>]/i.test(svgContent) ||
        /<script[\s>]/i.test(svgContent) ||
        /<foreignObject[\s>]/i.test(svgContent) ||
        /\bon[a-z]+\s*=/i.test(svgContent) ||
        /javascript\s*:/i.test(svgContent)
      ) {
        return NextResponse.json(
          {
            error: "The SVG file contains unsupported or unsafe content.",
          },
          { status: 400 }
        );
      }
    }

    // Kontrollér PNG-signatur
    if (extension === ".png") {
      const pngSignature = Buffer.from([
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a,
      ]);

      if (
        buffer.length < 8 ||
        !buffer.subarray(0, 8).equals(pngSignature)
      ) {
        return NextResponse.json(
          { error: "The selected file is not a valid PNG." },
          { status: 400 }
        );
      }
    }

    const originalName = path.basename(file.name, path.extname(file.name));

    const safeName =
      originalName
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "sticker";

    const folderPath = path.join(
      stickersRoot,
      ...category.split("/")
    );

    await mkdir(folderPath, { recursive: true });

    // Undgå at overskrive eksisterende filer
    let fileName = `${safeName}${extension}`;
    let filePath = path.join(folderPath, fileName);
    let counter = 1;

    while (true) {
      try {
        await writeFile(filePath, buffer, { flag: "wx" });
        break;
      } catch (error) {
        if (error.code !== "EEXIST") throw error;

        fileName = `${safeName}-${counter}${extension}`;
        filePath = path.join(folderPath, fileName);
        counter++;
      }
    }

    const relativeFilePath = `${category}/${fileName}`;

    return NextResponse.json({
      success: true,
      sticker: {
        id: relativeFilePath,
        name: safeName.replace(/[-_]/g, " "),
        category: formatCategoryName(category),
        categoryPath: category,
        mainCategory: category.split("/")[0],
        src: `/stickers_svg/${relativeFilePath}`,
      },
    });
  } catch (error) {
    console.error("Sticker API error:", error);

    if (error.code === "EEXIST") {
      return NextResponse.json(
        { error: "This category already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.message ||
          "Something went wrong while processing your request.",
      },
      { status: 500 }
    );
  }
}
