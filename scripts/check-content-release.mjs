// Publish only the explicitly approved, source-reviewed release set.
// The long-term map can retain research drafts outside that release.
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
const release = map.release;
const approvedUrls = release?.urls ?? [];
if (!Number.isInteger(release?.target) || release.target < 1 || !release.authorizedAt || approvedUrls.length !== release.target) {
  failures.push('Missing or inconsistent approved release scope.');
}
if (new Set(approvedUrls).size !== approvedUrls.length) failures.push('Duplicate URLs in the approved release.');
if (approvedUrls.some(url => !articles.some(article => article.url === url))) failures.push('Approved release URL missing from the content map.');
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
if (publishedFiles.length !== release?.target) failures.push(`${publishedFiles.length}/${release?.target ?? '?'} indexable articles are present.`);
for (const url of publishedFiles) {
  if (!approvedUrls.includes(url)) failures.push(`${url}: indexable article is outside the approved release.`);
}
for (const article of articles.filter(article => approvedUrls.includes(article.url))) {
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
  console.error('[content release] HOLD: resolve release validation failures before publishing.');
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}
console.log(`[content release] PASS: all ${release.target} approved articles are sourced and indexable; ${articles.length - release.target} research topics remain outside this release.`);
