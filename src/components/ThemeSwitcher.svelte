<script lang="ts" context="module">
  import CremeModeIcon from "../assets/icons/CremeMode.avif";
  import DarkModeIcon from "../assets/icons/DarkMode.avif";
  import { writable } from "svelte/store";
  import {
    setLocalStorageItem,
    getLocalStorageItem,
  } from "../utils/localstorage";
  import { Themes } from '../domain/enums';

  // Create a svelte store with the theme found in localstorage or the paper default theme
  let foundTheme = getLocalStorageItem("theme");
  export const currentTheme = writable(foundTheme ? foundTheme : Themes.Paper);

  /**
   * Change the theme and store in localstorage
   * @param {string} newTheme
   */
  function changeTheme(newTheme) {
    currentTheme.set(newTheme);
    setLocalStorageItem("theme", newTheme);
  }

  function switchTheme() {
    let newTheme =
      getLocalStorageItem("theme") === Themes.Paper
        ? Themes.Dark
        : Themes.Paper;
    currentTheme.set(newTheme);
    setLocalStorageItem("theme", newTheme);
  }
</script>

<div class="flex flex-col justify-between items-center">
  <div class="mt-2 inline-flex">
    <button
      class:active={$currentTheme === Themes.Paper}
      on:click={() => changeTheme(Themes.Paper)}
      class="theme"
    >
      <img src={CremeModeIcon} alt="creme/paper mode icon" />
    </button>
    <button
      class:active={$currentTheme === Themes.Dark}
      on:click={() => changeTheme(Themes.Dark)}
      class="theme"
    >
      <img src={DarkModeIcon} alt="dark mode icon" />
    </button>
  </div>

  <button on:click={switchTheme} class="pill-indicator">
    <div
      class="pill-fill"
      style={`left: ${$currentTheme === Themes.Paper ? "0%" : "50%"}`}
    />
  </button>
</div>

<style>
  .theme {
    width: 30px;
  }

  .pill-indicator {
    position: relative;
    width: 100%;
    height: 15px;
    background-color: hsl(var(--twc-progressBarBackgroundColor));
    border-radius: 10px;
    overflow: hidden;
    margin-top: 6px;
  }

  .pill-fill {
    position: absolute;
    top: 0;
    bottom: 0;
    background-color: hsl(var(--twc-themeSwitcherColor));
    transition: left 0.3s ease; /* Add a transition effect for smooth animation */
    width: 50%; /* Initial width, adjust as needed */
    border-radius: 10px;
  }
</style>
