<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox class="app-button" class:selected on:click>
  <hbox class="icon">
    <slot name="icon" />
  </hbox>
  <hbox class="label">
    <slot name="label" />
  </hbox>
</vbox>

<script lang="ts">
  export let selected = false;
</script>

<style>
  .app-button {
    align-items: center;
    padding: 8px;
  }
  .app-button:hover {
    background-color: rgba(255, 255, 255, 25%);
  }
  .app-button.selected {
    background-color: rgba(255, 255, 255, 50%);
  }
  .label {
    margin-top: 4px;
    font-size: 10px;
    color: #999999;
  }
  .selected .label {
    color: black;
  }
</style>
