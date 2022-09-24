<script setup lang="ts">
import { ref } from "vue";

type Data = {
  data: typeof tag;
  defaultName?: String;
  defaultType?: "logo" | "icon" | undefined;
};

const loadIcon = async ({ data, defaultName = "", defaultType = undefined}: Data) => {
  let type = defaultType;
  let name = defaultName;

  if (data.logo) {
    name = data.logo;
    type = "logo";
  } else if (data.icon) {
    name = data.icon;
    type = "icon";
  } else if (!name || !type) {
    textPaddingLeft = 0;
    tag.iconBg = data.color!;
    ok.value = true;
    return;
  }

  let result = await fetch(`/tag/${type}/${name}.svg`);

  if (!result.ok) {
    try {
      if (type === "logo") {
        result = await fetch(`https://simpleicons.org/icons/${name}.svg`);
      } else {
        result = await fetch(
          `https://icons.getbootstrap.com/assets/icons/${name}.svg`
        );
      }
      if (!result.ok) throw(result);
    }
    catch (_error) {
      textPaddingLeft = 0;
      tag.iconBg = data.color!;
      ok.value = true;
      return;
    }
  }
  
  const svg = await result.text();

  // Remove title, width and height attributes to prevent clashing with CSS.
  icon.value = svg.replaceAll(/<title>.*?<\/title>|width=".*?"\s?|height=".*?"\s?/gm, "");

  textPaddingLeft = (data.iconBg === data.color) ? 0 : svgMargin;
  ok.value = true;
};

const props = defineProps({
  type: String,
  desc: String,
  color: String,
  logo: String,
  text: String,
  textColor: String,
  icon: String,
  iconColor: String,
  iconBg: String,
});

let tag = {
  type: props.type,
  desc: props.desc,
  color: props.color,
  logo: props.logo,
  text: props.text,
  textColor: props.textColor,
  icon: props.icon,
  iconColor: props.iconColor,
  iconBg: props.iconBg,
};

let icon = ref("");
let ok = ref(false);
const svgMargin = "0.3rem";
const radius = "2px";
let textPaddingLeft: String | Number = "0.3rem";

switch (tag.type) {
  case "deno":
    tag.desc = tag.desc ?? "This plugin can be run in Deno";
    tag.color = tag.color ?? "#000000";
    tag.text = tag.text ?? "DENO";
    tag.textColor = tag.textColor ?? "#ffffff";
    tag.iconColor = tag.iconColor ?? "#ffffff";
    tag.iconBg = tag.iconBg ?? tag.color;
    loadIcon({ data: tag, defaultName: "deno", defaultType: "logo" });
    break;

  case "nodejs":
    tag.desc = tag.desc ?? "This plugin can be run in Node.js";
    tag.color = tag.color ?? "#689f63";
    tag.text = tag.text ?? "NODE.JS";
    tag.textColor = tag.textColor ?? "#ffffff";
    tag.iconColor = tag.iconColor ?? "#ffffff";
    tag.iconBg = tag.iconBg ?? tag.color;
    loadIcon({ data: tag, defaultName: "nodedotjs", defaultType: "logo" });
    break;

  case "official":
    tag.desc = tag.desc ?? "This plugin is published and maintained by grammY";
    tag.color = tag.color ?? "#009dca";
    tag.text = tag.text ?? "OFFICIAL";
    tag.textColor = tag.textColor ?? "#ffffff";
    tag.iconColor = tag.iconColor ?? "#ffffff";
    tag.iconBg = tag.iconBg ?? tag.color;
    loadIcon({ data: tag, defaultName: "patch-check-fill", defaultType: "icon" });
    break;

    case "thirdparty":
    tag.desc = tag.desc ?? "This plugin is maintained by the community";
    tag.color = tag.color ?? "#ffe005";
    tag.text = tag.text ?? "THIRD-PARTY";
    tag.textColor = tag.textColor ?? "#000000";
    tag.iconColor = tag.iconColor ?? "#000000";
    tag.iconBg = tag.iconBg ?? tag.color;
    loadIcon({ data: tag, defaultName: "people-fill", defaultType: "icon" });
    break;

    default:
    tag.color = tag.color ?? "#34404c";
    tag.text = tag.text ?? "TAG";
    tag.textColor = tag.textColor ?? "#ffffff";
    tag.iconColor = tag.iconColor ?? "#ffffff";
    tag.iconBg = tag.iconBg ?? tag.color;
    tag.desc = tag.desc ?? tag.text;
    loadIcon({ data: tag });
    break;
}
</script>

<template>
  <Transition appear name="tag">
    <div v-if="ok" class="tag">
      <div v-html="icon" class="icon" v-once></div>
      <span class="text" v-once>{{ tag.text }}</span>
      <span class="tooltip"></span>
    </div>
  </Transition>
</template>

<style scoped>
.tag .icon {
  background-color: v-bind("tag.iconBg");
}
.tag .icon :deep(svg) {
  width: 0.9rem;
  fill: v-bind("tag.iconColor");
  margin-right: v-bind("svgMargin");
}

.tag .text {
  color: v-bind("tag.textColor");
  background-color: v-bind("tag.color");
  padding-left: v-bind("textPaddingLeft");
}
</style>

<style>
.tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1rem;
}

.tag .icon {
  display: flex;
  align-items: center;
  align-self: stretch;
  padding: v-bind("svgMargin");
  padding-right: 0;
  border-radius: v-bind("radius") 0 0 v-bind("radius");
}

.tag .icon svg {
  display: flex;
  width: 0.9rem;
}

.tag .text {
  display: flex;
  align-items: center;
  align-self: stretch;
  padding-right: v-bind("svgMargin");
  border-radius: 0 v-bind("radius") v-bind("radius") 0;
  font-family: Verdana, Geneva, Tahoma,"DejaVu Sans", sans-serif;
}

/*
Make content inside tag unselectable.
The majority of users probably do not want the tag to be copied
along with the document content.
*/
.tag {
  user-select: none;
  cursor: default;
}

.tag-enter-active {
  transition: opacity 0.2s ease;
}

.tag-enter-from {
  opacity: 0;
}
</style>
