/**
 * Site configuration — the single source of truth for game-specific metadata.
 *
 * 👉 APPLY TEMPLATE: Change every field here when building a new game wiki.
 * This is part of the CONFIG LAYER — framework code reads from here, never the reverse.
 */

export interface SiteConfig {
  /** Full site name, used in <title> suffix and Organization JSON-LD. e.g. "Anvil Quest Wiki" */
  name: string;
  /** Short name for PWA manifest, mobile logo, and the long-title <title> suffix (>50 chars). e.g. "AQ Wiki" */
  shortName: string;
  /** Site description for Organization JSON-LD and og:site_name. */
  description: string;
  /** Domain without protocol or trailing slash. e.g. "anvilquestwiki.wiki" */
  domain: string;
  /** Hero tagline shown under the site title. */
  tagline: string;
  /** Copyright / legal disclaimer line shown in footer. */
  legalNotice: string;
  /**
   * Optional public contact email — rendered as a mailto link on the contact
   * page when set. AdSense reviewers look for a reachable contact channel;
   * if you run no social channels, set this.
   */
  contactEmail?: string;
  contactUrl?: string;
  defaultTheme?: string;
  social: {
    /** Official game website URL (the game itself, not the wiki). */
    official: string;
    discord?: string;
    youtube?: string;
    twitter?: string;
    reddit?: string;
  };
  /**
   * Canonical URLs about the GAME (Steam page, official site, Wikipedia entry…).
   * Emitted as Organization JSON-LD `sameAs` — helps Google / AI engines link
   * this wiki to the game's knowledge-graph entity.
   */
  sameAs?: string[];
  game: {
    /** Full game name. */
    name: string;
    /** Platform: "Roblox" | "Steam" | "Epic Games" | "Mobile" | ... */
    platform: string;
    /** Developer / studio name. */
    developer: string;
    /** Genre description. */
    genre: string;
    /** ISO release date (optional). */
    releaseDate?: string;
  };
  /**
   * Dimensions of the default OG/Twitter share image (public/images/hero.webp).
   * Emitted as og:image:width / og:image:height so social crawlers can render
   * the share card without downloading the image first.
   */
  ogImageWidth: number;
  ogImageHeight: number;
  /** Default author name for articles without an explicit `author` in frontmatter (E-E-A-T signal). */
  defaultAuthor?: string;
}

export const site: SiteConfig = {
  name: 'Chained Beasts Wiki & Guides',
  shortName: 'Chained Beasts',
  description: 'Chained Beasts guides, co-op tips, combat mechanics, beasts and official news. An independent English resource with clearly sourced advice.',
  domain: 'chained-beasts.com',
  tagline: 'Survive the arena. Together.',
  legalNotice: 'An independent fan site. Not affiliated with Featherweight Games. Game artwork and trademarks belong to their respective owners.',
  // Set a real address if you run no social channels — the contact page
  // renders it as a mailto link.
  contactEmail: '',
  contactUrl: 'https://github.com/tielidev/chainedbeasts/issues',
  defaultTheme: 'dark',
  social: {
    official: 'https://store.steampowered.com/app/3569420/Chained_Beasts/',
  },
  game: {
    name: 'Chained Beasts',
    platform: 'PC, PlayStation 5, Xbox Series X|S, Nintendo Switch',
    developer: 'Featherweight Games',
    genre: 'Co-op gladiator roguelike',
    releaseDate: '2026-10-15',
  },
  // og:image dims of the SHIPPED hero.webp — if you replace public/images/hero.webp,
  // update these in src/config/site.ts to match (wrong dims mis-crop share cards).
  ogImageWidth: 1600,
  ogImageHeight: 900,
};

/** Directory verification links for this site; these do not imply approval. */
export const directoryProfiles: Array<{ name: string; href: string; image?: string; width?: number }> = [
  { name: 'ShowMySites', href: 'https://www.showmysites.com' },
  { name: 'Uno Directory', href: 'https://uno.directory', image: 'https://uno.directory/uno-directory.svg', width: 120 },
  { name: 'Lovable App', href: 'https://lovableapp.org', image: 'https://lovableapp.org/lovable-app-badge.svg', width: 160 },
  { name: 'ufind.best', href: 'https://ufind.best/products/chained-beasts-wiki-guides', image: 'https://ufind.best/badges/ufind-best-badge-light.svg', width: 150 },
];

/** Absolute site URL (no trailing slash). Falls back to the Astro `site` config. */
export const siteUrl: string = (process.env.SITE_URL || `https://${site.domain}`).replace(
  /\/$/,
  '',
);
