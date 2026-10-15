<button type="button" class="dialog-button" {disabled} on:click={onClick}>{label}</button>

<script lang="ts">
  export let label: string;
  export let disabled = false;
  export let onClick: () => void;
</script>

<style>
  /* <copied from="../../Mail/Dialogs/Dialog.svelte"> */
  .dialog-button {
    min-width: 96px;
    height: 32px;
    padding: 0 16px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
  .dialog-button:hover:not(:disabled) {
    background-color: var(--lo-hover-bg);
  }
  .dialog-button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  /* </copied> */
</style>
