<script lang="ts">
  import { link } from "svelte-spa-router";
  import taikoLogoIcon from "../assets/taikoLogoIcon.png";
</script>

<div class="flex flex-col items-center pt-4 md:pt-10">
  <div class="text-center relative">
    <img src={taikoLogoIcon} class="taikoImg mx-auto" alt="" />
  </div>
  <a href="/dashboard" use:link>Go To Dashboard</a>
</div>
