// This site's content refresh must publish as one complete, reviewed set.
// Local/branch builds remain available for review. Cloudflare main builds fail
// closed until the map and all 50 indexable articles are ready.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const productionOnly = process.argv.includes('--production');
if (productionOnly && process.env.CF_PAGES_BRANCH !== 'main') {
  console.log('[content release] Local/preview build: production publication gate not applied.');
  process.exit(0);
}
const map = JSON.parse(fs.readFileSync('docs/content-map.json', 'utf8'));
const failures = [];
const articles = map.articles;
if (map.target !== 50 || articles.length !== 50) failures.push('The release map must contain exactly 50 article entries.');
if (new Set(articles.map(a => a.url)).size !== articles.length) failures.push('Duplicate article URLs in the map.');
const publishedFiles = [];
for (const category of fs.readdirSync('src/content/wiki/en')) {
  for (const file of fs.readdirSync(`src/content/wiki/en/${category}`).filter(f => f.endsWith('.mdx'))) {
    const raw = fs.readFileSync(`src/content/wiki/en/${category}/${file}`, 'utf8');
    const fm = YAML.parse(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '') ?? {};
    if (fm.draft !== true && fm.noindex !== true) {
      publishedFiles.push(`/${category}/${file.replace(/\.mdx$/, '')}/`);
    }
  }
}
if (publishedFiles.length !== 50) failures.push(`${publishedFiles.length}/50 indexable articles are present.`);
for (const article of articles) {
  if (article.status !== 'ready') { failures.push(`${article.url}: ${article.status} — ${article.reviewNote ?? 'not editorially approved'}`); continue; }
  if (!article.reviewedAt || !article.sources?.length) failures.push(`${article.url}: missing review date or sources.`);
  if (!publishedFiles.includes(article.url)) failures.push(`${article.url}: no indexable article file.`);
  const file = path.join('src/content/wiki/en', article.url.replace(/^\//, '').replace(/\/$/, '') + '.mdx');
  if (!fs.existsSync(file)) continue;
  const raw = fs.readFileSync(file, 'utf8');
  const image = YAML.parse(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '')?.image;
  if (!image || !fs.existsSync(path.resolve(path.dirname(file), image))) failures.push(`${article.url}: missing cover image.`);
}
if (failures.length) {
  console.error('[content release] HOLD: the current production site must remain unchanged.');
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}
console.log('[content release] PASS: all 50 independent, sourced articles are approved and indexable.');
