<script setup lang="ts">
const props = defineProps({
  mt: String,
  mb: String,
});
const addClass = (props.mt || props.mb) ? "custom" : "" ;
const mtCustom = props.mt ?? "1rem";
const mbCustom = props.mb ?? "1rem";
</script>

<template>
  <div class="tagGroup" :class="addClass" v-once>
    <slot></slot>
  </div>
</template>

<style scoped>
.tagGroup.custom {
  margin-top: v-bind("mtCustom");
  margin-bottom: v-bind("mbCustom");
}
</style>

<style>
.tagGroup {
  margin-top: v-bind(mtCustom);
  margin-bottom: v-bind(mbCustom);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Make tag closer to heading */
.theme-default-content :is(h1, h3, h4, h5, h6) + div.tagGroup{
  margin-top: 0;
  margin-bottom: 2rem;
}

/* Add additional margin due to line border at the bottom of h2 */
.theme-default-content h2 + div.tagGroup{
  margin-top: 0.6rem;
  margin-bottom: 2rem;
}
</style>