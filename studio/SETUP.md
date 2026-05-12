# Sanity Studio — one-time setup (Marty)

This is a ~20-minute one-time setup. After it's done, Triston logs into a single URL forever and the site picks up his posts automatically.

## What you'll end up with

- A free Sanity project hosting the Journal content
- A Studio (admin UI) deployed at `https://lavida.sanity.studio`
- Triston invited as an editor — he logs in with email + Google, no GitHub involved
- The public site (`blog.html`, `post.html`) fetching posts from Sanity's CDN, no build step needed

## 1. Create the Sanity project

```bash
cd "clients/la vida landscapes/la-vida-landscapes-site-main/studio"
npm install
npx sanity login        # opens browser — sign in with Google or email
npx sanity init --env   # creates a NEW project, writes .env with SANITY_STUDIO_PROJECT_ID
```

When `init` asks:
- Project name: **La Vida Landscapes — Journal**
- Use the default dataset configuration? **Y** (creates `production`)
- Project output path: just press Enter (uses current dir)
- Add configuration files / sample data: **N** to both — we already have the schema

After this, `.env` contains your `SANITY_STUDIO_PROJECT_ID`. **Copy that ID** — you'll paste it into the site in step 4.

## 2. Allow the public site to read content

By default a Sanity dataset is private to the Studio. We need to make it readable so `blog.html` / `post.html` can fetch from the CDN:

```bash
npx sanity dataset visibility set production public
```

And add the public site origin to CORS (so the browser is allowed to fetch):

```bash
npx sanity cors add https://lavidalandscapes.com --no-credentials
npx sanity cors add https://www.lavidalandscapes.com --no-credentials
npx sanity cors add http://localhost:8000 --no-credentials   # for local dev
```

## 3. Deploy the Studio

```bash
npm run deploy
```

When prompted for `studioHost`, accept the default `lavida` (already set in `sanity.cli.ts`). The Studio is now live at **https://lavida.sanity.studio**.

## 4. Wire the project ID into the public site

Open `js/sanity.js` and replace `REPLACE_ME` with the project ID from step 1:

```js
var PROJECT_ID = 'xyz123abc';   // your actual ID
```

Commit + push. Vercel auto-deploys. The Journal page now fetches from Sanity.

## 5. Invite Triston

In the Studio (https://lavida.sanity.studio), click your avatar → **Manage project** → **Members** → **Invite**. Use Triston's email. Role: **Editor** (can create + publish posts, can't change schema or invite others — exactly what we want).

He gets an email, clicks the link, signs in with Google or sets a password. Done.

Send him `TRISTON.md` so he knows what to do next.

## Ongoing — what triggers a publish

- Triston hits **Publish** in the Studio.
- The CDN sees the new post within a few seconds.
- Next visitor to `lavidalandscapes.com/blog.html` sees it. **No deploy required.**

## Adding fields later

If we want to add a field (e.g. tags, author, related posts), edit `schemas/journalPost.ts`, then `npm run deploy` from this directory. Studio updates; existing posts keep working.

## Free tier limits (Sanity)

- 3 users — plenty for Marty + Dobeck + Triston
- 10k documents — Triston would need to post weekly for 192 years to hit this
- 20 GB asset bandwidth/mo — at La Vida's traffic, irrelevant

We will not hit any of these.
