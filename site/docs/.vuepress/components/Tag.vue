<script setup lang="ts">
import { onBeforeMount, ref, type PropType } from "vue";
import { tagTemplate } from "./tag/tagTemplate";
import { fetchIcon } from "./tag/utils";
import type { Props, TagNav, Tag } from "../types";

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
    type: Object as PropType<TagNav>,
  }, // Props from navbar
  autotag: {
    type: Object as PropType<Props>,
  }, // Props from autotag component
});

const props = { ..._props, ..._props.nav, ..._props.autotag };
const element = props.link ? "a" : "div";
let showTag = ref(false);
let iconPadding = ref("var(--tag-padding)");
let iconPaddingDark = ref("var(--tag-padding)");
let iconPaddingRight = ref("0");
let iconPaddingRightDark = ref("0");
let textPadding = ref("var(--tag-padding)");
let textPaddingDark = ref("var(--tag-padding)");
let textPaddingLeft = ref("0");
let svgWidth = ref("0");
let iconOnly = ref(false);
let isHovering = ref(false); // cursor hovering on element
let isActive = ref(false); // click event

/**
 * Make text div height equal by adding an empty <svg>
 *   due to different rem size measurement between text and svg
 *   (1rem in text =/= 1 rem in svg).
 * */
let icon = ref("<svg></svg>");

let template: Tag;
// If template property is not specified by user, use the default one.
if (props.nav) {
  template = tagTemplate[props.template!] ?? tagTemplate.IconOnly;
} else {
  template = tagTemplate[props.template!] ?? tagTemplate.default;
}

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

let tagColor = ref(tag.color);
let tagColorDark = ref(tag.colorDark);

onBeforeMount(async () => {
  const iconResult = await fetchIcon(tag);
  icon.value = iconResult.value;

  if (iconResult.ok) {
    // Do the tag has a text label?
    if (tag.text.content) {
      textPaddingLeft.value = "var(--tag-padding)";
      /**
       * Make text and icon closer if iconBg color is equal with tag color.
       * But, it can't detect the same color with different type
       * (unless using third-party npm package).
       *
       * Ex: ("#ffffff" === "white") will evaluate to false.
       */
      if (tag.icon.bg !== tag.color) iconPaddingRight.value = "var(--tag-padding)";
      if (tag.icon.bgDark !== tag.colorDark) iconPaddingRightDark.value = "var(--tag-padding)";
    } else {
      if (tag.icon.bg === "transparent") {
        iconPadding.value = textPadding.value = "0";
        iconOnly.value = true;
      }
      if (tag.icon.bgDark === "transparent") {
        iconPaddingDark.value = textPaddingDark.value = "0";
        iconOnly.value = true;
      }
      tagColor.value = tag.icon.bg!;
      tagColorDark.value = tag.icon.bgDark!;
    }

    // iconPaddingLeft.value = "var(--tag-padding)";
    svgWidth.value = "var(--tag-svg-size)";
    // showIcon.value = true;
    showTag.value = true;
  } else {
    // Do not show tag when it does not have icon and text
    showTag.value = !!tag.text.content; // Return `false` if text is empty
  }
});
</script>

<template>
  <Transition>
    <component
      v-if="showTag"
      :is="element"
      :href="tag.link"
      :class="{ active: isActive, iconOnly: iconOnly }"
      :title="tag.desc"
      class="tag"
      @mouseover="isHovering = true"
      @mouseout="isHovering = false"
      @mousedown="isActive = true"
      @mouseup="isActive = false"
      v-cloak
    >
      <div v-html="icon" class="icon" :class="{ hover: isHovering, active: isActive }"></div>
      <span class="text" :class="{ hover: isHovering, active: isActive }">{{
        tag.text.content
      }}</span>
    </component>
  </Transition>
</template>

<style>
.tag {
  --tag-padding: 0.3rem;
  --tag-radius: 3px;
  --transition: 0.2s;
  --transition-hover: 0.1s;
  --tag-svg-size: 0.9rem;
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

.tag.iconOnly .icon svg {
  height: 1rem;
  width: 1rem;
}

html.dark .tag .icon svg {
  fill: v-bind("tag.icon.colorDark");
}

[v-cloak] {
  display: none;
}

.v-enter-active,
.v-leave-active {
  transition: opacity var(--transition) cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

<!-- Style for main page -->
<style>
.theme-default-content .tag .text {
  display: flex;
  align-items: center;
  align-self: stretch;
  padding: v-bind("textPadding");
  padding-left: v-bind("textPaddingLeft");
  border-top-right-radius: var(--tag-radius);
  border-bottom-right-radius: var(--tag-radius);
  color: v-bind("tag.text.color");
  background-color: v-bind("tagColor");
  transition: var(--transition);
}

html.dark .theme-default-content .tag .text {
  color: v-bind("tag.text.colorDark");
  padding: v-bind("textPaddingDark");
  padding-left: v-bind("textPaddingLeft");
  background-color: v-bind("tagColorDark");
  transition: var(--transition);
}

.theme-default-content .tag .icon {
  display: flex;
  align-items: center;
  align-self: stretch;
  padding: v-bind("iconPadding");
  padding-right: v-bind("iconPaddingRight");
  background-color: v-bind("tag.icon.bg");
  border-top-left-radius: var(--tag-radius);
  border-bottom-left-radius: var(--tag-radius);
  transition: var(--transition);
}

.theme-default-content .tag.iconOnly .icon {
  border-radius: var(--tag-radius);
}

html.dark .theme-default-content .tag .icon {
  background-color: v-bind("tag.icon.bgDark");
  padding: v-bind("iconPaddingDark");
  padding-right: v-bind("iconPaddingRightDark");
  transition: var(--transition);
}

.theme-default-content .tag .icon svg {
  transition: var(--transition);
}

html.dark .theme-default-content .tag .icon svg {
  fill: v-bind("tag.icon.colorDark");
}

.theme-default-content a.tag[href] .hover {
  box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.3);
  transition: var(--transition-hover);
  cursor: pointer;
}

.theme-default-content a.tag:hover {
  text-decoration: none;
  transition: var(--transition-hover);
}

.theme-default-content a.tag[href] .active {
  transform: scale(0.95);
}

.theme-default-content a.tag[href] .active {
  box-shadow: inset 0em 0em 0em 10em rgba(0, 0, 0, 0.3);
}

.theme-default-content a.tag[href]:hover .text {
  text-decoration: underline;
  text-underline-offset: 0.22em;
  text-decoration-color: v-bind("tag.text.color");
  transition: var(--transition-hover);
}

html.dark .theme-default-content a.tag[href]:hover .text {
  text-decoration-color: v-bind("tag.text.colorDark");
}

/* 
  Tag used in paragraph
*/

/* For tag inside table */
:is(html, html.dark) .theme-default-content td .tag .icon {
  margin-left: 0.2rem;
}

td .tag .icon svg {
  /* position:relative; */
  height: 1rem;
  width: 1rem;
}

td .tag {
  top: 0.1rem;
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

.sidebar .navbar-items :is(a:hover, a.router-link-active) .tag svg {
  transition: none;
  fill: var(--c-text-accent);
}

/**
NavbarItems
*/

nav .navbar-item > a .tag svg {
  transition: var(--transition);
}
</style>
