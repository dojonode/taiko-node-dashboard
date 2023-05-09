<script lang="ts">
  import { wrap } from "svelte-spa-router/wrap";
  import Router from "svelte-spa-router";
  import Home from "./pages/home/Home.svelte";
  import { setupI18n } from "./i18n";
  setupI18n({ withLocale: "en" });

  // const l1Provider = new ethers.providers.JsonRpcProvider(
  //   import.meta.env.VITE_L1_RPC_URL
  // );
  // const l2Provider = new ethers.providers.JsonRpcProvider(
  //   import.meta.env.VITE_L2_RPC_URL
  // );

  const routes = {
    "/": wrap({
      component: Home,
      userData: {},
    }),
  };
</script>

<main class="px-6">
  <Router {routes} />
</main>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  main {
    font-family: "Inter", sans-serif;
  }

  .green {
    color: #7cfc00;
  }

  .red {
    color: #ff9494;
  }

  .yellow {
    color: #eed202;
  }
</style>
