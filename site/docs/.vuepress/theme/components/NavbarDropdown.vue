<!-- 
  This file is copied from @theme/NavbarDropdown.vue. 
  Some changes were made to this script.
-->
<script setup lang="ts">
import DropdownTransition from '@theme/DropdownTransition.vue'
import { computed, ref, toRefs, watch } from 'vue'
import type { PropType } from 'vue'
import { useRoute } from 'vue-router'

// Start inject
import AutoLink from "./AutoLink.vue";
import type { NavbarItem, ResolvedNavbarItem } from "../../types/shared";
// End of inject

const props = defineProps({
  item: {
    type: Object as PropType<Exclude<ResolvedNavbarItem, NavbarItem>>,
    required: true,
  },
  menuIndex: Array<number>
});

const { item } = toRefs(props)

const dropdownAriaLabel = computed(
  () => item.value.ariaLabel || item.value.text
)

const open = ref(false)
const route = useRoute()
watch(
  () => route.path,
  () => {
    open.value = false
  }
)

/**
 * Open the dropdown when user tab and click from keyboard.
 *
 * Use event.detail to detect tab and click from keyboard.
 * The Tab + Click is UIEvent > KeyboardEvent, so the detail is 0.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail
 */
const handleDropdown = (e): void => {
  const isTriggerByTab = e.detail === 0
  if (isTriggerByTab) {
    open.value = !open.value
  } else {
    open.value = false
  }
}

const isLastItemOfArray = (item: unknown, arr: unknown[]): boolean =>
  arr[arr.length - 1] === item
</script>

<!-- We injected `AutotagMenu, `TagGroup`, and `Tag` component to this template. -->
<template>
  <div class="navbar-dropdown-wrapper" :class="{ open }">
    <button
      class="navbar-dropdown-title"
      type="button"
      :aria-label="dropdownAriaLabel"
      @click="handleDropdown"
    >
    <span class="title">{{ item.text }}</span>
      <!-- Sstart inject-->
      <AutotagMenu v-if="item.text" :menuIndex="menuIndex" :currentMenu="[item.text]"/>
      <TagGroup v-if="item.tag">
        <Tag v-for="value in item.tag" :nav="value" />
      </TagGroup>
      <!-- End of inject -->
      <span class="arrow down" />
    </button>

    <button
      class="navbar-dropdown-title-mobile"
      type="button"
      :aria-label="dropdownAriaLabel"
      @click="open = !open"
    >
    <span class="title">{{ item.text }}</span>
      <!-- Start inject -->
      <TagGroup v-if="item.tag">
        <Tag v-for="value in item.tag" :nav="value" />
      </TagGroup>
      <!-- End of Inject -->
      <span class="arrow" :class="open ? 'down' : 'right'" />
    </button>

    <DropdownTransition>
      <ul v-show="open" class="navbar-dropdown">
        <!-- Start inject -->
        <li v-for="(child, index) in item.children" :key="child.text" class="navbar-dropdown-item">
          <template v-if="child.children">
            <h4 class="navbar-dropdown-subtitle">
              <AutoLink
                v-if="child.link"
                :item="child"
                :menuIndex="[...menuIndex, index]"
                :currentMenu="[item.text, child.text]"
                @focusout="
                  isLastItemOfArray(child, item.children) &&
                    child.children.length === 0 &&
                    (open = false)
                "
              />
              <span v-else>
                {{ child.text }}
                <AutotagMenu v-if="item.text" :menuIndex="[...menuIndex, index]" :currentMenu="[item.text, child.text]"/>
                <TagGroup v-if="child.tag">
                  <Tag v-for="value in child.tag" :nav="value" />
                </TagGroup>
              </span>
            </h4>

            <ul class="navbar-dropdown-subitem-wrapper">
              <li
                v-for="(grandchild, index2) in child.children"
                :key="grandchild.link"
                class="navbar-dropdown-subitem"
              >
                <AutoLink
                  :item="grandchild"
                  :menuIndex="[...menuIndex, index, index2]"
                  :currentMenu="[item.text, child.text, grandchild.text]"
                  @focusout="
                    isLastItemOfArray(grandchild, child.children) &&
                      isLastItemOfArray(child, item.children) &&
                      (open = false)
                  "
                />
              </li>
            </ul>
          </template>

          <template v-else>
            <AutoLink
              :item="child"
              :menuIndex="[...menuIndex, index]"
              :currentMenu="[item.text, child.text]"
              @focusout="isLastItemOfArray(child, item.children) && (open = false)"
            />
          </template>
        </li>
        <!-- End of inject -->
      </ul>
    </DropdownTransition>
  </div>
</template>
