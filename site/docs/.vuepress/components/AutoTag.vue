<script setup lang="ts">
import TagGroup from "./TagGroup.vue";
import Tag from "./Tag.vue";
import type { AutotagOptions, Props } from "../types";

const props = defineProps({ config: String });
let showTag = false;
let tagProps: Props[] = []; // Collection of tags to be shown

if (props.config) {
  // Get current URL page then replace trailing "/"
  // at the end of url ("/plugins/" => "/plugins")
  const currentUrl = window.location.pathname.replace(/\/$/, "");
  const autotag: AutotagOptions = JSON.parse(props.config);

  for (const item of autotag) {
    const urls = item.url;
    const locale = item.tag[0].locale;

    // Inject locale url
    item.url.forEach((url) => {
      for (const lang in locale) {
        const localeUrl = `/${lang}` + url; // ex: "/plugins" => "/id/plugins"
        urls.push(localeUrl);
      }
    });

    for (let url of urls) {
      // Reset the variables
      let include = true;
      let exclude = true;

      const _include = item.include ?? [""]; // [""] will always evaluate to true on searchUrl function
      const _exclude = item.exclude ?? []; // [] will always evaluate to false on searchUrl function

      // Check if the current url page is matched with the user options.
      include = matchUrl(_include, url, currentUrl);
      exclude = !matchUrl(_exclude, url, currentUrl);

      if (include && exclude) {
        item.tag.forEach((tag) => {
          // Check if locale property exist
          for (const lang in tag.locale) {
            // Check if current page is a locale page
            const isLocalePage = currentUrl.startsWith(`/${lang}/`);
            if (isLocalePage) {
              tag.text = tag.locale[lang]; // Replace tag text with the locale one
              break;
            }
          }
          tagProps.push(tag); // Add tag to the list
        });
        showTag = true;
        break;
      }
    }
  }
}

function matchUrl(items: string[], url: string, currentUrl: string): boolean {
  let result = false;

  for (const item of items) {
    // Match user url with current url page
    if (item === "/") {
      // "/" is special syntax for index
      const pageUrl = window.location.pathname; // Use the original URL path.
      result = new RegExp(`^${url}${item}$`).test(pageUrl); // https://grammy.dev/url/
    } else {
      result = item.startsWith("/")
        ? new RegExp(`^${url}${item}`).test(currentUrl) // https://grammy.dev/url/item ...
        : new RegExp(`^${url}.*${item}`).test(currentUrl); // https://grammy.dev/url ... item ...
    }

    if (result) break;
  }
  return result;
}
</script>

<template>
  <TagGroup v-if="showTag">
    <Tag v-for="item in tagProps" :autotag="item" />
  </TagGroup>
</template>
