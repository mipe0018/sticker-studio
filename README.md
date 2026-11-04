# Sticker Studio

Sticker Studio is a Next.js sticker library and creative workspace. It supports browsing categorized SVG/PNG stickers, uploading local artwork, arranging stickers on an A4-proportioned sheet, and saving workspace preferences in the browser.

## Requirements

- Node.js compatible with Next.js 16.4.5 (the audit used Node.js 24.13.1)
- npm (the audit used npm 11.8.0)

No environment variables or external API credentials are required by the current implementation.

## Install and run

Run commands from this `sticker-studio` directory:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available checks

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

There is no automated test script in `package.json`. The production build, TypeScript check, API checks, and browser interaction checks performed during the November 2026 audit are documented in [PROJECT_REPORT.md](./PROJECT_REPORT.md).

## Important implementation notes

- Sticker files are stored under `public/stickers_svg` on the server's local filesystem.
- Workspace state, favorites, hidden sticker IDs, floating stickers, and paper color are persisted in browser `localStorage` through Zustand.
- Newly uploaded public assets require a production server restart before `next start` serves their new URLs. See **Known limitations** in `PROJECT_REPORT.md` before deploying upload functionality.
- The existing application is primarily JavaScript/JSX; TypeScript is used for tooling and `next.config.ts`.

See [PROJECT_REPORT.md](./PROJECT_REPORT.md) for the complete architecture, functionality, API, state-management, audit, and verification documentation.
