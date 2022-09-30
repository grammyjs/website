interface Favicon {
  icon: {
    /**
     * Icon file name
     */
    name: string;

    /**
     * `logo` for https://simpleicons.org/.
     * `icon` for https://icons.getbootstrap.com.
     */
    type: "icon" | "logo";

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
  };

  /**
   * Description text to be displayed in the tooltip
   */
  desc?: string;
}

/**
 * Base nav item, displayed as text
 */
export interface NavItem {
  text: string;
  ariaLabel?: string;
}
/**
 * Base nav group, has nav items children
 */
export interface NavGroup<T> extends NavItem {
  children: T[];
}
/**
 * Props for `<AutoLink>`
 */
export interface NavLink extends NavItem {
  link: string;
  rel?: string;
  target?: string;
  activeMatch?: string;
  /**
   * Add badges right after the navbar item.
   * It will fetch the icon from https://icons.getbootstrap.com and
   * https://simpleicons.org/.
   *
   * @see https://github.com/grammyjs/website/pull/507 for detailed instructions.
   *
   * For instance, this will show deno logo and fire icon:
   *
   * ```
   * badge: [
   *  {
   *   icon:
   *    {
   *      name: "deno",
   *      type: "logo",
   *    }
   *  },
   *  {
   *   icon:
   *    {
   *      name: "fire",
   *      type: "icon",
   *    }
   *  },
   * ]
   *
   * ```
   */
  favicon?: Favicon[];
}
/**
 * Navbar types
 */
export declare type NavbarItem = NavLink;
export declare type NavbarGroup = NavGroup<NavbarGroup | NavbarItem | string>;
export declare type NavbarConfig = (NavbarItem | NavbarGroup | string)[];
export declare type ResolvedNavbarItem =
  | NavbarItem
  | NavGroup<ResolvedNavbarItem>;
/**
 * Sidebar types
 */
export declare type SidebarItem = NavItem & Partial<NavLink>;
export declare type SidebarGroup =
  & SidebarItem
  & NavGroup<SidebarItem | SidebarGroup | string>;
export declare type SidebarGroupCollapsible = SidebarGroup & {
  collapsible?: boolean;
};
export declare type SidebarConfigArray =
  (SidebarItem | SidebarGroupCollapsible | string)[];
export declare type SidebarConfigObject = Record<string, SidebarConfigArray>;
export declare type SidebarConfig = SidebarConfigArray | SidebarConfigObject;
export declare type ResolvedSidebarItem =
  & SidebarItem
  & Partial<NavGroup<ResolvedSidebarItem>>
  & {
    collapsible?: boolean;
  };
