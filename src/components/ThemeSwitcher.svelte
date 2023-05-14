<script lang="ts" context="module">
  import { onMount } from "svelte";
  import { Themes } from "../domain/enums";
  import { writable } from "svelte/store";

  // Create a svelte store with the default theme of original
  export const currentTheme = writable(Themes.Original);

  function changeTheme(newTheme) {
    currentTheme.set(newTheme);
  }
</script>

<div class="flex justify-between items-center font-bold">
  Theme:
  <div class="inline-flex">
    <button
      class:active={$currentTheme === Themes.Original}
      on:click={() => changeTheme(Themes.Original)}
      class="theme py-2 px-4 mx-1 rounded-l"
    >
      Original
    </button>
    <button
      class:active={$currentTheme === Themes.Light}
      on:click={() => changeTheme(Themes.Light)}
      class="theme py-2 px-4 mx-1 rounded-l"
    >
      Light
    </button>
    <button
      class:active={$currentTheme === Themes.Dark}
      on:click={() => changeTheme(Themes.Dark)}
      class="theme py-2 px-4 mx-1 rounded-r"
    >
      Dark
    </button>
    <button
      class:active={$currentTheme === Themes.Paper}
      on:click={() => changeTheme(Themes.Paper)}
      class="theme py-2 px-4 mx-1 rounded-r"
    >
      Paper
    </button>
  </div>
</div>

<style>
  .theme.active {
    background-color: rgb(255, 250, 207);
  }
</style>
