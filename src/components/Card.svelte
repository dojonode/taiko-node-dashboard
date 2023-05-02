<script lang="ts">
  export let title: string = null;
</script>

<div class="modal">
  <h3 class="modal-title font-bold text-lg">{title}</h3>
  <div class="modal-body">here comes the body</div>
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
    text-align: left;
  }

  .modal-body {
  }
</style>
