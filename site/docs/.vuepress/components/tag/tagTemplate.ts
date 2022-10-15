import type { TagDefault } from "../../types";

export type TagTemplateIconOnly =
  | "denoIcon"
  | "nodejsIcon"
  | "officialIcon"
  | "thirdpartyIcon"
  | "iconOnly";
export type TagTemplateItem =
  | TagTemplateIconOnly
  | "deno"
  | "nodejs"
  | "official"
  | "thirdparty";
export const tagTemplate: TagDefault = {
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
  denoIcon: {
    color: "transparent",
    colorDark: "transparent",
    desc: "This setup is able to run Deno bots",
    text: {
      color: "transparent",
      colorDark: "transparent",
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
      name: "nodejs",
      type: "logo",
      color: "white",
      colorDark: "white",
    },
  },
  nodejsIcon: {
    color: "transparent",
    colorDark: "transparent",
    desc: "This setup is able to run Node.js bots",
    text: {
      color: "transparent",
      colorDark: "transparent",
    },
    icon: {
      name: "nodejs",
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
      name: "official",
      type: "icon",
      color: "white",
      colorDark: "white",
    },
  },
  officialIcon: {
    color: "transparent",
    colorDark: "transparent",
    desc: "Published and maintained by grammY",
    text: {
      color: "transparent",
      colorDark: "transparent",
    },
    icon: {
      name: "official",
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
      name: "thirdparty",
      type: "icon",
      color: "black",
      colorDark: "black",
    },
  },
  thirdpartyIcon: {
    color: "transparent",
    colorDark: "transparent",
    desc: "Maintained by a third-party",
    text: {
      color: "transparent",
      colorDark: "transparent",
    },
    icon: {
      name: "thirdparty",
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
  iconOnly: {
    color: "transparent",
    colorDark: "transparent",
    text: {
      color: "transparent",
      colorDark: "transparent",
    },
    icon: {
      color: "inherit",
      colorDark: "inherit",
      bg: "transparent",
      bgDark: "transparent",
    },
  },
};
