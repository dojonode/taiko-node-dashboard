<script lang="ts">
  import { link } from "svelte-spa-router";
  import GlyphBlank from "../assets/GlyphBlank.png";
  import TaikoHeart from "../assets/TaikoHeart.png";
  import MilestonesAsset from "../assets/Milestones.png";
</script>

<a
  href="/dashboard"
  use:link
  class="flex flex-col relative items-center pt-4 md:pt-4"
>
  <div class="text-center relative">
    <img src={GlyphBlank} class="taikoImg mx-auto h-64" alt="" />
  </div>
  <h1 class="font-bold text-3xl text-[#ffad12]">dojo node</h1>
  <div
    class="absolute text-sm font-semibold bottom-8 opacity-80 text-[#ffad12]"
  >
    click to enter
  </div>
</a>

<img src={MilestonesAsset} class="mt-8 hidden md:block" alt="" />
<div
  class="flex flex-col items-baseline space-y-8 md:space-y-0 md:flex-row md:justify-center md:space-x-16 mt-8 md:mt-0 w-[90%] m-auto text-[#a52519] font-medium"
>
  <div class="w-full md:w-1/3 p-4">
    <h2 class="md:hidden text-lg font-normal mb-10 text-center text-[#1c7f3f]">
      milestone <span class="block md:block font-bold">01</span>
    </h2>
    <ul>
      <li class="mb-5 milestone done">
        <span class="mr-2">🥋</span>
        Support testnet alpha-5
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>
        Look into development to support and switch between different nodes on different
        layers easily (L1/L2/L3)
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>

        Draft overview for Proposer/Prover rewards visually and functionally
        (charts/metrics)
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>
        Build online presence and branding.
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>

        Bug fixes for minor issues, fine tuning existing dashboard
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>

        Increase documentation. Providing useful information for operators
        around VPS access, networkwide access, docker vs systemwide stats
      </li>
    </ul>
  </div>

  <div class="w-full md:w-1/3 p-4">
    <h2 class="md:hidden text-lg font-normal mb-10 text-center text-[#1c7f3f]">
      milestone <span class="block md:block font-bold">02</span>
    </h2>
    <ul>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>

        Build a dedicated desktop app (for the dashboard only) and/or integrate
        into taiko’s GUI app
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>

        Implement overview of Proposer/Prover rewards (charts/metrics)
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>

        Deploy custom website with installation guides and visual
        instructions/tutorials.
      </li>
      <li class="mb-5 milestone done">
        <span class="mr-2">🥋</span>

        Implement and host a ‘preview’ of the dashboard where any taiko node
        runner can enter their IP address and see basic node stats such as
        syncing progress
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>

        Focus on research for new features to integrate based on latest taiko
        developments
      </li>
    </ul>
  </div>

  <div class="w-full md:w-1/3 p-4">
    <h2 class="md:hidden text-lg font-normal mb-10 text-center text-[#1c7f3f]">
      milestone <span class="block md:block font-bold">03</span>
    </h2>
    <ul>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>

        Build Discord (or operate one inside Taiko) for community support
        (node/dashboard runners), updates, bug fixes
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>

        Take on feature requests from the community and implement into latest
        version
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>
        Develop and implement alternative design formats
      </li>
      <li class="mb-5 milestone">
        <span class="mr-2">🥋</span>

        Create and distribute digital content around what nodes are, their
        importance in securing a blockchain, and why we want to enable everyday
        people to run one. Increase education with established branding
      </li>
    </ul>
  </div>
</div>

<div class="footer text-center">
  <p>
    made with <img
      class="w-3 inline align-baseline"
      src={TaikoHeart}
      alt="Taiko heart icon"
    /> by
  </p>
  <p>wolfez and helios</p>
  <div class="flex items-center justify-center mt-2">
    <a href="https://github.com/wolfderechter/taiko-node-dashboard">
      <span class="github-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="currentColor"
          class="bi bi-github"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.20-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.20-.82 2.20-.82.44 1.10.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.20 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </span>
    </a>
  </div>
</div>

<style>
  .footer {
    color: hsl(var(--twc-textColor));
    text-align: center;
    padding: 20px;
  }

  @font-face {
    font-family: "Menlo";
    src: url("../assets/Menlo-Regular.ttf") format("truetype");
  }

  .milestone {
    font-family: "Menlo", sans-serif;
  }

  .milestone.done {
    text-decoration: line-through;
  }
</style>
