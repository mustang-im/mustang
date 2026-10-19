<button class="response-button {classes}" class:pressed class:running aria-pressed={pressed}
  disabled={!!disabled || running} title={typeof disabled == "string" ? disabled : label}
  on:click={onClicked}>
  <svelte:component this={icon} size={16} />
  <span>{label}</span>
</button>

<script lang="ts">
  import { showError } from "../../../frontend/Util/error";

  export let label: string;
  export let icon: ConstructorOfATypedSvelteComponent;
  export let onClick: () => Promise<void> | void;
  export let pressed = false;
  export let disabled: boolean | string = false;
  export let classes = "";

  let running = false;
  async function onClicked() {
    if (running) {
      return;
    }
    running = true;
    try {
      await onClick();
    } catch (ex) {
      showError(ex);
    } finally {
      running = false;
    }
  }
</script>

<style>
  .response-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 112px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font: inherit;
    cursor: pointer;
  }
  .response-button:hover:not(:disabled) {
    background-color: var(--lo-hover-bg);
    border-color: var(--lo-border-strong);
  }
  .response-button:active:not(:disabled) {
    background-color: var(--lo-pressed-bg);
  }
  .response-button.pressed {
    background-color: var(--lo-selected-bg);
    border-color: var(--lo-accent);
    font-weight: 600;
  }
  .response-button:disabled {
    color: var(--lo-fg-disabled);
    cursor: default;
  }
  .response-button.running {
    cursor: progress;
  }
  .response-button :global(svg) {
    flex-shrink: 0;
    color: var(--lo-accent-text);
  }
  .response-button.accept :global(svg) {
    color: var(--lo-success);
  }
  .response-button.decline :global(svg) {
    color: var(--lo-danger);
  }
</style>
