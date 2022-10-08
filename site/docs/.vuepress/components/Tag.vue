<script setup lang="ts">
import { onBeforeMount, ref, type PropType } from "vue";
import { tagTemplate } from "./tag/tagTemplate";
import { fetchIcon } from "./tag/utils";
import type { Props, Favicon, Tag } from "../types";

// Get user options
const _props = defineProps({
  template: String,
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
  nav: {
    type: Object as PropType<Favicon>,
  }, // Props from navbar
  autotag: {
    type: Object as PropType<Props>,
  }, // Props from autotag component
});

const props = { ..._props, ..._props.nav, ..._props.autotag };
const element = props.link ? "a" : "div";
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

/**
 * Make text div height equal by adding an empty <svg>
 *   due to different rem size measurement between text and svg
 *   (1rem in text =/= 1 rem in svg).
 * */
let icon = ref("<svg></svg>");

// If template property is not specified by user, use the default one.
const template: Tag = tagTemplate[props.template!] ?? tagTemplate.default;

// Assign properties and add some fallbacks
const tag: Tag = {
  color: props.color ?? template.color,
  text: {
    content: props.text ?? template.text.content,
    color: props.textColor ?? template.text.color,
  },
  icon: {
    color: props.iconColor ?? template.icon.color,
    bg: props.iconBg ?? props.color ?? template.color,
    name: props.icon ?? template.icon.name,
    type: props.iconType ?? template.icon.type,
  },
  desc: props.desc ?? template.desc,
  link: props.link,
};

tag.desc ??= tag.text.content;
tag.colorDark = props.colorDark ?? template.colorDark ?? tag.color;
tag.text.colorDark = props.textColorDark ?? template.text.colorDark ?? tag.text.color;
tag.icon.colorDark = props.iconColorDark ?? template.icon.colorDark ?? tag.icon.color;
tag.icon.bgDark =
  props.iconBgDark ??
  props.iconBg ??
  props.colorDark ??
  props.color ??
  template.colorDark ??
  template.color;

// Show tag if text is not empty.
if (tag.text.content) {
  // Show tag immediately when timeout is reached (the icon is taking too long to fetch).
  setTimeout(() => {
    showIcon.value = showText.value = showTag.value ??= true;
  }, 1500);
}

onBeforeMount(async () => {
  const iconResult = await fetchIcon(tag);
  icon.value = iconResult.value;

  if (iconResult.ok) {
    // Do tag has text?
    if (tag.text.content) {
      /**
       * Make text and icon closer if iconBg color is equal with tag color.
       * Unfortunately, it can't detect the same color with different type
       * (unless using third-party npm package).
       *
       * Ex: ("#ffffff" === "white") will evaluate to false.
       */
      iconPaddingRight.value = tag.icon.bg === tag.color ? "0" : "var(--tag-padding)";
      iconPaddingRightDark.value = tag.icon.bgDark === tag.colorDark ? "0" : "var(--tag-padding)";

      // Since we have an icon, remove the text radius on left side to make it blend with the icon.
      textRadiusLeft.value = "0";
      showText.value = true;
    } else {
      // Hide text element and make the icon padding rounded on all sides
      iconPaddingRight.value = "var(--tag-padding)";
      iconPaddingRightDark.value = "var(--tag-padding)";
      iconRadiusRight.value = "var(--tag-radius)";
      showText.value = false;
    }

    iconPaddingLeft.value = "var(--tag-padding)";
    svgWidth.value = "var(--tag-svg-size)";
    showIcon.value = true;
    showTag.value = true;
  } else {
    // Do tag has text label?
    if (tag.text.content) {
      // show all of them
      showIcon.value = showText.value = showTag.value = true;
    } else {
      // do not show tag at all since it does not have icon and text
      showTag.value = false;
    }
  }
});
</script>

<template>
  <component :is="element" :href="tag.link" v-if="showTag" class="tag" v-cloak>
    <div
      class="tag"
      :class="{ active: isActive }"
      :title="tag.desc"
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
  </component>
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
  position: relative;
  display: inline-flex;
  height: var(--tag-svg-size);
  width: v-bind("svgWidth");
  fill: v-bind("tag.icon.color");
  vertical-align: middle;
  top: -0.01rem;
}

html.dark .tag .icon svg {
  fill: v-bind("tag.icon.colorDark");
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

.navbar-dropdown-wrapper .navbar-dropdown .navbar-dropdown-item :is(a.tag, div.tag) {
  padding-left: 0;
  padding-right: 0;
  display: flex;
}

:is(.navbar .sidebar) .tag .icon {
  padding: 0;
  background-color: transparent;
}

.navbar .tag .icon svg {
  height: 0.95rem;
  width: 0.95rem;
  top: -0.1rem;
  fill: v-bind("tag.icon.color");
}

.navbar h4.navbar-dropdown-subtitle > span .tag .icon svg {
  top: -0.3rem;
}

.navbar h4.navbar-dropdown-subtitle > a .tag .icon svg {
  top: -0.13rem;
}

html.dark :is(.navbar .sidebar) .tag .icon svg {
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

For mobile devices
*/

.sidebar .tag .icon svg {
  width: 1rem;
  height: 1rem;
  top: -0.15rem;
}

.sidebar .navbar-dropdown-wrapper .navbar-dropdown-subtitle > span .tag .icon svg {
  top: -0.08rem;
}

/**
NavbarItems
*/

nav .navbar-item > a .tag svg {
  transition: var(--transition);
}
</style>
