# Sanity Studio — system reference

This document describes how the La Vida Landscapes Journal CMS is wired up. **Setup is already complete** — Triston can post immediately. This is here for future maintainers (or in case something needs to be reconfigured).

## What was provisioned

| Item | Value |
|---|---|
| Sanity organization | **Traverse** (`oQAdnYKtF`) |
| Sanity project | **La Vida Landscapes - Journal** (`fzqkb32j`) |
| Dataset | `production` (visibility: **public** — required for client-side reads from the website) |
| Studio location | **https://www.lavidalandscapes.com/admin** (served from Vercel, built from `studio/`) |
| Admin link in nav | None — author bookmarks `/admin` directly |
| CORS origins | `https://lavidalandscapes.com`, `https://www.lavidalandscapes.com`, `http://localhost:8000` |

## How the moving parts fit together

```
┌─────────────────────────────────┐         ┌──────────────────────────────┐
│  www.lavidalandscapes.com       │         │  Sanity Cloud (fzqkb32j)     │
│  (Vercel static site)           │         │                              │
│                                 │         │  ┌──────────────────────┐    │
│  /blog.html, /post.html         │ <─────> │  │ production dataset   │    │
│      fetch from CDN ─────────────────────────►  Journal posts       │    │
│                                 │         │  └──────────────────────┘    │
│  /admin/* (built Studio)        │         │                              │
│      writes via auth ────────────────────────►  (same data, write-side)  │
│                                 │         │                              │
└─────────────────────────────────┘         └──────────────────────────────┘
                                                       ▲
                                                       │ OAuth (Google)
                                                       │
                                              Triston's browser
                                              (lavidalandscapes.com/admin)
```

The Studio is a React SPA. It's bundled via `sanity build` into `studio/dist/`, then deployed by Vercel as static files under `/admin`. When Triston signs in, the Studio writes to Sanity Cloud. The public site reads from Sanity Cloud's CDN. No backend server lives on Vercel — Vercel only serves static files.

## Vercel build pipeline

Configured in `vercel.json` at the repo root:

1. `npm ci` inside `studio/` (uses `studio/package-lock.json`).
2. `npm run build` inside `studio/` → produces `studio/dist/`.
3. `mv studio/dist admin` — the built Studio becomes `/admin/*` in the deployed output.
4. Vercel serves the repo root as static, filtered through `.vercelignore` (which excludes `studio/`, `node_modules/`, the `.mov` source video, etc.).

Two URL rewrites also live in `vercel.json`:
- `/static/*` → `/admin/static/*` — Sanity's bundler emits asset paths as root-relative `/static/...`; this rewrite remaps them to the right location without touching the build.
- `/admin/<non-file-path>` → `/admin/index.html` — SPA fallback so deep links into the Studio (e.g. `/admin/desk/journalPost;some-id`) resolve to the Studio's entry HTML and let client-side routing take over.

## Editing the schema

Edit `studio/schemas/journalPost.ts`. Push to `main`. Vercel rebuilds; the new fields appear in the Studio at `/admin`. Existing posts keep working — Sanity tolerates fields being added.

## Adding an author

Visit https://www.sanity.io/manage/project/fzqkb32j → **Members** → **Invite**. Email + role (Editor for content people, Administrator for Marty/Dobeck). The new member signs in with Google at `lavidalandscapes.com/admin` and they're in.

## Adjusting CORS

If we ever move to a new domain or staging URL, run:

```bash
cd studio
SANITY_STUDIO_PROJECT_ID=fzqkb32j npx sanity cors add https://newdomain.com --no-credentials
```

To see current origins: `SANITY_STUDIO_PROJECT_ID=fzqkb32j npx sanity cors list`.

## Free tier limits (Sanity)

- 3 users — plenty for Marty + Dobeck + Triston
- 10k documents — weekly cadence × 192 years to hit
- 20 GB asset bandwidth/mo

We will not hit any of these at La Vida's scale.

## Local dev

```bash
cd studio
npm install --engine-strict=false   # if your local Node isn't 22.x
npm run dev                          # http://localhost:3333
```

Local Studio talks to the same `production` dataset — there's no staging dataset. If we ever need one: `SANITY_STUDIO_PROJECT_ID=fzqkb32j npx sanity dataset create staging`.

## What ever happened to `lavida.sanity.studio`?

We never deployed there. The original spike said we would; we changed approach so Triston only logs in at `lavidalandscapes.com/admin`. The Sanity-hosted studio URL is unused. (Running `npm run deploy` in `studio/` would push to it, but there's no reason to.)
