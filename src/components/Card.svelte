<script lang="ts">
  import Progressbar from "./Progressbar.svelte";

  export let title: string = null;
  export let body: string = null;
  export let subBody: string = null;
  export let icon: string = null;
  export let loadingbar: boolean = null;
  export let progress: number = null;
</script>

<div class="modal shadow-md">
  <h3 class="modal-title font-bold text-lg">{title}</h3>
  <!-- <div class="modal-body">{body}</div>
  {#if subBody}
    <div class="modal-sub-body">{subBody}</div>
  {/if} -->

  <div class="parent">
    <div class="div1 mr-1">
      <!-- <div style="font-size:3rem;width:100%;text-align:center;">{icon}</div> -->
      <img src={icon} alt="icon" class="card-icon" />
    </div>
    <div class="div2">
      {body}
      {#if subBody}
        <div class="modal-sub-body">
          {subBody}
        </div>
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
</div>

<style>
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
</style>
