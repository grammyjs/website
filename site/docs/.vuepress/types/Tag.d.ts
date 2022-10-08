export type Tag = {
  color: string;
  colorDark?: string;
  text: {
    content?: string;
    color: string;
    colorDark?: string;
  };
  icon: {
    color: string;
    colorDark?: string;
    bg?: string;
    bgDark?: string;
    name?: string;
    type?: string;
  };
  desc?: string;
  link?: string;
  template?: string;
};

export type TagDefault = Record<string, Tag>;

type PropsBase = {
  /**
   * Description text to be displayed on the tooltip
   */
  desc?: string;

  /**
   * Icon color
   *
   * `blue`, `fff000`, or any valid css color.
   *
   * @default "black"
   */
  color?: string;

  /**
   * Icon color for dark mode
   *
   * `blue`, `fff000`, or any valid css color.
   */
  colorDark?: string;

  /**
   * Text label color
   *
   * `blue`, `fff000`, or any valid css color.
   */
  textColor?: string;

  /**
   * Text label color for dark mode
   *
   * `blue`, `fff000`, or any valid css color.
   */
  textColorDark?: string;

  /**
   * `logo` for https://simpleicons.org/.
   * `icon` for https://icons.getbootstrap.com.
   */
  iconType?: "logo" | "icon";

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
   * `blue`, `fff000`, or any valid css color.
   */
  iconBg?: string;

  /**
   * Icon background color for dark mode
   *
   * `blue`, `fff000`, or any valid css color.
   */
  iconBgDark?: string;

  /**
   * Assign link to tag. User will be redirected to this link when tag is pressed.
   *
   * `https://www.example.com`, `#anchor`, or any valid URL.
   */
  link?: string;

  /**
   * Tag template
   *
   * Use the available templates as the base of tag.
   */
  template?:
    | "deno"
    | "nodejs"
    | "official"
    | "thirdparty"
    | "denoIcon"
    | "nodejsIcon"
    | "officialIcon"
    | "thirdpartyIcon";
};

// text or icon is required when type is not defined
type PropsNoType =
  | {
    /**
     * Text label
     */
    text: string;

    /**
     * Icon file name
     */
    icon?: string;
  }
  | {
    /**
     * Text label
     */
    text?: string;

    /**
     * Icon file name
     */
    icon: string;
  };

// if type is defined then text and icon is optional
type PropsDefinedType = {
  /**
   * Text label
   */
  text?: string;

  /**
   * Icon file name
   */
  icon?: string;
};

export type Props = (PropsDefinedType & PropsBase) | (PropsNoType & PropsBase);
