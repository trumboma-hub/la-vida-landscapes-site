# La Vida Landscapes — Sanity Studio

Sanity Studio for the La Vida Landscapes Journal. Source for the CMS that's served at `lavidalandscapes.com/admin`.

- **Live Studio:** https://www.lavidalandscapes.com/admin
- **Schema:** [`schemas/journalPost.ts`](./schemas/journalPost.ts)
- **System reference:** [SETUP.md](./SETUP.md) — what was provisioned and how the build pipeline works
- **Author guide:** [TRISTON.md](./TRISTON.md) — how to write a post

## Architecture in one paragraph

The Studio is built (`sanity build`) to static files in `dist/`, which Vercel deploys under `/admin` on `lavidalandscapes.com` during each push to `main`. Triston signs in with Google at `/admin` and writes posts that land in Sanity Cloud (project `fzqkb32j`, dataset `production`). The public site (`blog.html`, `post.html`) reads those same posts from Sanity's CDN at page load via `js/sanity.js`. No backend lives on Vercel — Vercel only serves static files.

## Local dev

```bash
npm install --engine-strict=false   # if your local Node isn't 22.x
npm run dev                          # opens http://localhost:3333
```

Local Studio talks to the live `production` dataset; there's no staging.

## Updating the schema

Edit files under `schemas/`, commit, push to `main`. Vercel rebuilds the Studio. New fields appear at `/admin` on next reload. Existing posts keep working.
