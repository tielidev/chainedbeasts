# Initial launch verification — October 15, 2026

- Source: https://github.com/tielidev/chainedbeasts, production branch main, native Cloudflare Pages Git integration.
- Canonical domain https://chained-beasts.com serves the English site. Both apex and www custom domains are active with SSL.
- Account-level Bulk Redirects preserve article paths and query strings from www and the exact production Pages host. Preview subdomains are excluded.
- Desktop (1440px) and phone (390px): homepage, category navigation, article cover/reading, mobile menu and search-result navigation checked. No horizontal overflow on checked pages.
- All 47 sitemap URLs returned 200. Genuine missing URLs return HTTP404.
- Googlebot-Image request to the stable favicon returned a real96×96PNG. Home HTML declares that icon, ICO, SVG, Apple and manifest assets.
- Search Console domain ownership verified via DNS TXT. Sitemap status Success; homepage live test passed and one indexing request was accepted. Search-result timing and favicon display remain controlled by Google.
- Local checks: lint, Astro typecheck, 241 applicable runtime tests, content/config consistency, generated-page links and launch verification. GitHub CI passed; Python-dependent tests also run on Linux.
- A live search check exposed an index mismatch during deployment. The postbuild cache version now includes index identity as well as UI code, with a regression test. Subsequent live search returned relevant results and followed the intended article URL.
- Advertising activation is documented separately in LAUNCH.md and verified after the actual approved units are installed. No Popunder, Social Bar, mobile anchors or adult-ad setting requested.

Screenshots and temporary browser logs remain local under ignored directories.

## Ad placement preparation

Local placeholder creatives confirmed that decline causes zero ad-document requests, phones load only the responsive native placement, and widening the viewport activates desktop placements after consent. Native height adjusts from 560px on phone to 180px on desktop without horizontal overflow. These checks establish layout behavior independently of network fill.

The approved three unit codes were retrieved from the publisher dashboard and deployed on October 15. Production decline and privacy reset passed. Acceptance starts the correct distinct unit requests. In this test network the native host returned a local DNS error (Cloudflare public DNS resolved it), and both banner script responses were HTTP200 with zero-length bodies. Actual creative fill therefore could not be confirmed; network-side delivery can vary. Empty wrappers collapse after ten seconds and reopen if content arrives. Original vendor snippets and URLs remain unchanged.

### Follow-up delivery investigation — October 15, 2026, 19:02 Singapore

The publisher dashboard remains Approved/Active with unchanged codes. Its UTC report for October 15 shows one reported impression for each banner, zero clicks and no native row. This confirms recorded activity, not visible creative fill. Account screenshots are kept only in ignored `.cache/`.

Direct top-level visits to both existing banner documents were also blank in the test browser, excluding the article consent and outer iframe as the cause of those empty responses. Browser Network showed HTTP200 with `Content-Length: 0`; its user agent identifies HeadlessChrome. Ordinary HTTP requests with the production referer returned 54,842 and 48,997 bytes for the two scripts. The ordinary Aside browser also rendered no creative; cross-origin timing sizes of zero alone do not establish response size or HTTP failure.

System DNS still returns NXDOMAIN for the native script hostname while public DNS resolves it. A single HTTPS request pinned to a public-DNS answer returned HTTP200 with zero bytes; this did not change system DNS. The native browser error is therefore a confirmed local DNS issue, but Adsterra no-fill versus client/transport-dependent filtering remains unresolved. Approval and reported impressions must not be used as a substitute for a visible-creative check on an independent connection.

At 19:04 Singapore the ordinary Aside browser (Chrome153, `navigator.webdriver=false`) displayed its content-filter block page on direct navigation to the banner invoke endpoint. A public GET from the existing article context failed to fetch. This establishes an additional browser filtering restriction; the actual ordinary-browser ad response body was unavailable, so it must not be reported as a zero-byte Adsterra response. The block screenshot also stays in ignored `.cache/`.

The user subsequently tested the article on a phone with Wi-Fi disabled, accepted consent and waited at the article end. No creative appeared and the native slot collapsed. This does not test the desktop banners, but prevents attributing all missing native delivery solely to the local Aside filter. Visible creative delivery remains unverified.

## Bing and Analytics follow-up — October 15, 2026

Bing ownership verification succeeded using a DNS-only CNAME, `fd328c630939a3c573a52219c6ad1cea.chained-beasts.com` pointing to `verify.bing.com`. Public DNS returned the expected value. Bing accepted `https://chained-beasts.com/sitemap-index.xml` and displayed the success notification and Processing status, with one known sitemap, zero errors and zero warnings. The homepage inspection reports Discovered but not crawled, discovered October 15. Submission and verification do not establish indexation.

Bing also accepted one homepage indexing request and displayed "Indexing requested." No repeated indexing request was made.

Analytics was initially blocked in Aside with `ERR_BLOCKED_BY_CLIENT`. After the user reopened a working Analytics page, searching Chained in the existing account returned no match. Created Chained Beasts in account `326743915`: property `559059847`, web stream `16134808242`, measurement ID `G-K064PHGJJP`, HTTPS production URL, Singapore time and USD. Enhanced measurement is limited to page views, scrolls, outbound clicks and file downloads. Google Signals remains disabled.

The code gates GA on both production hostname and affirmative consent, with a one-time loader and Google Signals/ad personalization disabled in configuration. Consent storage moves to v2 so older ad-only acceptance does not silently enable Analytics. Updated privacy copy and reset action use the same choice. Local checks passed: lint, 140-file typecheck, 246 tests (5 skipped), configuration/content checks, production-config build, 1,731 internal links, favicon/canonical/sitemap/search checks. Production browser verification follows deployment. Browser operations use Aside as recorded in AGENTS.md.

## Forty-article content and official branding release — October 15, 2026

The user approved publishing the forty source-reviewed articles now: seventeen expanded originals and twenty-three new articles. The long-term content map retains ten evidence-gated research topics. Those topics have no public article files. The release gate now validates the explicit forty-URL release scope, source review and cover assets; it still rejects an unapproved or out-of-scope indexable article. Tests cover the approved forty with ten unpublished drafts as well as invalid release cases.

Official press-kit wordmark and cropped lion artwork replace the previous header/footer mark and favicon family. Original source URLs, crop and dimensions are recorded in `docs/media-sources.json`; exports are deterministic and contain no generated or repainted artwork. The stable96×96PNG path is retained, with ICO, Apple and manifest images. An HTTP download from the branch preview returned a real96×96PNG matching the local file byte-for-byte; the lion crop was visually inspected from those downloaded pixels.

Preflight passed: production-environment release gate, Astro build, Pagefind index of40articles, typecheck of143files, lint,249tests with5platform-dependent skips, content/config/i18n checks,3,991internal links and launch checks for favicon/canonical/sitemap/search assets. Branch preview responses have `X-Robots-Tag: noindex, nofollow`; all forty article routes return200 with correct production canonicals, while all ten deferred routes return404.

Aside checks confirm the official marks, fan-site notice, sampled article images and sources, Steam Cloud/Xbox directory navigation and search-result navigation. Further pre-release and production acceptance results are recorded in the pull request. Phone viewport control is unavailable in the current Aside API; this remains an uncompleted manual check. Any evidence obtained by the earlier coordinate fallback is excluded. No other browser is used.

## Google Preferred Sources preparation — October 15, 2026

The shared button is placed below article metadata and above the cover, plus the footer brand area. It uses Google's unmodified English light/dark @2x badges (676×213), served locally with a338px maximum display width and proportional resizing. Theme selection follows the existing `.dark` class, including AMOLED mode. Sources and original hashes are recorded separately under Google ownership in `docs/media-sources.json`.

`src/config/preferred-source.ts` is the sole display switch and is deliberately `enabled: false`. Disabled renders contain no button, badge images, outbound preference link or empty wrapper. The link is derived from the configured canonical domain, never the browser hostname: `https://www.google.com/preferences/source?q=chained-beasts.com`. It opens in a new tab with an accessible English label. This is a static user-initiated link, without publisher.js, API credentials, an OAuth flow or a fabricated added state.

Initial read-only Google checks returned No results for this site. Before enabling, open the official source picker and verify that the exact canonical domain appears with an enabled selection control. An HTTP200 response or an indexed homepage is insufficient evidence. Stop before changing any personal source preference. Once verified, set the configuration switch to true, validate a preview and publish through the normal GitHub → Cloudflare flow. Until then the production switch stays false; this preparation does not start automatic availability polling.

Validation covers an isolated enabled build and the disabled production build: one footer button on the homepage, two correctly placed links on an article, correct canonical-domain destination and new-tab attributes, no disabled output in74HTML files,145-file typecheck,249passing tests with5platform-dependent skips, configuration/content/i18n checks,3,991internal links, and existing launch/favicon/search checks. Aside browser findings and deployment checks are retained in the pull request; unsupported phone viewport checks remain uncompleted.

