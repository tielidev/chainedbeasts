import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = path.resolve('scripts/check-content-release.mjs');
const temporary: string[] = [];
afterEach(() => temporary.splice(0).forEach(dir => fs.rmSync(dir, { recursive: true, force: true })));

function fixture() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'beasts-release-'));
  temporary.push(cwd);
  fs.mkdirSync(path.join(cwd, 'docs'));
  fs.mkdirSync(path.join(cwd, 'src/content/wiki/en/guides'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'cover.webp'), 'fixture');
  const articles = Array.from({ length: 50 }, (_, index) => {
    fs.writeFileSync(path.join(cwd, `src/content/wiki/en/guides/article-${index}.mdx`),
      "---\nimage: '../../../../../cover.webp'\n---\n\nSource-reviewed content.\n");
    return { url: `/guides/article-${index}/`, status: 'ready', reviewedAt: '2026-10-15', sources: ['https://example.com/source'] };
  });
  const map = { target: 50, articles };
  const save = () => fs.writeFileSync(path.join(cwd, 'docs/content-map.json'), JSON.stringify(map));
  save();
  const run = (branch = 'main', args: string[] = []) => spawnSync(process.execPath, [script, ...args], {
    cwd, env: { ...process.env, CF_PAGES_BRANCH: branch }, encoding: 'utf8',
  });
  return { cwd, map, save, run };
}

describe('complete content release gate', () => {
  it('allows a complete reviewed set and blocks an incomplete editorial set on production', () => {
    const f = fixture();
    expect(f.run('main', ['--production']).status).toBe(0);
    f.map.articles[49].status = 'research-draft';
    f.save();
    const result = f.run('main', ['--production']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('HOLD');
    expect(result.stderr).toContain('research-draft');
    expect(f.run('content/review', ['--production']).status).toBe(0);
    expect(f.run('content/review').status).toBe(1);
  });

  it('counts only indexable articles and refuses missing evidence or duplicated map URLs', () => {
    const f = fixture();
    const article = path.join(f.cwd, 'src/content/wiki/en/guides/article-49.mdx');
    fs.writeFileSync(article, "---\nimage: '../../../../../cover.webp'\ndraft: true # not approved\n---\n");
    expect(f.run().stderr).toContain('49/50');
    fs.writeFileSync(article, "---\nimage: '../../../../../cover.webp'\nnoindex: true\n---\n");
    expect(f.run().stderr).toContain('49/50');
    f.map.articles[0].sources = [];
    f.map.articles[1].url = f.map.articles[0].url;
    f.save();
    expect(f.run().stderr).toContain('Duplicate article URLs');
    expect(f.run().stderr).toContain('missing review date or sources');
  });
});
