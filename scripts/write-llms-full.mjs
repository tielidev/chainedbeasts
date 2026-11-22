// Postbuild: writes dist/llms-full.txt = dist/llms.txt + the readable text of the homepage, the
// FAQ page and every article llms.txt lists (capped). Runs after astro build on the built HTML.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_PAGES = 50;
const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", middot: "·", copy: "©", rarr: "→", larr: "←", times: "×" };
const decode = text => text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
  if (code[0] === "#") return String.fromCodePoint(code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10));
  return entities[code.toLowerCase()] ?? match;
});

export function htmlToText(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  return decode(main
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/(span|time|a|strong|em|b|small)>(?=<(span|time|a|strong|em|b|small)\b)/gi, "$& ")
    .replace(/<(script|style|noscript|svg|template|iframe|form|button|select|textarea|ins)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(span|i)\b[^>]*\baria-hidden="true"[^>]*>[^<]*<\/\1>/gi, "")
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, inner) => `\n\n${"#".repeat(Number(level))} ${inner.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").trim()}\n\n`)
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<(br|hr)\b[^>]*>/gi, "\n")
    .replace(/<\/(p|div|section|article|header|footer|figure|figcaption|blockquote|pre|table|tr|ul|ol|dl|dt|dd|details|summary|aside|nav|a)>/gi, m => m.toLowerCase() === "</a>" ? "</a> " : "\n")
    .replace(/<\/t[dh]>/gi, " | ")
    .replace(/<[^>]+>/g, ""))
    .split("\n")
    .map(line => line.replace(/[ \t ]+/g, " ").trim())
    .join("\n")
    .replace(/^- *$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function buildLlmsFull(dist, domain) {
  const llms = await readFile(join(dist, "llms.txt"), "utf8");
  const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const listed = [...llms.matchAll(new RegExp(`\\]\\(${escaped}(/[^)\\s]*)\\)`, "g"))].map(m => m[1]).filter(path => path.endsWith("/"));
  const paths = [...new Set(["/", "/faq/", ...listed])].slice(0, MAX_PAGES);
  const sections = [];
  for (const path of paths) {
    const html = await readFile(join(dist, path, "index.html"), "utf8");
    const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? path);
    sections.push(`---\n\n# ${title}\n\nURL: ${domain}${path}\n\n${htmlToText(html)}\n`);
  }
  return `${llms.trim()}\n\n# Full page text\n\nThe readable text of the homepage, the FAQ and the articles listed above, in the same order. Source: ${domain}/llms-full.txt\n\n${sections.join("\n")}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const dist = join(root, "dist");
  const domain = (process.env.SITE_URL || "https://chained-beasts.com").replace(/\/+$/, "");
  await writeFile(join(dist, "llms-full.txt"), await buildLlmsFull(dist, domain));
  console.log("Wrote dist/llms-full.txt");
}
