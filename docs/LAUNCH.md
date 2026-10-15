# Chained Beasts deployment and advertising

Canonical site: https://chained-beasts.com
GitHub: https://github.com/tielidev/chainedbeasts

## Deployment

Cloudflare Pages uses GitHub native Git integration, production branch `main`, build command `pnpm build`, output directory `dist`, Node 22. Domain and optional public settings live in `wrangler.toml`. Preview branches must remain noindex; `_headers` supplies this for Pages preview hosts. Canonical-host redirects use account-level Bulk Redirects for the exact production Pages hostname and www host; branch previews remain usable. Enable subpath matching and preserve path suffix/query; do not include Pages subdomains.

Verify locally with `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm check-content`, `pnpm check-config`, `pnpm build`, `node scripts/check-launch.mjs`, `pnpm check-links`, and `pnpm check-i18n --strict-ui`.

The retained template-demo test files are excluded explicitly in Vitest because they require the deleted marketing pages, Japanese demo articles and fictional codes. Applicable utility, SEO, URL, consent and content tests remain enabled. Astro typechecking covers production source; Vitest runs the test source.

After each deployment, check the actual custom domain on desktop and phone: home, a category, article navigation, search results, menu, images, a real 404, raster favicon, robots and sitemap. Roll back through Cloudflare deployment history if needed.

## Google

The fixed raster icon is `/favicon-96x96.png` (96×96 PNG). The site also supplies ICO, SVG, Apple and manifest icons. It is linked from all page heads and accessible without script execution. Search Console verification and homepage indexing requests are account operations, not proof of search-result icon display. Google controls crawling and search appearance.

## Adsterra activation

Only request banner/native formats. Do not request Popunder, Social Bar or mobile anchors for this launch.

1. Add the HTTPS production domain to the publisher account after site verification. Use the relevant games/entertainment category.
2. Obtain an approved, distinct code for each placement. Store each untouched snippet in its own `public/ads/<name>.html` document. Do not duplicate one code in multiple simultaneous positions.
3. Available article placements: `incontent-728x90` (desktop), `sidebar-160x300` (desktop), `native-banner` (responsive article end). Match each iframe's dimensions to the actual approved unit. Check responsive native height at both device sizes; resize the container if the real unit requires more height.
4. Enable only those slots through their corresponding `PUBLIC_ADSTERRA_SLOT_*` settings in `wrangler.toml`. These values are public configuration, never account passwords or API credentials.
5. Add only actual ads.txt entries supplied by the network. A comments-only ads.txt is intentional until then.
6. Redeploy; confirm no ad requests before acceptance or after decline, ads load after acceptance, privacy-choice reset works, each placement fills at its real dimensions, and no overflow or obscured reading occurs.

Contact uses the public GitHub issues page until a verified operator email is supplied. No invented email address is published.

### Approved units — October 15, 2026

Adsterra website ID `6124805` is Approved. The three units are Active in the publisher account: Native Banner `31743487`, sidebar 160×300 `31743488`, and leaderboard 728×90 `31743489`. The site enables only the sidebar and leaderboard. Native Banner was disabled site-wide on October 15, 2026 because it repeatedly displayed an empty white frame; `PUBLIC_ADSTERRA_SLOT_NATIVE_BANNER` is empty, which removes its iframe, label and spacing. Its original snippet and reusable component remain available for a future delivery check before re-enabling. Original Get code snippets are stored in the respective HTML wrappers under `public/ads/`. Adult ads remain off. The inspected unit dialogs and website About menu supplied no ads.txt seller records, so that file remains comments-only. Do not substitute unit IDs for seller IDs.

Advertising waits for the visitor's consent. Fixed desktop units are hidden on phones; the leaderboard also hides when its actual content column is narrower than 728px. Native content reports its height to the parent so mobile cards are not clipped. Local fixtures verify consent and resizing; real delivery must also be checked on the deployed domain.

## Content and media

Sources and build/version limits are recorded in each article. `docs/media-sources.json` records official promotional screenshot URLs and rights attribution. The MIT code license does not grant a license to third-party game artwork. Original UI icon artwork is a site-specific SVG chain mark; no AI-generated game artwork is used.
