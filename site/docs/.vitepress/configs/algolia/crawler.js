// https://github.com/vuejs/vitepress/issues/2592#issuecomment-1627642497
// with some modifications
new Crawler({
  appId: "RBF5Q0D7QV",
  apiKey: "...",
  rateLimit: 8,
  startUrls: ["https://grammy.dev"],
  renderJavaScript: false,
  sitemaps: ["https://grammy.dev/sitemap.xml"],
  exclusionPatterns: [],
  ignoreCanonicalTo: false,
  discoveryPatterns: ["https://grammy.dev/**"],
  schedule: "at 11:55 on Wednesday",
  actions: [
    {
      indexName: "grammy",
      pathsToMatch: ["https://grammy.dev/**"],
      recordExtractor: ({ helpers, url }) => {
        /** @type Record<string, number> */
        const PAGE_RANKS = {
          guide: 6,
          advanced: 5,
          plugins: 4,
          resources: 3,
          hosting: 2,
          ref: 1,
        };
        const segments = url.pathname.split("/").filter(Boolean);
        const [secondToLastSegment, lastSegment] = segments.slice(-2);

        let pageRank = 1;
        if (PAGE_RANKS[secondToLastSegment]) {
          pageRank = PAGE_RANKS[secondToLastSegment];
        } else if (PAGE_RANKS[lastSegment]) {
          pageRank = PAGE_RANKS[lastSegment];
        }

        return helpers.docsearch({
          recordProps: {
            lvl0: {
              selectors: [
                ".VPNavBarMenuLink.active",
                ".VPNavBarMenuGroup.active > button",
                ".VPSidebarItem.level-0.has-active > .item .text",
              ],
              defaultValue: "Documentation",
            },
            lvl1: ".content h1",
            lvl2: ".content h2",
            lvl3: ".content h3",
            lvl4: ".content h4",
            lvl5: ".content h5",
            lvl6: ".content h6",
            content: ".content p, .content li",
            pageRank,
          },
          indexHeadings: true,
          aggregateContent: true,
          recordVersion: "v3",
        });
      },
    },
  ],
  safetyChecks: { beforeIndexPublishing: { maxLostRecordsPercentage: 10 } },
  initialIndexSettings: {
    grammy: {
      attributesForFaceting: ["type", "lang"],
      attributesToRetrieve: [
        "hierarchy",
        "content",
        "anchor",
        "url",
        "url_without_anchor",
        "type",
      ],
      attributesToHighlight: ["hierarchy", "hierarchy_camel", "content"],
      attributesToSnippet: ["content:10"],
      camelCaseAttributes: ["hierarchy", "hierarchy_radio", "content"],
      searchableAttributes: [
        "unordered(hierarchy_radio_camel.lvl0)",
        "unordered(hierarchy_radio.lvl0)",
        "unordered(hierarchy_radio_camel.lvl1)",
        "unordered(hierarchy_radio.lvl1)",
        "unordered(hierarchy_radio_camel.lvl2)",
        "unordered(hierarchy_radio.lvl2)",
        "unordered(hierarchy_radio_camel.lvl3)",
        "unordered(hierarchy_radio.lvl3)",
        "unordered(hierarchy_radio_camel.lvl4)",
        "unordered(hierarchy_radio.lvl4)",
        "unordered(hierarchy_radio_camel.lvl5)",
        "unordered(hierarchy_radio.lvl5)",
        "unordered(hierarchy_radio_camel.lvl6)",
        "unordered(hierarchy_radio.lvl6)",
        "unordered(hierarchy_camel.lvl0)",
        "unordered(hierarchy.lvl0)",
        "unordered(hierarchy_camel.lvl1)",
        "unordered(hierarchy.lvl1)",
        "unordered(hierarchy_camel.lvl2)",
        "unordered(hierarchy.lvl2)",
        "unordered(hierarchy_camel.lvl3)",
        "unordered(hierarchy.lvl3)",
        "unordered(hierarchy_camel.lvl4)",
        "unordered(hierarchy.lvl4)",
        "unordered(hierarchy_camel.lvl5)",
        "unordered(hierarchy.lvl5)",
        "unordered(hierarchy_camel.lvl6)",
        "unordered(hierarchy.lvl6)",
        "content",
      ],
      distinct: true,
      attributeForDistinct: "url",
      customRanking: [
        "desc(weight.level)",
        "asc(weight.position)",
      ],
      ranking: [
        "desc(weight.pageRank)",
        "typo",
        "words",
        "filters",
        "proximity",
        "attribute",
        "exact",
        "custom",
      ],
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: "</span>",
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: "allOptional",
    },
  },
});
