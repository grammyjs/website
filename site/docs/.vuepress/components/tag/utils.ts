import type { Tag } from "../../types";
import { withBase } from "@vuepress/client";

export async function fetchIcon(tag: Tag) {
  let result: Response;
  const icon = {
    ok: false,
    value: "<svg></svg>",
  };

  // Do not fetch if neither icon name nor icon type is defined
  if (tag.icon.name && tag.icon.type) {
    try {
      const assetUrl = withBase(`/tag/${tag.icon.type}/${tag.icon.name}.svg`); // prefix url with site base
      result = await fetch(assetUrl); // fetch from assets folder first ...

      // ... if not available then download the file.
      if (!result.ok) {
        if (tag.icon.type === "logo") {
          result = await fetch(
            `https://simpleicons.org/icons/${tag.icon.name}.svg`,
          );
        } else {
          result = await fetch(
            `https://icons.getbootstrap.com/assets/icons/${tag.icon.name}.svg`,
          );
        }
      }

      if (result.ok) {
        // convert file to svg html tag (<svg>...</svg>)
        const svg = await result.text();
        // Remove title, width and height attributes to prevent clashing with CSS.
        icon.value = svg.replaceAll(
          /<title>.*?<\/title>|width=".*?"\s?|height=".*?"\s?/gm,
          "",
        );
      }

      // show icon if result is "OK"
      icon.ok = result.ok;
    } catch (error) {
      // something is wrong! Do not show icon.
      icon.ok = false;
      console.error(error);
    }
  }
  return icon;
}
