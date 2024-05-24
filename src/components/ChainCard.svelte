<script lang="ts">
  export let title: string = null;
  export let body: string = null;
  export let subBody: string = null;
  export let icon: string = null;
</script>

<div class="card modal shadow-md">
  <h3 class="modal-title">{title}</h3>
  <div class="flex flex-col h-[125px]">
    <div
      class="flex content-between items-center h-[100px] justify-around flex-col"
    >
      <div class="w-[45px]">
        <img src={icon} alt="icon" />
      </div>

      <div class="bodyArea flex flex-col my-auto w-[90%]">{body}</div>
      <div class="modal-sub-body flex items-center justify-center">{subBody}</div>
    </div>
  </div>
</div>

<style>
  .modal {
    align-items: center;
    padding: 10px 20px;
    margin: 6px;
    border: 1px solid hsl(var(--twc-cardBackgroundColor));
    border-radius: 20px;
    background-color: hsl(var(--twc-cardBackgroundColor));
    aspect-ratio: 1/1;
    height: 170px;
  }

  .modal-title {
    margin-bottom: 10px;
    text-align: center;
    color: hsl(var(--twc-cardTitleColor));
    font-size: 18px;
    font-size: large;
    font-weight: 600;
  }

  .modal-sub-body {
    color: hsl(var(--twc-cardSubBodyColor));
    font-size: 15px;
  }

  .bodyArea {
    text-align: center;
    padding-top: 5px;
    color: hsl(var(--twc-textColor));
    font-weight: 400;
    font-size: 18px;
  }

  @media (max-width: 750px) {
    .modal {
      margin: 4px;
    }
  }
</style>
