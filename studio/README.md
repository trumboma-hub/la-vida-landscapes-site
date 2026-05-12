# La Vida Landscapes — Sanity Studio

Sanity Studio for the La Vida Landscapes Journal. Triston writes posts here; the public site fetches them at page load.

- **Live Studio:** https://lavida.sanity.studio (after first deploy)
- **Schema:** see `schemas/journalPost.ts`
- **Setup (Marty):** [SETUP.md](./SETUP.md) — one-time, ~20 minutes
- **Author guide (Triston):** [TRISTON.md](./TRISTON.md) — how to write a post

## Architecture in one paragraph

Sanity hosts the content + the Studio UI. The public site is unchanged in shape — still static HTML on Vercel, no build step — except `blog.html` now fetches the post list from Sanity's CDN on page load, and `post.html` does the same for a single post by slug. Project ID is hardcoded in `js/sanity.js` so the public site needs zero environment variables.

## Local dev

```bash
npm install
npm run dev   # opens http://localhost:3333
```

Posts created locally go straight to the live `production` dataset — there's no separate dev environment. If we ever need one, add a `staging` dataset with `npx sanity dataset create staging`.

## Deploying schema changes

Edit `schemas/journalPost.ts`, then:

```bash
npm run deploy
```

That pushes the new Studio build to `lavida.sanity.studio`. Existing posts keep working — Sanity tolerates fields being added.
