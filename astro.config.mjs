import { defineConfig } from 'astro/config';

// Pure static output — deploys to Vercel's free (Hobby) tier with zero
// serverless function usage. Vercel auto-detects Astro; no adapter needed.
export default defineConfig({
  // used to build absolute URLs for canonical + social (og:url, og:image).
  // change this if you move to a custom domain later.
  site: 'https://u-honest.vercel.app',
});
