// One-shot migration: WordPress/Oxygen static mirror -> Astro project.
// Extracts the global <header>/<footer> once, per-page content + head assets,
// rewrites internal links to clean routes, fixes relative wp-content paths,
// and replaces the brand text (Uberhorny -> UHonest) in TEXT ONLY.
import { parse } from 'node-html-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MIRROR = path.resolve(ROOT, '../uberhorny.app');
const PARTIALS = path.join(ROOT, 'src/partials');
const PAGES = path.join(ROOT, 'src/pages');

// route slug -> source html file in the mirror. '' = home (index.astro).
const ROUTES = {
  '': 'index.html',
  'about': 'about/index.html',
  'careers': 'careers/index.html',
  'contact': 'contact/index.html',
  'signup': 'signup/index.html',
  'privacy': 'privacy/index.html',
  'terms': 'terms/index.html',
  '2257-compliance': '2257-compliance/index.html',
  'meet-local-horny-girls': 'meet-local-horny-girls/index.html',
  'chat-with-horny-girls': 'chat-with-horny-girls/index.html',
};

fs.mkdirSync(PARTIALS, { recursive: true });
fs.mkdirSync(PAGES, { recursive: true });

// ---- helpers ---------------------------------------------------------------

// Rewrite a mirror href to a clean Astro route.
function normalizeHref(href) {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|#|data:)/i.test(href)) return href;
  let h = href.replace(/^(\.\.?\/)+/, '');            // drop ./ and ../
  let hash = '';
  const hi = h.indexOf('#');
  if (hi >= 0) { hash = h.slice(hi); h = h.slice(0, hi); }
  h = h.replace(/index\.html@amp=1\.html$/, 'index.html'); // drop AMP variant
  if (/wp-content\//.test(h)) return '/' + h.slice(h.indexOf('wp-content/')) + hash;
  if (h === '' || h === 'index.html') return '/' + hash;
  const m = h.match(/^(.+)\/index\.html$/);
  if (m) return '/' + m[1] + hash;
  return '/' + h + hash;
}

// Rewrite all <a href> inside a parsed node to clean routes.
function normalizeAnchors(node) {
  for (const a of node.querySelectorAll('a[href]')) {
    a.setAttribute('href', normalizeHref(a.getAttribute('href')));
  }
}

// Brand text swap in TEXT NODES only (never attributes/paths). Skips code.
function swapBrandText(node, insideCode = false) {
  const tag = (node.tagName || '').toUpperCase();
  const code = insideCode || tag === 'SCRIPT' || tag === 'STYLE';
  for (const child of node.childNodes) {
    if (child.nodeType === 3) { // TextNode
      if (!code && child.rawText && /uberhorny/i.test(child.rawText)) {
        child.rawText = child.rawText
          .replace(/Uberhorny/g, 'UHonest')
          .replace(/UberHorny/g, 'UHonest')
          .replace(/UBERHORNY/g, 'UHONEST')
          .replace(/uberhorny/g, 'uhonest');
      }
    } else if (child.childNodes) {
      swapBrandText(child, code);
    }
  }
}

// Fix relative wp-content asset paths in a serialized HTML string -> absolute.
function fixAssetPaths(s) {
  return s
    .replace(/(?:\.\.\/)+wp-content\//g, '/wp-content/') // ../wp-content/
    .replace(/(["'(=])\s*wp-content\//g, '$1/wp-content/'); // href="wp-content/ url(wp-content/
}

function brandString(s) {
  return s
    .replace(/Uberhorny/g, 'UHonest')
    .replace(/UberHorny/g, 'UHonest')
    .replace(/UBERHORNY/g, 'UHONEST')
    .replace(/uberhorny/g, 'uhonest');
}

// Pull just the render-critical bits out of <head>: stylesheets, inline
// styles, favicons. Drop canonical/OG/twitter (old brand+domain) — you'll set
// your own SEO later.
function extractHead(head) {
  const keep = [];
  for (const el of head.childNodes) {
    if (el.nodeType !== 1) continue;
    const tag = el.tagName.toUpperCase();
    if (tag === 'STYLE') { keep.push(el); continue; }
    if (tag === 'LINK') {
      const rel = (el.getAttribute('rel') || '').toLowerCase();
      if (rel.includes('stylesheet') || rel.includes('icon')) keep.push(el);
    }
  }
  const frag = parse(keep.map(e => e.outerHTML).join('\n'));
  normalizeAnchors(frag);
  return fixAssetPaths(frag.toString());
}

// ---- extract shared header/footer from the home page -----------------------

let sharedHeader = null;
let sharedFooter = null;
const pageMeta = {};

for (const [slug, file] of Object.entries(ROUTES)) {
  const src = path.join(MIRROR, file);
  const html = fs.readFileSync(src, 'utf8');
  const root = parse(html, { comment: false, blockTextElements: { script: true, style: true } });
  const head = root.querySelector('head');
  const body = root.querySelector('body');

  const title = brandString(head.querySelector('title')?.text?.trim() || 'UHonest');
  const desc = brandString(head.querySelector('meta[name=description]')?.getAttribute('content') || '');
  const bodyClass = body.getAttribute('class') || '';

  // head assets (per-page: each page has its own Autoptimize CSS bundle)
  fs.writeFileSync(path.join(PARTIALS, `${slug || 'index'}.head.html`), extractHead(head));

  const headerEl = body.querySelector('header');
  const footerEl = body.querySelector('footer');

  // capture shared header/footer once (from home), normalized + brand-swapped
  if (!sharedHeader && headerEl) {
    normalizeAnchors(headerEl); swapBrandText(headerEl);
    sharedHeader = fixAssetPaths(headerEl.toString());
  }
  if (!sharedFooter && footerEl) {
    normalizeAnchors(footerEl); swapBrandText(footerEl);
    sharedFooter = fixAssetPaths(footerEl.toString());
  }

  // remove header/footer -> what's left is this page's unique content
  headerEl?.remove();
  footerEl?.remove();
  normalizeAnchors(body);
  swapBrandText(body);
  const content = fixAssetPaths(body.innerHTML);
  fs.writeFileSync(path.join(PARTIALS, `${slug || 'index'}.body.html`), content);

  pageMeta[slug] = { title, desc, bodyClass, name: slug || 'index' };
}

fs.writeFileSync(path.join(PARTIALS, '_header.html'), sharedHeader || '');
fs.writeFileSync(path.join(PARTIALS, '_footer.html'), sharedFooter || '');

// ---- write the .astro pages ------------------------------------------------

function esc(s) { return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${'); }

for (const [slug, meta] of Object.entries(pageMeta)) {
  const name = meta.name;
  const fileBase = slug === '' ? 'index' : slug;
  const astro = `---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import head from '../partials/${name}.head.html?raw';
import content from '../partials/${name}.body.html?raw';

const title = \`${esc(meta.title)}\`;
const description = \`${esc(meta.desc)}\`;
const bodyClass = \`${esc(meta.bodyClass)}\`;
---
<BaseLayout title={title} description={description} bodyClass={bodyClass}>
  <Fragment slot="head" set:html={head} />
  <Header />
  <Fragment set:html={content} />
  <Footer />
</BaseLayout>
`;
  fs.writeFileSync(path.join(PAGES, `${fileBase}.astro`), astro);
}

console.log('Migration complete.');
console.log('Pages:', Object.keys(pageMeta).map(s => '/' + s).join('  '));
console.log('Shared header bytes:', (sharedHeader || '').length, '| footer bytes:', (sharedFooter || '').length);
