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

Local placeholder creatives confirmed that decline causes zero ad-document requests, phones load only the responsive native placement, and widening the viewport activates desktop placements after consent. Native height adjusts from 560px on phone to 180px on desktop without horizontal overflow. These checks do not establish real Adsterra fill: vendor codes are still required.

