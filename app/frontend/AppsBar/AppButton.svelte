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
  .label :global(.label){
    color: white;
  }
  .icon :global(.cls-1) {
    stroke: white;
    /** AppButton overrides this for .selected */
  }
  .app-button:hover {
    background-color: rgba(255, 255, 255, 25%);
  }
  .app-button:hover .label {
    color: black;
  }
  .app-button.selected {
    background-color: rgba(255, 255, 255, 95%);
  }
  .app-button.selected .label :global(> .label) {
    color: black;
  }
  .app-button.selected .icon :global(.cls-1) {
    stroke: #494558;
  }
  .app-button.selected .icon :global(.date-calendar-icon) {
    fill: #494558;
  }
  .icon {
    color: transparent;
  }
  .label {
    margin-top: 4px;
    font-size: 11px;
    color: #999999;
  }
  .selected .label {
    color: black;
  }
</style>
