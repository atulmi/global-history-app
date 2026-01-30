export type WikipediaArticle = {
  title: string;
  extract: string;
  url: string;
  country?: string;
};

/**
 * Fetches random history-related articles for a specific country
 */
export const fetchRandomCountryHistory = async (
  country: string
): Promise<WikipediaArticle> => {
  try {
    // Search for history-related articles about the country
    const searchUrl =
      `https://en.wikipedia.org/w/api.php?` +
      `action=query&` +
      `list=search&` +
      `srsearch=${encodeURIComponent(country)} history&` +
      `format=json&` +
      `origin=*&` +
      `srlimit=20`; // Get top 20 results to pick from

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    const articles = searchData.query.search;

    if (!articles || articles.length === 0) {
      throw new Error(`No articles found for ${country}`);
    }

    // Pick a random article from the results
    const randomIndex = Math.floor(Math.random() * articles.length);
    const randomArticle = articles[randomIndex];

    // Fetch the full article content
    return await fetchArticleContent(randomArticle.title, country);
  } catch (error) {
    console.error("Error fetching country history:", error);
    throw error;
  }
};

/**
 * Fetches the content of a specific Wikipedia article
 */
export const fetchArticleContent = async (
  title: string,
  country?: string
): Promise<WikipediaArticle> => {
  try {
    const url =
      `https://en.wikipedia.org/w/api.php?` +
      `action=query&` +
      `titles=${encodeURIComponent(title)}&` +
      `prop=extracts|info&` +
      `exintro=1&` + // Just the intro section
      `explaintext=1&` + // Plain text, no HTML
      `inprop=url&` +
      `format=json&` +
      `origin=*`;

    const response = await fetch(url);
    const data = await response.json();

    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page || page.missing) {
      throw new Error(`Article not found: ${title}`);
    }

    return {
      title: page.title,
      extract: page.extract || "No content available",
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
      `rnnamespace=0&` + // Main articles only
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
