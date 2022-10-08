import type { Tag, TagDefault } from "../../types";
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

export const tagType: TagDefault = {
  deno: {
    desc: "This setup is able to run Deno bots",
    color: "black",
    colorDark: "white",
    text: {
      content: "DENO",
      color: "white",
      colorDark: "black",
    },
    icon: {
      name: "deno",
      type: "logo",
      color: "white",
      colorDark: "black",
    },
  },
  iconDeno: {
    color: "transparent",
    desc: "This setup is able to run Deno bots",
    text: {
      color: "transparent",
    },
    icon: {
      name: "deno",
      type: "logo",
      color: "black",
      colorDark: "white",
      bg: "transparent",
      bgDark: "transparent",
    },
  },
  nodejs: {
    desc: "This setup is able to run Node.js bots",
    color: "#689f63",
    colorDark: "#689f63",
    text: {
      content: "NODE.JS",
      color: "white",
      colorDark: "white",
    },
    icon: {
      name: "nodedotjs",
      type: "logo",
      color: "white",
      colorDark: "white",
    },
  },
  iconNodejs: {
    color: "transparent",
    desc: "This setup is able to run Node.js bots",
    text: {
      color: "transparent",
    },
    icon: {
      name: "nodedotjs",
      type: "logo",
      color: "#689f63",
      colorDark: "#689f63",
      bg: "transparent",
      bgDark: "transparent",
    },
  },
  official: {
    desc: "Published and maintained by grammY",
    color: "#009dca",
    colorDark: "#009dca",
    text: {
      content: "OFFICIAL",
      color: "white",
      colorDark: "white",
    },
    icon: {
      name: "patch-check-fill",
      type: "icon",
      color: "white",
      colorDark: "white",
    },
  },
  iconOfficial: {
    color: "transparent",
    desc: "Published and maintained by grammY",
    text: {
      color: "transparent",
    },
    icon: {
      name: "patch-check-fill",
      type: "icon",
      color: "#009dca",
      colorDark: "#009dca",
      bg: "transparent",
      bgDark: "transparent",
    },
  },
  thirdparty: {
    desc: "Maintained by a third-party",
    color: "#ffe005",
    colorDark: "#ffe005",
    text: {
      content: "THIRD-PARTY",
      color: "black",
      colorDark: "black",
    },
    icon: {
      name: "people-fill",
      type: "icon",
      color: "black",
      colorDark: "black",
    },
  },
  iconThirdparty: {
    color: "transparent",
    desc: "Maintained by a third-party",
    text: {
      color: "transparent",
    },
    icon: {
      name: "patch-check-fill",
      type: "icon",
      color: "#ffe005",
      colorDark: "#ffe005",
      bg: "transparent",
      bgDark: "transparent",
    },
  },
  default: {
    color: "#34404c",
    text: {
      color: "white",
    },
    icon: {
      color: "white",
    },
  },
};
