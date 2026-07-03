# CLAUDE.md — uhonest-app

Guidance for Claude Code (and humans) working in this project.

## ⚠️ Git identity — READ FIRST
- This repo and folder use the GitHub account **`scb-lion` ONLY**.
- **Never** associate `Tiz20lion` (the machine's global git identity) with this
  repo, its commits, or its pushes — not as author, committer, or credential.
- Local git config already pins this:
  - `user.name = scb-lion`
  - `user.email = scb-lion@users.noreply.github.com`
  - `credential.https://github.com.username = scb-lion`
  - `credential.useHttpPath = true`  (so the machine-wide github.com credential
    for the other account is not reused for this repo)
- Remote: `https://github.com/scb-lion/uhonest-app.git`
- If a push authenticates as anyone other than `scb-lion`, stop and re-auth as
  `scb-lion` — do not push.

## What this is
A **static marketing site** built with **Astro**, migrated from a static
WordPress/Oxygen mirror. Brand is **UHonest** (text only; original images/logos
kept as-is). Deploys to **Vercel free (Hobby)** as pure static output — no
serverless functions.

## Structure
```
src/
  layouts/BaseLayout.astro     <html>/<head>; per-page head via "head" slot
  components/
    Header.astro               ONE global nav -> edits src/partials/_header.html
    Footer.astro               ONE global footer -> edits src/partials/_footer.html
  pages/*.astro                10 pages, same slugs as the original site
  partials/
    _header.html, _footer.html shared header/footer markup
    <slug>.head.html           per-page <head> assets (each page has its own CSS bundle)
    <slug>.body.html           per-page unique content (edit page content here)
public/wp-content/             all images + CSS, served untouched at /wp-content/...
scripts/migrate.mjs            one-shot mirror->Astro migration (kept for reference)
```

### The 10 pages
Landing/marketing: `/` (home), `/meet-local-horny-girls`, `/chat-with-horny-girls`
Conversion: `/signup` · Info: `/about`, `/careers`, `/contact`
Legal: `/privacy`, `/terms`, `/2257-compliance`

## Commands
- `npm run dev` — dev server (http://localhost:4321)
- `npm run build` — static build to `dist/`
- `npm run preview` — serve the built `dist/`

## Editing notes
- Change the nav/footer once in `src/partials/_header.html` / `_footer.html`;
  every page updates.
- Page content lives in `src/partials/<slug>.body.html`.
- Content partials are rendered raw (`?raw` + `set:html`) because the Oxygen
  markup contains inline `<style>`/`<script>` with `{ }` that clash with Astro
  expressions. Editing raw HTML there is expected.

## Known follow-ups (not yet done)
- Image `alt` attributes still read "Uberhorny" (only visible text was swapped).
- Signup/contact forms render but do not submit anywhere (were WP server-side).
- Old canonical/OG/Twitter meta were dropped; add real SEO once a domain exists.

## Deploy (Vercel free)
1. Push to `https://github.com/scb-lion/uhonest-app.git` (as `scb-lion`).
2. Vercel -> New Project -> import repo -> **Root Directory = repo root**
   (this folder is already the repo root).
3. Auto-detected: build `astro build`, output `dist/`. Static = $0 on Hobby.
