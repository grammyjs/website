<script setup lang="ts">
const props = defineProps({
  mt: String,
  mb: String,
  pt: String,
  pb: String,
});

let customStyle: AnyObject = {};

if (props.mt) {
  customStyle.marginTop = props.mt;
}
if (props.mb) {
  customStyle.marginBottom = props.mb;
}
if (props.pt) {
  customStyle.paddingTop = props.pt;
}
if (props.pb) {
  customStyle.paddingBottom = props.pb;
}
</script>

<template>
  <div class="tag-group" :style="customStyle" v-once>
    <slot />
  </div>
</template>

<style>
.tag-group {
  --mb-custom: 2rem;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-group:empty {
  display: none;
}

/* Make tag closer to heading */
.theme-default-content :is(h1, h3, h4, h5, h6) + div.tag-group {
  margin-top: 0;
  margin-bottom: var(--mb-custom);
}

/* Add additional margin due to line border at the bottom of h2 */
.theme-default-content h2 + div.tag-group {
  margin-top: 0.6rem;
  margin-bottom: var(--mb-custom);
}
</style>

<style>
/**
 * NavbarDropdown
 */

.navbar .tag-group {
  display: inline-flex;
  gap: 0.3rem;
  padding-left: 0.25rem;
  padding-right: 0.2rem;
}

.navbar .navbar-dropdown-title .tag-group {
  padding-right: 0;
  padding-left: 0.4rem;
}

.navbar h4 .tag-group {
  padding-left: 0.5rem;
}

.navbar .navbar-item > a .tag-group {
  padding-left: 0.15rem;
}

/**
 * For mobile
 */

.sidebar .navbar-items .navbar-item .tag-group {
  display: inline-flex;
  gap: 0.3rem;
  padding-left: 0.15rem;
  padding-right: 0.2rem;
}

.sidebar
  .navbar-items
  .navbar-item
  :is(.navbar-dropdown-title-mobile, .navbar-dropdown-subtitle)
  .tag-group {
  padding-left: 0.4rem;
}

.sidebar
  .navbar-items
  .navbar-item
  .navbar-dropdown-subitem-wrapper
  .navbar-dropdown-subitem
  .tag-group {
  padding-left: 0.15rem;
  padding-right: 0;
}
</style>
