<script lang="ts">
  import { wrap } from "svelte-spa-router/wrap";
  import Router from "svelte-spa-router";
  import Dashboard from "./routes/Dashboard.svelte";
  import Home from "./routes/Home.svelte";
  import { currentTheme } from "./components/ThemeSwitcher.svelte";
  import ProverMarket from './routes/ProverMarket.svelte';

  const routes = {
    "/": Home,
    "/dashboard": Dashboard,
  };
  // const routes = {
  //   "/": wrap({
  //     component: Home,
  //     userData: {},
  //   }),
  //   "/dashboard": wrap({
  //     component: Dashboard,
  //     userData: {},
  //   }),
  // };

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
