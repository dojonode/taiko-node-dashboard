<script lang="ts">
  import Progressbar from "./Progressbar.svelte";
  import { MetricTypes } from "../domain/metrics";
  import ethIcon from "../assets/icons/Ethereum.png";
  import taikoIcon from "../assets/TaikoLogo.png";

  export let title: string = null;
  export let body: string = null;
  export let bodyMetricType = null;
  export let subBody: string = null;
  export let subBodyMetricType = null;
  export let icon: string = null;
  export let loadingbar: boolean = null;
  export let progress: number = null;

  // Used only by the wallet card
  export let L1Wallet: string = null;
  export let L2Wallet: string = null;
</script>

<!-- only populate the card once the body gets filled -->
<!-- ToDO: add else statement displaying something when error occured? -->
<!-- <div class="border-4 rounded-md m-3 w-[170px] h-[170px]">
  <h3 class="font-bold text-lg">{title}</h3>
  <div class="flex flex-col h-[125px]">
    <div class="parent flex flex-grow">
      <div class="div1 mr-1">
        <img src={icon} alt="icon" class="card-icon" />
      </div>
      <div class="flex flex-col">
        {#if body !== "undefined" && body !== undefined && body !== null && body !== "null" && body !== ""}
          {body}
          {#if bodyMetricType === MetricTypes.peers}
            <span class="modal-sub-body">{bodyMetricType}</span>
          {:else if bodyMetricType}
            {bodyMetricType}
          {/if}

          {#if subBody}
            <div class="modal-sub-body">
              {subBody}
            </div>
          {/if}
        {/if}
      </div>
    </div>
    <div class="">
      {#if loadingbar}
        <Progressbar
          {progress}
          showPercentage={false}
          widthPercentage={100}
          heightPixels={10}
        />
      {/if}
    </div>
  </div>
</div> -->

<!-- V2 -->
<div class="modal shadow-md">
  <h3 class="modal-title">{title}</h3>
  <div class="flex flex-col h-[125px]">
    <div
      class="flex content-between items-center h-[100px] justify-around flex-col"
    >
      <div class="cardIcon">
        <img src={icon} alt="icon" class="card-icon" />
      </div>

      <!-- ToDO: Clean up this mess -->
      <div class="div2 flex flex-col my-auto w-[80%]">
        {#if body !== "undefined" && body !== undefined && body !== null && body !== "null" && body !== ""}
          <!-- Wallet -->
          <div
            class="flex items-center {bodyMetricType === MetricTypes.ethereum &&
            subBodyMetricType === MetricTypes.ethereum
              ? 'justify-between'
              : 'flex-col'}"
          >
            <!-- Card is a wallet card -->
            {#if bodyMetricType === MetricTypes.ethereum && subBodyMetricType === MetricTypes.ethereum}
              <img src={ethIcon} class="w-[15px]" alt="ethereum icon" />
              <a
                href="https://sepolia.etherscan.io/address/{L1Wallet}"
                target="”_blank”"
              >
                {body}
                {bodyMetricType}
              </a>
              <!-- Card has only a percentage, so the percentage gets shown on the second row with brackets (cpu)-->
            {:else if bodyMetricType && subBody === null && bodyMetricType === MetricTypes.percentage}
              {body}
              <span class="modal-sub-body">[ {bodyMetricType} ]</span>
              <!-- Normal cards that require 1 row (proposed/proven and runtime )-->
            {:else if bodyMetricType && subBody === null}
              {body}
              <span class="modal-sub-body">{bodyMetricType}</span>
              <!-- Normal cards that require 2 rows (memory and storage)-->
            {:else}
              {body}
              {bodyMetricType}
            {/if}
          </div>

          {#if subBody}
            <div
              class="modal-sub-body flex items-center {bodyMetricType ===
                MetricTypes.ethereum &&
              subBodyMetricType === MetricTypes.ethereum
                ? 'justify-between'
                : 'justify-center'}"
            >
              {#if bodyMetricType === MetricTypes.ethereum && subBodyMetricType === MetricTypes.ethereum}
                <img src={taikoIcon} class="w-[15px]" alt="taiko icon" />
                <!-- ToDO: change to taiko explorer -->
                <a
                  href="https://sepolia.etherscan.io/address/{L2Wallet}"
                  target="”_blank”"
                >
                  {subBody}
                  {subBodyMetricType}
                </a>
              {:else}
                {body}
                {bodyMetricType}
              {/if}
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <div class="div3 text-center mt-auto mb-[12px]">
      {#if loadingbar}
        <Progressbar
          {progress}
          showPercentage={false}
          widthPercentage={100}
          heightPixels={10}
        />
      {/if}
    </div>
  </div>
</div>

<!-- V1 -->
<!-- <div class="modal shadow-md">
  <h3 class="modal-title font-bold text-lg">{title}</h3>
  <div class="parent">
    <div class="div1 mr-1">
      <img src={icon} alt="icon" class="card-icon" />
    </div>
    <div class="div2">

      {#if body !== "undefined" && body !== undefined && body !== null && body !== "null" && body !== ""}
        {body}
        {#if bodyMetricType === MetricTypes.peers}
          <span class="modal-sub-body">{bodyMetricType}</span>
        {:else if bodyMetricType}
          {bodyMetricType}
        {/if}

        {#if subBody}
          <div class="modal-sub-body">
            {subBody}
          </div>
        {/if}
      {/if}
    </div>
    <div class="div3 text-center">
      {#if loadingbar}
        <Progressbar
          {progress}
          showPercentage={false}
          widthPercentage={100}
          heightPixels={10}
        />
      {/if}
    </div>
  </div>
</div> -->

<!-- <style>
  .modal {
    align-items: center;
    padding: 10px 20px;
    margin: 7px;
    border: 1px solid #f5f5f5;
    border-radius: 20px;
    background-color: #f5f5f5;
    aspect-ratio: 1/1;
    width: 170px;
  }

  .modal-title {
    margin-bottom: 15px;
    text-align: center;
    color: #fc0fc0;
    font-size: 18px;
  }

  .modal-body {
    margin-bottom: 25px;
    text-align: center;
    font-size: 15px;
  }

  .modal-sub-body {
    color: #b3b3b3;
    font-size: 14px;
  }

  .parent {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }

  .div1 {
    grid-area: 1 / 1 / 3 / 2;
  }
  .div2 {
    grid-area: 1 / 2 / 3 / 3;
    text-align: center;
    padding-top: 5px;
  }
  .div3 {
    grid-area: 3 / 1 / 4 / 3;
  }
</style> -->

<style>
  .modal {
    align-items: center;
    padding: 10px 20px;
    margin: 7px;
    border: 1px solid #f5f5f5;
    border-radius: 20px;
    background-color: #f5f5f5;
    aspect-ratio: 1/1;
    height: 170px;
  }

  .modal-title {
    margin-bottom: 10px;
    text-align: center;
    color: #fc0fc0;
    font-size: 18px;
    font-size: large;
    font-weight: 500;
  }

  /* .modal-body {
    margin-bottom: 25px;
    text-align: center;
    font-size: 15px;
  } */

  .modal-sub-body {
    color: #b3b3b3;
    font-size: 14px;
  }

  .cardIcon {
    width: 45px;
  }
  /* .div1 {
    width: 40px;
  } */
  .div2 {
    text-align: center;
    padding-top: 5px;
  }
  .div3 {
    width: 100%;
  }
</style>
