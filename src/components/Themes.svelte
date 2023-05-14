<script>
  import { createThemer } from "svelte-themer";

  const themes = {
    original: {},
    light: {
      primaryColor: "#fc0fc0", //taiko pink
      secondaryColor: "#ff9fe9", //taiko soft pink
      backgroundColor: "#f5f5f5", //main background
      cardBackgroundColor: "#f5f5f5", //card background
      bodyColor: "#420d4794",
      subBodyColor: "#b3b3b3",
      settingsBtnColor: "#9baab2",
      settingsBackgroundColor: "#f4cfff",
      settingsButtonColorActive: "#fffacf",
    },
    paper: {
      primaryColor: "#f44336",
      secondaryColor: "#607d8b",
      backgroundColor: "#eeeeee",
    },
    dark: {
      primaryColor: "#90caf9",
      secondaryColor: "#bdbdbd",
      backgroundColor: "#212121",
    },
  };

  export const { theme, setTheme } = createThemer(themes, "light");
</script>

<button on:click={() => setTheme("dark")}> Switch to dark theme </button>

<div class="flex justify-between items-center font-bold">
  Theme:
  <div class="inline-flex">
    <button
      class:active={theme === "light"}
      on:click={() => setTheme("light")}
      class="theme py-2 px-4 mx-1 rounded-l"
    >
      Light
    </button>
    <button
      class:active={theme === "dark"}
      on:click={() => setTheme("dark")}
      class="theme py-2 px-4 mx-1 rounded-r"
    >
      Dark
    </button>
    <button
      class:active={theme === "paper"}
      on:click={() => setTheme("paper")}
      class="theme py-2 px-4 mx-1 rounded-r"
    >
      Paper
    </button>
  </div>
</div>

<style>
  /* Use the theme variables in your styles */
  /* button {
      background-color: {theme.primaryColor};
      color: {theme.backgroundColor};
    } */
</style>
