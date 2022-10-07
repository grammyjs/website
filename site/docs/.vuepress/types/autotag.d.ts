import type { Props } from "./Tag";

type AutotagItemUrl = `/${string}`;

type AutotagLocaleTagConfig = {
  /**
   * Tag text.
   *
   * If not defined, then use the main one.
   */
  text?: string;
  /**
   * Description text to be displayed on the tooltip.
   *
   * If not defined, then use the main one.
   */
  desc?: string;
};

type AutotagTag = Props & {
  /**
   * Change tag label according to the defined languages.
   *
   * @example
   * ```
   *  {
   *    id: {
   *      text: "TAG INDONESIA",
   *      desc: "Tag untuk halaman lokal Indonesia",
   *    }
   *  }
   * ```
   */
  locale?: Record<string, AutotagLocaleTagConfig>;
};

type AutotagItem = {
  /**
   * Add tags to all pages in these path.
   * It will be matched with the url page (case-sensitive).
   *
   * It should always start with a slash.
   *
   * @example
   * This will add tags to all pages inside `plugins` directory
   * and a `middlewares.md` file at the root of `hosting` folder
   * (note that .md extension will be converted to .html).
   *
   * ```
   * ["/plugins", "/hosting/middlewares.html"]
   * ```
   */
  url: AutotagItemUrl[];

  /**
   * Tag options.
   *
   * If tag `type` property is not defined, then it's mandatory to specify
   * either `text` or `icon` property.
   *
   * @example
   * This will add two tags:
   * ```
   * [ {type: "official"}, {text: "Tag 1"} ]
   * ```
   */
  tag: AutotagTag[];

  /**
   * implement only to these files/folders.
   *
   * @example
   * only add tags to folder `official` and all `middlewares.md` files
   * inside current `url` path
   * (note that .md extension will be converted to .html).
   *
   * ```
   * [ "/official", "middlewares.html" ]
   * ```
   */
  include?: string[];

  /**
   * Exclude these files/folders.
   *
   * @example
   * Exclude folder `official` and all `middlewares.md` files
   * inside current `url` path
   * (note that .md extension will be converted to .html).
   *
   * ```
   * [ "/official", "middlewares.html" ]
   * ```
   */
  exclude?: string[];
};

type AutotagOptions = AutotagItem[];
