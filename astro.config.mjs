import { defineConfig } from 'astro/config';

// Pure static output — deploys to Vercel's free (Hobby) tier with zero
// serverless function usage. Vercel auto-detects Astro; no adapter needed.
export default defineConfig({
  // set this to your real domain once you have it, e.g. 'https://uhonest.com'
  site: 'https://example.com',
});
