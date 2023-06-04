<script lang="ts">
  import { wrap } from "svelte-spa-router/wrap";
  import Router from "svelte-spa-router";
  import Home from "./pages/home/Home.svelte";
  import { currentTheme } from "./components/ThemeSwitcher.svelte";

  const routes = {
    "/": wrap({
      component: Home,
      userData: {},
    }),
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

  main {
    font-family: "Jost", sans-serif;
    background-color: hsl(var(--twc-backgroundColor));
  }
  body {
    background-color: hsl(var(--twc-backgroundColor));
  }
</style>
