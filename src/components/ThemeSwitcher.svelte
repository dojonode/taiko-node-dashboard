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

<div class="flex justify-between items-center font-bold">
  Theme:
  <div class="inline-flex text-black">
    <button
      class:active={$currentTheme === Themes.Original}
      on:click={() => changeTheme(Themes.Original)}
      class="theme bg-zinc-50 hover:bg-zinc-100 py-2 px-4 mx-1 rounded-l"
    >
      light
    </button>
    <!-- <button
      class:active={$currentTheme === Themes.Light}
      on:click={() => changeTheme(Themes.Light)}
      class="theme py-2 px-4 mx-1 rounded-l"
    >
      light
    </button> -->
    <button
      class:active={$currentTheme === Themes.Paper}
      on:click={() => changeTheme(Themes.Paper)}
      class="theme bg-zinc-50 hover:bg-zinc-100 py-2 px-4 mx-1 rounded-r"
    >
      paper
    </button>
    <button
      class:active={$currentTheme === Themes.Dark}
      on:click={() => changeTheme(Themes.Dark)}
      class="theme bg-zinc-50 hover:bg-zinc-100 py-2 px-4 mx-1 rounded-r"
    >
      dark
    </button>
  </div>
</div>

<style>
  .theme.active {
    background-color: hsl(var(--twc-primaryColor));
    color: white;
  }
</style>
