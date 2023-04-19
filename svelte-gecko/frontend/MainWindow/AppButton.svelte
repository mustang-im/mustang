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
    background-color: rgba(0, 0, 0, 20%);
  }
  .label {
    margin-top: 4px;
    opacity: 70%;
  }
</style>
