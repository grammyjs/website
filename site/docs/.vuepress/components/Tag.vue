<script setup lang="ts">
import { onBeforeMount, ref, type PropType } from "vue";
import type { Favicon } from "../types/shared";

const _props = defineProps({
  type: String,
  desc: String,
  color: String,
  colorDark: String,
  text: String,
  textColor: String,
  textColorDark: String,
  icon: String,
  iconType: String,
  iconColor: String,
  iconColorDark: String,
  iconBg: String,
  iconBgDark: String,
  link: String,
  item: {
    type: Object as PropType<Favicon>,
  }, // Props from navbar
});

let props: Props | typeof _props;

if (_props.item) {
  // Props from navbar
  props = {
    type: "favicon",
    desc: _props.item.desc,
    icon: _props.item.icon.name,
    iconType: _props.item.icon.type,
    iconColor: _props.item.icon.color,
    iconColorDark: _props.item.icon.colorDark,
    link: undefined,
  };
} else {
  props = _props;
}

let showTag = ref();
let showIcon = ref();
let showText = ref();
let iconPaddingLeft = ref("0");
let iconPaddingRight = ref("0");
let iconPaddingRightDark = ref("0");
let iconRadiusRight = ref("0");
let textRadiusLeft = ref("var(--tag-radius)");
let svgWidth = ref("0");
let isHovering = ref(false); // cursor hovering on element
let isActive = ref(false); // click event
let desc: string | null | undefined;
let link: string | null | undefined;

/**
 * Make text div height equal by adding an empty <svg>
 *   due to different rem size measurement between text and svg
 *   (1rem in text =/= 1 rem in svg).
 *
 * */
let icon = ref("<svg></svg>");

const defaultType: Type = {
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

const defaultTag: TypeProp = defaultType[props.type!] ?? defaultType.default;

const tag: Tag = {
  color: props.color ?? defaultTag.color,
  colorDark: props.colorDark ?? props.color ?? defaultTag.colorDark ?? defaultTag.color,
  text: {
    content: props.text ?? defaultTag.text.content,
    color: props.textColor ?? defaultTag.text.color,
    colorDark:
      props.textColorDark ?? defaultTag.text.colorDark ?? props.textColor ?? defaultTag.text.color,
  },
  icon: {
    color: props.iconColor ?? defaultTag.icon.color,
    colorDark:
      props.iconColorDark ?? defaultTag.icon.colorDark ?? props.iconColor ?? defaultTag.icon.color,
    bg: props.iconBg ?? props.color ?? defaultTag.color,
    bgDark:
      props.iconBgDark ??
      props.iconBg ??
      props.colorDark ??
      props.color ??
      defaultTag.colorDark ??
      defaultTag.color,
    name: props.icon ?? defaultTag.icon.name,
    type: props.iconType ?? defaultTag.icon.type,
  },
};

// Priority user option instead of default one.
desc = props.desc ?? defaultTag.desc ?? tag.text.content;
link = props.link ?? null;

// Show tag if text is not empty (while waiting for icon to be fetched).
if (tag.text.content) {
  // Timeout for fetching icon. + add transition
  setTimeout(() => {
    showIcon.value = showTag.value ?? true;
    showText.value = showTag.value ?? true;
    showTag.value = showTag.value ?? true;
  }, 1500);
}

onBeforeMount(() => {
  async function loadTag() {
    let result: Response;
    let noIcon = false;

    if (!tag.icon.name || !tag.icon.type) {
      noIcon = true;
    } else {
      try {
        // fetch from assets folder first ...
        result = await fetch(`/tag/${tag.icon.type}/${tag.icon.name}.svg`);

        // ... if not available then download the file.
        if (!result.ok) {
          if (tag.icon.type === "logo") {
            result = await fetch(`https://simpleicons.org/icons/${tag.icon.name}.svg`);
          } else {
            result = await fetch(
              `https://icons.getbootstrap.com/assets/icons/${tag.icon.name}.svg`
            );
          }
          if (!result.ok) noIcon = true;
        }
      } catch (error) {
        noIcon = true;
        console.error(error);
      }
    }

    if (noIcon) {
      // Hide tag if it does not have text and icon.
      if (tag.text.content) {
        showIcon.value = true;
        showText.value = true;
        showTag.value = true;
      } else {
        showTag.value = false;
      }
      return;
    }

    try {
      const svg = await result!.text();
      // Remove title, width and height attributes to prevent clashing with CSS.
      icon.value = svg.replaceAll(/<title>.*?<\/title>|width=".*?"\s?|height=".*?"\s?/gm, "");

      if (tag.text.content) {
        /**
         * Make text and icon closer if iconBg color is equal with tag color.
         * Unfortunately, it can't detect the same color with different type
         * (unless using third-party npm package).
         *
         *  ex: ("#ffffff" === "white") will evaluate to false.
         */
        iconPaddingRight.value = tag.icon.bg === tag.color ? "0" : "var(--tag-padding)";
        iconPaddingRightDark.value = tag.icon.bgDark === tag.colorDark ? "0" : "var(--tag-padding)";
        textRadiusLeft.value = "0";
        showText.value = true;
      } else {
        iconPaddingRight.value = "var(--tag-padding)";
        iconPaddingRightDark.value = "var(--tag-padding)";
        iconRadiusRight.value = "var(--tag-radius)";
        showText.value = false;
      }

      iconPaddingLeft.value = "var(--tag-padding)";
      svgWidth.value = "var(--tag-svg-size)";
      showIcon.value = true;
      showTag.value = true;
    } catch (error) {
      console.error(error);
    }
  }

  loadTag();
});
</script>

<template>
  <a :href="link" v-if="showTag" class="tag" v-cloak>
    <div
      class="tag"
      :class="{ active: isActive }"
      :title="desc"
      @mouseover="isHovering = true"
      @mouseout="isHovering = false"
      @mousedown="isActive = true"
      @mouseup="isActive = false"
    >
      <div
        v-if="showIcon"
        v-html="icon"
        class="icon"
        :class="{ hover: isHovering, active: isActive }"
      ></div>
      <span v-if="showText" class="text" :class="{ hover: isHovering, active: isActive }">{{
        tag.text.content
      }}</span>
    </div>
  </a>
</template>

<style>
.tag {
  --tag-padding: 0.3rem;
  --tag-radius: 3px;
  --tag-svg-size: 0.9rem;
  --transition: 0.2s;
  --transition-hover: 0.1s;
}

.tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1rem;
}

.tag .icon svg {
  display: flex;
  height: var(--tag-svg-size);
  width: v-bind("svgWidth");
  fill: v-bind("tag.icon.color");
}

[v-cloak] {
  display: none;
}
</style>

<!-- Style for main page -->
<style>
.theme-default-content .tag .text {
  display: flex;
  align-items: center;
  align-self: stretch;
  padding: var(--tag-padding);
  border-radius: var(--tag-radius);
  color: v-bind("tag.text.color");
  background-color: v-bind("tag.color");
  border-top-left-radius: v-bind("textRadiusLeft");
  border-end-start-radius: v-bind("textRadiusLeft");
  transition: var(--transition);
}

html.dark .theme-default-content .tag .text {
  color: v-bind("tag.text.colorDark");
  background-color: v-bind("tag.colorDark");
  transition: var(--transition);
}

.theme-default-content .tag .icon {
  display: flex;
  align-items: center;
  align-self: stretch;
  padding: var(--tag-padding);
  padding-left: v-bind("iconPaddingLeft");
  padding-right: v-bind("iconPaddingRight");
  border-radius: var(--tag-radius);
  background-color: v-bind("tag.icon.bg");
  border-top-right-radius: v-bind("iconRadiusRight");
  border-bottom-right-radius: v-bind("iconRadiusRight");
  transition: var(--transition);
}

html.dark .theme-default-content .tag .icon {
  background-color: v-bind("tag.icon.bgDark");
  padding-right: v-bind("iconPaddingRightDark");
  transition: var(--transition);
}

.theme-default-content .tag .icon svg {
  transition: var(--transition);
}

html.dark .theme-default-content .tag .icon svg {
  fill: v-bind("tag.icon.colorDark");
}

.theme-default-content a.tag[href] .tag .hover {
  box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.3);
  transition: var(--transition-hover);
  cursor: pointer;
}

.theme-default-content a.tag:hover {
  text-decoration: none;
  transition: var(--transition-hover);
}

.theme-default-content a.tag[href] .tag.active {
  transform: scale(0.95);
}

.theme-default-content a.tag[href] .tag .active {
  box-shadow: inset 0em 0em 0em 10em rgba(0, 0, 0, 0.3);
}

.theme-default-content a.tag[href] .tag:hover .text {
  text-decoration: underline;
  text-underline-offset: 0.22em;
  text-decoration-color: v-bind("tag.text.color");
  transition: var(--transition-hover);
}

html.dark .theme-default-content a.tag[href] .tag:hover .text {
  text-decoration-color: v-bind("tag.text.colorDark");
}

/**
  * Make content inside tag unselectable.
  * When user try to copy the docs content, they most likely do not want to include the tag.
  */
.theme-default-content .tag {
  user-select: none;
  cursor: default;
}
</style>

<!-- Style for navitem -->
<style>
/**
NavbarDropdown
*/

.navbar-dropdown-wrapper .navbar-dropdown .navbar-dropdown-item a.tag {
  padding-left: 0;
  padding-right: 0;
  display: flex;
}

.navbar .tag .icon {
  padding: 0;
  background-color: transparent;
}

.navbar .tag .icon svg {
  height: 1.4em;
  width: 1.4em;
  fill: v-bind("tag.icon.color");
}

html.dark .navbar .tag .icon svg {
  fill: v-bind("tag.icon.colorDark");
}

.navbar-dropdown-wrapper
  .navbar-dropdown
  .navbar-dropdown-item
  :is(a.router-link-active, a:hover)
  .tag
  svg {
  fill: var(--c-text-accent);
}

.navbar-dropdown-wrapper
  .navbar-dropdown
  .navbar-dropdown-item
  h4.navbar-dropdown-subtitle
  > span:hover
  .tag
  svg {
  fill: v-bind("tag.icon.color");
}

html.dark
  .navbar-dropdown-wrapper
  .navbar-dropdown
  .navbar-dropdown-item
  h4.navbar-dropdown-subtitle
  > span:hover
  .tag
  svg {
  fill: v-bind("tag.icon.colorDark");
}

/**
NavbarItems
*/

nav .navbar-item > a .tag svg {
  transition: var(--transition);
}
</style>
