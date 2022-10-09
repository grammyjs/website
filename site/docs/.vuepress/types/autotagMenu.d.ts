import { Favicon } from "./index";

type Tag = Favicon & {
  /**
   * Change tag description according to the defined languages.
   *
   * @example
   *  { id: "Tag untuk halaman lokal Indonesia",}
   */
  locale?: Record<string, string>;
};
type Option = {
  /**
   * Add tags to all items in these menu path (case-sensitive).
   *
   * @example
   * This will add tags to all menu items inside `Tutorials` submenu inside `Hosting` menu.
   *
   * [
   *  [ "Hosting", "Tutorials" ],
   * ]
   */
  path: string[][];

  /**
   * Tag options.
   *
   * If tag `type` property is not defined, then it's mandatory to specify
   * either `text` or `icon` property.
   *
   * @example
   * This will add two tags:
   *
   * [
   *  {type: "official"},
   *  {text: "Tag 1"}
   * ]
   */
  tag: Tag[];

  /**
   * Implement only to these menu items (case-sensitive).
   *
   * @example
   * Only add tags to `Heroku` and `Virtual Private Server` item inside the choosen `path` menu.
   *
   * [ "Heroku", "Virtual Private Server" ]
   */
  include?: string[];

  /**
   * Exclude these menu items (case-sensitive).
   *
   * @example
   * Exclude `Comparison` and `Google Cloud Functions` item inside the choosen `path` menu.
   *
   * [ "Comparison", "Google Cloud Functions" ]
   */
  exclude?: string[];
};

type AutotagMenuOptions = Option[];
type AutotagMenuTag = Tag;

export { AutotagMenuOptions, AutotagMenuTag };
