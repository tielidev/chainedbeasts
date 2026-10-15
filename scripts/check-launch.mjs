import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const domain='https://chained-beasts.com';
const root='dist';
async function htmlFiles(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await htmlFiles(p));else if(e.name.endsWith('.html'))out.push(p);}return out;}
const files=(await htmlFiles(root)).filter(f=>!f.includes(`${path.sep}ads${path.sep}`));
const home=await fs.readFile(path.join(root,'index.html'),'utf8');
assert.match(home,/<link[^>]+rel="icon"[^>]+href="\/favicon-96x96.png"/);
assert.match(home,/<link[^>]+rel="canonical"[^>]+href="https:\/\/chained-beasts.com\/"/);
const icon=await sharp(path.join(root,'favicon-96x96.png')).metadata();
assert.equal(icon.width,96);assert.equal(icon.height,96);assert.equal(icon.format,'png');
const robots=await fs.readFile(path.join(root,'robots.txt'),'utf8');
assert.match(robots,/Allow: \//);assert.ok(!robots.includes('Disallow: /'));assert.ok(robots.includes(domain+'/sitemap-index.xml'));
const sitemap=await fs.readFile(path.join(root,'sitemap-0.xml'),'utf8');
assert.ok(!sitemap.includes('anvil.wiki'));assert.ok(!sitemap.includes('pages.dev'));assert.ok(!sitemap.includes('/landing/'));assert.ok(!sitemap.includes('/ja/'));
for(const file of files){const html=await fs.readFile(file,'utf8');assert.ok(!html.includes('Anvil Quest'),`Demo identity in ${file}`);assert.equal((html.match(/<h1(?:\s|>)/g)??[]).length,1,`H1 count in ${file}`);assert.ok(html.includes('favicon-96x96.png'),`Missing raster icon in ${file}`);assert.ok(html.includes(`rel="canonical" href="${domain}/`),`Wrong canonical in ${file}`);}
for(const category of ['guides','beasts','combat','co-op','news']){assert.ok(sitemap.includes(`${domain}/${category}/`));assert.ok((await fs.readdir(path.join(root,category))).some(f=>f!=='index.html'));}
assert.ok((await fs.readdir(path.join(root,'pagefind'))).some(f=>f.endsWith('.js')),'Missing search bundle');
console.log(`Launch checks passed: ${files.length} pages, canonical domain, five populated categories, raster favicon, sitemap and search assets.`);
