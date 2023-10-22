<script lang="ts">
  import Router from "svelte-spa-router";
  import Dashboard from "./routes/Dashboard.svelte";
  import { currentTheme } from "./components/ThemeSwitcher.svelte";

  const routes = {
    "/": Dashboard,
  };

  // Change the document body data-theme value on theme changes
  const body = document.body;
  currentTheme.subscribe((value) => {
    body.setAttribute("data-theme", value);
  });
</script>

<main class="px-2 md:px-6">
  <Router {routes} />
</main>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  body {
    font-family: "Jost", sans-serif;
    background-color: hsl(var(--twc-backgroundColor));
  }
</style>
