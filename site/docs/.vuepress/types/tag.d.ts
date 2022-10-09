import type { TagTemplateItem } from "../components/tag/tagTemplate";

type Tag = {
  /**
   * Tag color
   *
   * @example
   * `blue`, `fff000`, or any valid css color.
   */
  color: string;

  /**
   * Tag color for dark mode
   *
   * @example
   * `blue`, `fff000`, or any valid css color.
   */
  colorDark?: string;

  /**
   * Tag label
   */
  text: {
    /**
     * Text to be displayed
     */
    content?: string;

    /**
     * Text label color
     *
     * @example
     * `blue`, `fff000`, or any valid css color.
     */
    color: string;

    /**
     * Text label color for dark mode
     *
     * @example
     * `blue`, `fff000`, or any valid css color.
     */
    colorDark?: string;
  };

  /**
   * Tag icon
   */
  icon: {
    /**
     * `logo` for https://simpleicons.org/.
     * `icon` for https://icons.getbootstrap.com.
     */
    type?: string;

    /**
     * Icon filename
     *
     * All icon files is saved under `/docs/.vuepress/public/tag/`.
     * You can use a filename that available either from this `public` folder or from external source.
     *
     * For reliability, it's recommended to download these icon files into `public` folder
     * instead of fetching them directly from external source.
     *
     * List of available filename inside `public` folder:
     * ```
     * // Logo
     * "deno", "nodejs"
     * // Icon
     * "official", "thirdparty"
     * ```
     */
    name?: string;

    /**
     * Icon color
     *
     * @example
     * `blue`, `fff000`, or any valid css color.
     */
    color: string;

    /**
     * Icon color for dark mode
     *
     * @example
     * `blue`, `fff000`, or any valid css color.
     */
    colorDark?: string;

    /**
     * Icon background color
     *
     * @example
     * `blue`, `fff000`, or any valid css color.
     */
    bg?: string;

    /**
     * Icon background color for dark mode
     *
     * @example
     * `blue`, `fff000`, or any valid css color.
     */
    bgDark?: string;
  };

  /**
   * Description text to be displayed on the tooltip
   */
  desc?: string;

  /**
   * Assign link to tag. User will be redirected to this link when tag is pressed.
   *
   * `https://www.example.com`, `#anchor`, or any valid URL.
   */
  link?: string;
};

type PropsBase = {
  /**
   * Description text to be displayed on the tooltip
   */
  desc?: string;

  /**
   * Tag color
   *
   * @example
   * `blue`, `fff000`, or any valid css color.
   *
   * @default "black"
   */
  color?: string;

  /**
   * Tag color for dark mode
   *
   * @example
   * `blue`, `fff000`, or any valid css color.
   */
  colorDark?: string;

  /**
   * Text label color
   *
   * @example
   * `blue`, `fff000`, or any valid css color.
   */
  textColor?: string;

  /**
   * Text label color for dark mode
   *
   * @example
   * `blue`, `fff000`, or any valid css color.
   */
  textColorDark?: string;

  /**
   * Icon color
   *
   * `blue`, `fff000`, or any valid css color.
   */
  iconColor?: string;

  /**
   * Icon color for dark mode
   *
   * `blue`, `fff000`, or any valid css color.
   */
  iconColorDark?: string;

  /**
   * Icon background color
   *
   * @example
   * `blue`, `fff000`, or any valid css color.
   */
  iconBg?: string;

  /**
   * Icon background color for dark mode
   *
   * @example
   * `blue`, `fff000`, or any valid css color.
   */
  iconBgDark?: string;

  /**
   * Assign link to tag. User will be redirected to this link when tag is pressed.
   *
   * `https://www.example.com`, `#anchor`, or any valid URL.
   */
  link?: string;
};

// text or icon is required when type is not defined
type PropsNoTheme =
  | {
    /**
     * Tag template
     *
     * Use the available templates as the base of tag.
     */
    template?: TagTemplateItem;

    /**
     * Text to be displayed
     */
    text: string;

    /**
     * Icon filename
     */
    icon?: string;

    /**
     * `logo` for https://simpleicons.org/.
     * `icon` for https://icons.getbootstrap.com.
     */
    iconType?: "logo" | "icon";
  }
  | {
    /**
     * Tag template
     *
     * Use the available templates as the base of tag.
     */
    template?: TagTemplateItem;

    /**
     * Text to be displayed
     */
    text?: string;

    /**
     * Icon filename
     */
    icon: string;

    /**
     * `logo` for https://simpleicons.org/.
     * `icon` for https://icons.getbootstrap.com.
     */
    iconType: "logo" | "icon";
  };

// if type is defined then text and icon is optional
type PropsThemeExist = {
  /**
   * Tag template
   *
   * Use the available templates as the base of tag.
   */
  template?: TagTemplateItem;

  /**
   * Text to be displayed
   */
  text?: string;

  /**
   * Icon filename
   */
  icon?: string;

  /**
   * `logo` for https://simpleicons.org/.
   * `icon` for https://icons.getbootstrap.com.
   */
  iconType?: "logo" | "icon";
};

type Props = (PropsThemeExist & PropsBase) | (PropsNoTheme & PropsBase);
type TagDefault = Record<string, Tag>;

export { Props, Tag, TagDefault };
