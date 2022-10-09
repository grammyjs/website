<script lang="ts">
declare const __AUTOTAGMENU_CONFIG__: AutotagMenuOptions; // From .vuepress/plugins/autotagMenu.ts
declare const __NAVBAR_CONFIG__: false | NavbarConfig | undefined; // From .vuepress/theme/grammyTheme.ts
</script>

<script setup lang="ts">
import { useRoute } from "vue-router";
import type {
  AutotagMenuOptions,
  AutotagMenuTag,
  NavbarConfig,
  NavbarGroup,
  NavLink,
} from "../types/index";

const props = defineProps({
  // From `NavbarItems.vue`, `NavbarDropdown.vue`, and `AutoLink.vue`
  currentMenu: { type: Array<string>, required: true },
  menuIndex: { type: Array<number>, required: true },
});

const menuConfig = __AUTOTAGMENU_CONFIG__; // autotagMenu plugin config
const navbarConfig = __NAVBAR_CONFIG__; // Array of all navbar menus from .vuepress/config.ts
const tagList: AutotagMenuTag[] = []; // Collection of tags to be shown
const route = useRoute().path; // Current URL path
let showTag = false; // Should render tag? (Do not render if nothing to show).

let currentMenu: string[] = [];
let _tmp: (string | NavLink | NavbarGroup)[] = [];

if (navbarConfig) {
  /**
   * props.menuIndex: number[]
   *
   * Current menu position in navbar (menu index starts from 0).
   * We use index to locate the exact position of a menu since
   * the name of the menu will change depending on the selected language.
   *
   * @example
   * Navbar menu in grammy.dev
   * .
   * ├── Guide/
   * ├── Learn/
   * │   └── Guide
   * │   │   └── Overview
   * │   │   └── Introduction
   * │   │   └── Getting Started (*)
   * │   │   └── ...
   * │   └── Advanced
   * │       └── Overview (^)
   * |       └── ...
   * ├── Plugins/
   * │   └── Introduction
   * |   ...
   * ├── Examples
   * ...
   *
   * ex:
   * (*) [1, 0, 2] means we are currently on 2nd menu (Learn), 1st submenu (Guide), 3rd item (Getting Started)
   * (^) [1, 1, 0] means we are currently on 2nd menu (Learn), 2nd submenu (Advanced), 1st item (Overview)
   * */

  // Get the menu index and convert them to the actual menu name.
  for (const i of props.menuIndex) {
    // Get the navbar menu name based on current index
    let item = _tmp.length ? _tmp[i] : navbarConfig[i];

    if (typeof item !== "string" && item) {
      currentMenu.push(item.text); // Store the name

      if ("children" in item) {
        // If it contains a sub-menu, store them in a temporary variable for later processing.
        _tmp = item.children;
      }
    } else {
      /*
        Index is out of range. Exit the loop.
        This happens when the index contains menus that are generated automatically by vuepress.
        For example: language menu, Github repo link, search menu, etc.
      */
      break;
    }
  }
}

// Now match the current menu with the plugin config.
menuConfig.forEach((option) => {
  // Extract the paths
  for (const path of option.path) {
    let pathFound = false; // is the path matched with the current menu?
    let excludeFound = false; // Found the excluded menu item?
    let includeFound = true; // Found the included menu item?
    const exclude = option.exclude?.join("|"); // Regex. Match at least one of these items
    const include = option.include?.join("|"); // Regex. Match at least one of these items
    const currentMenuPath = currentMenu?.join(";"); // Regex. Separate each path with ;
    const pathString = path.join(";"); // // Regex. Separate each path with ;
    const regex = new RegExp(`^${pathString}`); // Prepare regex. Is this path matched with current menu?
    const regexExclude = new RegExp(`^${pathString}.*;(${exclude})`); // Prepare regex. Is there any excluded item in this path.
    const regexInclude = new RegExp(`^${pathString}.*;(${include})`); // Prepare regex. Is there any included item in this path.

    // Filter the sub-menu but do not include the menu itself (parent menu).
    if (currentMenuPath && pathString !== currentMenuPath) {
      // Begins the matching process.
      pathFound = regex.test(currentMenuPath);
      if (exclude) {
        excludeFound = regexExclude.test(currentMenuPath);
      }
      if (include) {
        includeFound = regexInclude.test(currentMenuPath);
      }
    }

    // If the path is matched with the current menu
    // AND the included menu item is found
    // AND does not contain any excluded menu item.
    if (pathFound && includeFound && !excludeFound) {
      // Extract the tags
      option.tag.forEach((tag) => {
        const _tag = { ...tag }; // Copy tag to temporary variable to protect the original one from being changed.
        _tag.template ??= "defaultIcon"; // If the tag template is empty, assign with value "defaultIcon"
        _tag.desc = tag.desc;

        // If current page is in locale, change the tag description according to the selected language.
        for (const lang in tag.locale) {
          if (route.startsWith(`/${lang}/`)) {
            _tag.desc = tag.locale[lang];
            break;
          }
        }
        tagList.push(_tag); // Add tag to the list
      });
      showTag = true; // The criteria have been met. Render the tag!
    }
  }
});
</script>

<template>
  <TagGroup v-if="showTag">
    <Tag v-for="item in tagList" :autotag="item" />
  </TagGroup>
</template>
