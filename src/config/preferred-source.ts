import { site } from './site';

/**
 * Enable only after Google's source picker lists this exact domain with a
 * selectable entry. A successful HTTP response or indexed homepage is not
 * sufficient. Keep the canonical domain even on local and preview builds.
 */
export const googlePreferredSource = {
  enabled: false,
  url: `https://www.google.com/preferences/source?q=${encodeURIComponent(site.domain)}`,
  badges: {
    light: '/images/google-preferred-source-light-en.png',
    dark: '/images/google-preferred-source-dark-en.png',
  },
};
