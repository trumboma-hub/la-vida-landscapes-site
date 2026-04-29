# La Vida Landscapes — Website

Public website for **La Vida Landscapes, LLC** (Birmingham, AL). Static HTML + Tailwind CDN, no build step. This is the **baseline structural build** — visual polish is layered on top via Claude's design tool in a follow-up pass.

## Run locally

```bash
# Either of these works
python -m http.server 8000
# or
npx serve .
```

Open <http://localhost:8000>.

> Opening `index.html` directly via `file://` mostly works, but the embedded Google Maps iframe on `contact.html` may be blocked. Use a local server for full fidelity.

## Structure

```
la-vida-landscapes-site/
├── index.html              # Home — tone-setter
├── services.html           # Service lines + commercial partners
├── portfolio.html          # Project grid + lightbox
├── about.html              # Founder story, mission, values
├── vida-gardens.html       # Long-term therapeutic-gardens vision
├── contact.html            # Phone, email, socials, service area
├── 404.html                # Friendly fallback
├── css/custom.css          # Small overrides Tailwind can't express cleanly
├── js/main.js              # Mobile menu, lightbox, smooth scroll, year stamp, reduced-motion guard, portfolio filters
├── partials/
│   ├── nav.html            # Source-of-truth nav (each page inlines a copy)
│   └── footer.html         # Source-of-truth footer (each page inlines a copy)
├── images/
│   ├── logo.svg
│   ├── favicon.svg
│   └── og-default.svg
├── robots.txt
├── sitemap.xml
└── README.md
```

## Customization map

| What to change | Where |
| --- | --- |
| Brand colors | The inline `tailwind.config` `<script>` block at the top of every HTML page (color tokens: `forest`, `moss`, `bark`, `stone`, `cream`, `sun`, `ink`) |
| Fonts | Same `tailwind.config` block (`fontFamily`) + the Google Fonts `<link>` in `<head>` |
| Nav links / logo | Edit `partials/nav.html` (canonical), then sync into each page between the `<!-- nav:start --> ... <!-- nav:end -->` markers |
| Footer / socials | Edit `partials/footer.html` (canonical), then sync between the `<!-- footer:start --> ... <!-- footer:end -->` markers |
| Phone / email | Search-replace `(205) 800-8432`, `+12058008432`, and `livinlavida@lavidalandscapes.com` across the codebase |
| Service descriptions | `services.html` — each service block has an `id` matching its anchor link |
| Portfolio projects | `portfolio.html` — each `<article data-tags="...">` is one tile; `data-lightbox-title` and `data-lightbox-meta` set caption text |
| Mission / values | `about.html` — values grid is a single `<ul>` block |
| SEO meta | Top of each page's `<head>` — `<title>`, `<meta name="description">`, OG tags |
| Schema | `index.html` and `contact.html` carry the `LandscapeBusiness` JSON-LD |

## Content status

| Section | Status |
| --- | --- |
| Services list | Real (from prospect research; verify with Triston) |
| Mission + 8 values | Real (from NALP feature) |
| Founder story | Real (NALP "Faces of the Industry" narrative, paraphrased) |
| Phone / email | Real |
| Service areas | Real (Birmingham, Huntsville, Lake Martin, Smith Lake, Jasper, Alex City) |
| Commercial partners | Real (UAB, Brasfield & Gorrie, Stone Building Company) |
| Social profile URLs | Real |
| Google Reviews stats | Real (5.0 / 10 reviews as of 2026-04-29) |
| Hero copy | **Placeholder** — Triston to review/replace |
| Portfolio project names + photos | **Placeholder** — replace with real project photography |
| Testimonial quotes | **Placeholder paraphrase** — themes are real (professionalism, integrity, faith), exact quotes need approval |
| Vida Gardens roadmap dates | **Placeholder** — concept real, dates illustrative |

## Image replacement guide

- **Hero/section imagery** uses Unsplash hotlinks via `https://images.unsplash.com/...?w=1600&q=80&auto=format`. These render immediately for the design tool pass. Replace with real La Vida photography by swapping the `src` attribute on each `<img>`.
- **Portfolio tiles** use SVG/CSS gradients with project-name labels — clearly placeholders. Each tile in `portfolio.html` is one `<article>`; replace the gradient `<div>` with an `<img>` to drop in real photography.
- Recommended dimensions: hero 1920x1080, section 1600x900, portfolio tile 1200x900.

## Deploy

GitHub Pages from the `main` branch:

```bash
git push origin main
# In repo settings → Pages → Source: Deploy from a branch → main / (root)
```

For the live `lavidalandscapes.com` domain, point an `A` record (or `CNAME`) at GitHub's Pages servers and add a `CNAME` file at the repo root with `lavidalandscapes.com`. The current site is hosted by another provider — DNS coordination required before cutover.

## Design tool handoff note

This is a **baseline**: solid semantic HTML, accessible interaction patterns, sensible typography and spacing, and clean Tailwind tokens. The next pass elevates visual polish via Claude's design tool. When iterating:

- **Preserve** semantic structure (`<header>`, `<nav>`, `<main>`, `<section aria-labelledby>`, `<footer>`), heading hierarchy, content, and accessibility patterns (focus rings, skip link, lightbox dialog roles, mobile menu a11y attrs).
- **Customize** styling tokens in the Tailwind config block — colors, fonts, spacing — and Tailwind utility classes on individual elements. The token system is the intended customization surface.
- **Avoid** adding heavy frameworks or build steps; this site is designed to stay static and edit-friendly.

## Future work

- Real project photography to replace portfolio placeholders
- Real founder/team headshots
- Optional contact form backend (Formspree or Netlify Forms) if the team wants form submissions in addition to `tel:` / `mailto:`
- Blog / journal section for SEO long-tail (project case studies, seasonal landscape tips, faith reflections)
- Vida Gardens dedicated microsite once the nonprofit launches
- Real `og-default.jpg` (1200x630) once brand photography is in hand
- DNS cutover to GitHub Pages / Cloudflare Pages

## Credits

Built for La Vida Landscapes by [Traverse](https://traverserts.com).
