export async function fetchIcon(tag: Tag) {
  let result: Response;
  const icon = {
    ok: false,
    value: "<svg></svg>",
  };

  // Do not fetch if neither icon name nor icon type value defined
  if (tag.icon.name && tag.icon.type) {
    try {
      // fetch from assets folder first ...
      result = await fetch(`/tag/${tag.icon.type}/${tag.icon.name}.svg`);

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

export const tagType: Type = {
  deno: {
    desc: "Deno is available",
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
  nodejs: {
    desc: "Node.js is available",
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
  thirdparty: {
    desc: "Maintained by a community",
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
  favicon: {
    color: "transparent",
    text: {
      color: "inherit",
      colorDark: "inherit",
    },
    icon: {
      color: "var(--c-text)",
      colorDark: "var(--c-text)",
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
