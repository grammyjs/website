interface TypeProp {
  /**
   * Tag color
   *
   * `blue`, `fff000`, or any valid css color.
   */
  color: string;

  /**
   * Badge color for dark mode
   *
   * `blue`, `fff000`, or any valid css color.
   */
  colorDark?: string | null;

  text: {
    /**
     * Add text into badge
     */
    content?: string | null;

    /**
     * Add color to text
     *
     * `blue`, `fff000`, or any valid css color.
     */
    color: string;

    /**
     * Text color for dark mode
     *
     * `blue`, `fff000`, or any valid css color.
     */
    colorDark?: string | null;
  };

  icon: {
    /**
     * Logo/icon file name
     */
    name?: string | null;

    /**
     * `logo` for https://simpleicons.org/.
     * `icon` for https://icons.getbootstrap.com.
     */
    type?: "icon" | "logo" | null;

    /**
     * Icon color
     *
     * `blue`, `fff000`, or any valid css color.
     */
    color: string;

    /**
     * Icon color for dark mode
     *
     * `blue`, `fff000`, or any valid css color.
     */
    colorDark?: string | null;

    /**
     * Background icon color
     *
     * `blue`, `fff000`, or any valid css color.
     */
    bg?: string | null;

    /**
     * Background icon color for dark mode
     *
     * `blue`, `fff000`, or any valid css color.
     */
    bgDark?: string | null;
  };

  /**
   * Description text to be displayed in the tooltip
   */
  desc?: string | null;
}

interface Type {
  [key: string]: TypeProp;
}

interface Tag {
  color: string;
  colorDark: string;
  text: {
    content?: string | null;
    color: string;
    colorDark: string;
  };
  icon: {
    color: string;
    colorDark: string;
    bg: string;
    bgDark: string;
    name?: string | null;
    type?: string | null;
  };
}

interface Props {
  type: string;
  desc: string;
  color: string;
  colorDark: string;
  text: string;
  textColor: string;
  textColorDark: string;
  icon: string;
  iconType: string;
  iconColor: string;
  iconColorDark: string;
  iconBg: string;
  iconBgDark: string;
  link: string;
  type: string;
}
