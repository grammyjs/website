<script setup lang="ts">

const props = defineProps({
  mt: String,
  mb: String,
  pt: String,
  pb: String,
});

const customStyle = {
  marginTop: props.mt,
  marginBottom: props.mb,
  paddingTop: props.pt,
  paddingBottom: props.pb,
};
</script>

<template>
  <div class="tag-group" :style="customStyle" v-once>
    <slot />
  </div>
</template>

<style>
.tag-group {
  --tag-gap: 0.5rem;
}

.tag-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--tag-gap);
  margin-bottom: 0.5rem;
}

.tag-group:empty {
  display: none;
}

/* custom margin for h1 */
.theme-default-content h1 + div.tag-group {
  margin-top: 0;
  margin-bottom: 1rem;
}

/* Add additional margin due to line border at the bottom of h2 */
.theme-default-content h2 + div.tag-group {
  margin-top: 0.6rem;
}

/* custom margin for heading other than h1 and h2 */
.theme-default-content :is(h3, h4, h5, h6) + div.tag-group {
  margin-top: 0.7rem;
}

/* Add some gaps between TagGroups */
div.tag-group:not(:empty) + div.tag-group {
  margin-left: var(--tag-gap);
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
