<script lang="ts" context="module">
  import { onMount } from "svelte";
  import { Themes } from "../domain/enums";
  import { writable } from "svelte/store";
  import {
    setLocalStorageItem,
    getLocalStorageItem,
  } from "../utils/localstorage";

  // Create a svelte store with the theme found in localstorage or the paper default theme
  let foundTheme = getLocalStorageItem("theme");
  export const currentTheme = writable(foundTheme ? foundTheme : Themes.Paper);

  // Changing the theme stores the value in localstorage
  function changeTheme(newTheme) {
    currentTheme.set(newTheme);
    setLocalStorageItem("theme", newTheme);
  }
</script>

<div class="settings flex flex-col justify-between items-center font-bold">
  theme
  <div class="mt-2 inline-flex text-black">
    <button
      class:active={$currentTheme === Themes.Light}
      on:click={() => changeTheme(Themes.Light)}
      class="theme bg-[#FFFFFD] mx-1 rounded-full"
    >
      light
    </button>
    <button
      class:active={$currentTheme === Themes.Paper}
      on:click={() => changeTheme(Themes.Paper)}
      class="theme bg-[#FFF9EB] py-[2px] mx-1 rounded-full"
    >
      paper
    </button>
    <button
      class:active={$currentTheme === Themes.Dark}
      on:click={() => changeTheme(Themes.Dark)}
      class="theme bg-[#1a1b1b] text-[#F4F4F4] py-[2px] mx-1 rounded-full"
    >
      dark
    </button>
  </div>
</div>

<style>
  .theme.active {
    border: 2.1px solid hsl(var(--twc-primaryColor));
  }
  .theme {
    border: 2.1px solid hsl(var(--twc-cardBackgroundColor));
    width: 75px;
    font-weight: 400;
    line-height: 1;
  }
</style>
