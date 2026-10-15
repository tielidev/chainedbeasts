/**
 * Consent-literal contract — CONSENT_STORAGE_KEY / CONSENT_ACCEPTED_EVENT
 * are canonically exported from src/lib/shared-ui.ts but DUPLICATED as
 * string literals in three component scripts: CookieConsent's bundled
 * module cannot see frontmatter imports, and AdsterraSlot / MobileAnchorAd
 * run untranspiled is:inline scripts that cannot import at all.
 *
 * fail-closed direction: any single-sided rename means consumers can no
 * longer read the stored choice and the accept event never fires — ads
 * silently never load. This suite pins every duplicate to the canonical
 * export so a partial rename goes red instead.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { describe, expect, test } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

/** Each consumer's own assignment idiom for the two literals. */
const CONSUMERS: { file: string; keyRe: RegExp; eventRe: RegExp }[] = [
  {
    file: 'src/components/layout/CookieConsent.astro',
    keyRe: /const KEY = '([^']+)'/,
    eventRe: /const ACCEPTED_EVENT = '([^']+)'/,
  },
  {
    file: 'src/components/ads/AdsterraSlot.astro',
    keyRe: /var CONSENT_KEY = '([^']+)'/,
    eventRe: /var CONSENT_EVENT = '([^']+)'/,
  },
  {
    file: 'src/components/ads/MobileAnchorAd.astro',
    keyRe: /var CONSENT_KEY = '([^']+)'/,
    eventRe: /var CONSENT_EVENT = '([^']+)'/,
  },
];

describe('consent literals pinned to shared-ui.ts', () => {
  const sharedUi = read('src/lib/shared-ui.ts');
  const storageKey = /export const CONSENT_STORAGE_KEY = '([^']+)'/.exec(sharedUi)?.[1];
  const acceptedEvent = /export const CONSENT_ACCEPTED_EVENT = '([^']+)'/.exec(sharedUi)?.[1];

  test('shared-ui.ts still exports both canonical constants', () => {
    expect(storageKey, 'CONSENT_STORAGE_KEY export missing in shared-ui.ts').toBeTruthy();
    expect(acceptedEvent, 'CONSENT_ACCEPTED_EVENT export missing in shared-ui.ts').toBeTruthy();
  });

  test('previous ad-only acceptance requires a fresh analytics choice', () => {
    const banner = { hidden: true, querySelector: () => ({ addEventListener: () => {} }) };
    let loads = 0;
    const consent = read('src/components/layout/CookieConsent.astro').match(/(\(\(\) => \{[\s\S]*\}\)\(\);)\s*<\/script>/)?.[1];
    expect(consent).toBeTruthy();
    runInNewContext(consent!, {
      localStorage: { getItem: (key: string) => key === 'aw-cookie-consent' ? 'accepted' : null },
      document: { getElementById: () => banner },
      window: { __awLoadTrackers: () => { loads++; } },
    });
    expect(loads).toBe(0);
    expect(banner.hidden).toBe(false);
    expect(read('src/components/layout/LegalContent.astro')).toContain(`localStorage.removeItem('${storageKey}')`);
  });

  for (const { file, keyRe, eventRe } of CONSUMERS) {
    test(`${file} hardcodes the canonical values`, () => {
      const src = read(file);
      const key = keyRe.exec(src)?.[1];
      const event = eventRe.exec(src)?.[1];
      expect(key, `${file}: storage-key literal not found or drifted`).toBe(storageKey);
      expect(event, `${file}: accepted-event literal not found or drifted`).toBe(acceptedEvent);
    });
  }
});

describe('production analytics consent loader', () => {
  const script = read('src/components/layout/BaseLayout.astro').match(
    /<script is:inline define:vars={{ gaId, gaHostname, adsenseClient }}>([\s\S]*?)<\/script>/,
  )?.[1];

  function browser(hostname: string) {
    const requests: string[] = [];
    const context: Record<string, unknown> = {
      gaId: 'G-TEST1234', gaHostname: 'chained-beasts.com', adsenseClient: '',
      location: { hostname },
      document: {
        createElement: () => ({}),
        head: { appendChild: (node: { src: string }) => requests.push(node.src) },
      },
    };
    context.window = context;
    if (!script) throw new Error('Analytics loader not found');
    runInNewContext(script, context);
    return { requests, context, accept: () => (context.__awLoadTrackers as () => void)() };
  }

  test('does not request Analytics before consent and initializes only once', () => {
    const page = browser('chained-beasts.com');
    expect(page.requests).toEqual([]);
    page.accept();
    page.accept();
    expect(page.requests).toEqual(['https://www.googletagmanager.com/gtag/js?id=G-TEST1234']);
    const events = (page.context.dataLayer as ArrayLike<unknown>[]).map(event => Array.from(event));
    expect(events.filter(event => event[0] === 'config')).toEqual([
      ['config', 'G-TEST1234', { allow_google_signals: false, allow_ad_personalization_signals: false }],
    ]);
  });

  test.each(['localhost', '127.0.0.1', 'preview.chainedbeasts.pages.dev'])(
    'does not send Analytics from %s even after consent', (hostname) => {
      const page = browser(hostname);
      page.accept();
      expect(page.requests).toEqual([]);
      expect(page.context.dataLayer).toBeUndefined();
    },
  );
});
