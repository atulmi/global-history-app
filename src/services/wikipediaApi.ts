export type WikipediaArticle = {
  title: string;
  extract: string;
  lines: string[];
  url: string;
  country?: string;
};

const ABBREVS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st", "vs",
  "etc", "approx", "dept", "govt", "corp", "inc", "ltd", "co",
  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
  "no", "vol", "fig", "pp", "op", "ed", "rev", "est", "ca", "cf",
]);

export function parseExtractLines(extract: string): string[] {
  // Strip section headers (== Foo ==, === Bar ===, etc.) and join remaining lines
  const text = extract
    .split("\n")
    .filter((l) => !/^\s*=+[^=]+=+\s*$/.test(l))
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const sentences: string[] = [];
  const regex = /\. /g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const dotPos = match.index;
    const wordBefore = text.slice(0, dotPos).split(/\s+/).pop() ?? "";

    // Skip: dot-separated acronyms and initials (U.S, J.P, e.g, i.e)
    if (/^[a-zA-Z](\.[a-zA-Z])*$/.test(wordBefore)) continue;

    // Skip: known abbreviations (Dr, Mr, etc.)
    if (ABBREVS.has(wordBefore.toLowerCase())) continue;

    sentences.push(text.slice(lastIndex, dotPos + 1).trim());
    lastIndex = dotPos + 2;
  }

  const tail = text.slice(lastIndex).trim();
  if (tail) sentences.push(tail);

  return sentences.filter((s) => s.length > 0);
}

const TOPICS = [
  "history",
  "culture",
  "geography",
  "politics",
  "economy",
  "military",
  "religion",
  "architecture",
  "cuisine",
  "art",
  "sport",
  "science",
  "people",
  "literature",
  "music",
];

function pickNRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

async function searchArticles(
  query: string,
): Promise<{ title: string; snippet: string }[]> {
  const url =
    `https://en.wikipedia.org/w/api.php?` +
    `action=query&list=search&` +
    `srsearch=${encodeURIComponent(query)}&` +
    `format=json&origin=*&srlimit=50`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.query?.search ?? [];
}

function countOccurrences(text: string, term: string): number {
  let count = 0,
    pos = 0;
  while ((pos = text.indexOf(term, pos)) !== -1) {
    count++;
    pos += term.length;
  }
  return count;
}

/**
 * Scores how relevant an article is to a given country (higher = more relevant).
 * Articles need a score >= RELEVANCE_THRESHOLD to be included.
 *
 *  +2  Country name is in the article title            (strongest signal)
 *  +1  per mention in the snippet, up to +3            (frequency)
 *  +1  First mention is within the first 120 chars     (early / intro appearance)
 *  +1  Country name accounts for >= 8% of snippet text (density)
 *
 * Combining all four prevents individual signals from being gamed:
 *  - Title alone misses city/person articles ("Maseru", "Moshoeshoe I")
 *  - Frequency alone is fooled by major powers mentioned in ally articles
 *  - Position alone is fooled by articles that open with a geographic list
 *  - Density alone is fooled by short snippets with a single early mention
 */
const RELEVANCE_THRESHOLD = 3;

function relevanceScore(
  title: string,
  snippet: string,
  country: string,
): number {
  const countryLower = country.toLowerCase();
  const snippetText = snippet.replace(/<[^>]+>/g, "").toLowerCase();
  let score = 0;

  if (title.toLowerCase().includes(countryLower)) score += 2;

  const mentions = countOccurrences(snippetText, countryLower);
  score += Math.min(3, mentions);

  const firstPos = snippetText.indexOf(countryLower);
  if (firstPos !== -1 && firstPos <= 120) score += 1;

  const density =
    snippetText.length > 0
      ? (mentions * countryLower.length) / snippetText.length
      : 0;
  if (density >= 0.08) score += 1;

  return score;
}

// Always-run searches that ensure important article types are represented
// regardless of which random topics are picked this click.
const FIXED_SEARCHES = [
  "provinces states regions districts", // administrative divisions
  "president prime minister king emperor rulers leaders", // heads of state / rulers
];

const EXCLUDED_TITLE_PREFIXES = ["Outline of", "List of"];

/**
 * Fetches a random Wikipedia article for a country by running several
 * topic searches in parallel, then scoring each result and keeping only
 * those that meet the relevance threshold.
 *
 * Always includes searches for administrative divisions and leaders so
 * provinces, states, and important figures are consistently in the pool.
 */
export const fetchRandomCountryHistory = async (
  country: string,
): Promise<WikipediaArticle> => {
  try {
    const queries = [
      ...pickNRandom(TOPICS, 4).map((topic) => `${country} ${topic}`),
      ...FIXED_SEARCHES.map((terms) => `${country} ${terms}`),
    ];

    const results = await Promise.all(queries.map(searchArticles));

    const seen = new Set<string>();
    const articles = results.flat().filter(({ title, snippet }) => {
      if (seen.has(title)) return false;
      seen.add(title);
      if (EXCLUDED_TITLE_PREFIXES.some((prefix) => title.startsWith(prefix)))
        return false;
      return relevanceScore(title, snippet, country) >= RELEVANCE_THRESHOLD;
    });

    if (articles.length === 0) {
      throw new Error(`No articles found for ${country}`);
    }

    const randomArticle = articles[Math.floor(Math.random() * articles.length)];
    return await fetchArticleContent(randomArticle.title, country);
  } catch (error) {
    console.error("Error fetching country history:", error);
    throw error;
  }
};

const MIN_EXTRACT_LENGTH = 500;

async function fetchExtract(
  title: string,
  introOnly: boolean,
): Promise<{ page: any; url: string }> {
  const base =
    `https://en.wikipedia.org/w/api.php?` +
    `action=query&` +
    `titles=${encodeURIComponent(title)}&` +
    `prop=extracts|info&` +
    `explaintext=1&` +
    `inprop=url&` +
    `format=json&` +
    `origin=*`;
  const url = introOnly ? `${base}&exintro=1` : `${base}&exchars=5000`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query.pages;
  const page = pages[Object.keys(pages)[0]];
  return { page, url: page?.fullurl ?? "" };
}

/**
 * Fetches the content of a specific Wikipedia article.
 * Tries the intro section first; if it is shorter than MIN_EXTRACT_LENGTH
 * characters, fetches up to 5000 characters of the full article body so
 * that stubs and short intros still have enough content to display.
 */
export const fetchArticleContent = async (
  title: string,
  country?: string,
): Promise<WikipediaArticle> => {
  try {
    let { page } = await fetchExtract(title, true);

    if (!page || page.missing) {
      throw new Error(`Article not found: ${title}`);
    }

    if (!page.extract || page.extract.length < MIN_EXTRACT_LENGTH) {
      const full = await fetchExtract(title, false);
      if (full.page?.extract) page = full.page;
    }

    const extract = page.extract || "No content available";
    return {
      title: page.title,
      extract,
      lines: parseExtractLines(extract),
      url: page.fullurl,
      country,
    };
  } catch (error) {
    console.error("Error fetching article content:", error);
    throw error;
  }
};

/**
 * Fetches a completely random Wikipedia article
 */
export const fetchRandomArticle = async (): Promise<WikipediaArticle> => {
  try {
    const url =
      `https://en.wikipedia.org/w/api.php?` +
      `action=query&` +
      `list=random&` +
      `rnnamespace=0&` +
      `rnlimit=1&` +
      `format=json&` +
      `origin=*`;

    const response = await fetch(url);
    const data = await response.json();

    const randomPage = data.query.random[0];
    return await fetchArticleContent(randomPage.title);
  } catch (error) {
    console.error("Error fetching random article:", error);
    throw error;
  }
};
