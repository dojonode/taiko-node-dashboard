<script lang="ts">
  import { onMount, tick } from "svelte";
  export let progress: number = null;
  export let showPercentage: boolean = null;
  export let finishedMessage: string = null;
  export let widthPercentage: number = null;
  export let heightPixels: number = null;
</script>

<div
  class="progress-bar"
  style="width:{widthPercentage}%; height:{heightPixels}px;"
>
  <div class="progress-bar__background">
    {#if showPercentage}
      <div class="progress-bar__text">
        <!-- If there is a finishedMessage we show the progress percentage untill we it's finished, then we show the finishedMessage -->
        {#if finishedMessage}
          {progress < 100 ? progress + "%" : finishedMessage}
        {:else}
          <!-- If there is no finishedMessage we only display the progress percentage -->
          {progress + "%"}
        {/if}
      </div>
    {/if}
  </div>
  <div class="progress-bar__fill" style={`width: ${progress}%`} />
</div>

<style>
  .progress-bar {
    width: 170px;
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    margin: 1rem 0;
  }

  .progress-bar__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #e0e0e0;
    border-radius: 10px;
  }

  .progress-bar__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #ff9fe9;
    border-radius: 10px;
    transition: width 0.4s ease-in-out;
    width: 0%;
    z-index: 1;
  }

  .progress-bar__text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    color: white;
    z-index: 2;
  }
</style>
