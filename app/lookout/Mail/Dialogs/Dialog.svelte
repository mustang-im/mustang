<dialog class="lo-dialog" bind:this={dialogEl}
  on:cancel|preventDefault={onCancel}
  aria-label={title}>
  <form class="dialog-box" method="dialog" style:width={width} on:submit|preventDefault={onSubmit}>
    <hbox class="title-bar">
      <span class="title">{title}</span>
      <hbox flex />
      <button type="button" class="close" on:click={onCancel} title={$t`Close`} aria-label={$t`Close`}>
        <CloseIcon size={16} />
      </button>
    </hbox>
    <vbox class="content">
      <slot />
    </vbox>
    <hbox class="buttons">
      <slot name="buttons-start" />
      <hbox flex />
      {#if okLabel}
        <button type="submit" class="dialog-button primary"
          disabled={!!okDisabled || isRunning}
          title={typeof okDisabled == "string" ? okDisabled : null}>
          {okLabel}
        </button>
      {/if}
      <button type="button" class="dialog-button" on:click={onCancel}>
        {cancelLabel ?? $t`Cancel`}
      </button>
    </hbox>
  </form>
</dialog>

<script lang="ts">
  import { showError } from "../../../frontend/Util/error";
  import CloseIcon from "lucide-svelte/icons/x";
  import { onMount, createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let title: string;
  export let okLabel: string = null;
  export let cancelLabel: string = null;
  export let okDisabled: boolean | string = false;
  export let width = "440px";
  export let onOK: () => Promise<void> | void = null;

  const dispatch = createEventDispatcher<{ close: void }>();
  let dialogEl: HTMLDialogElement;
  let isRunning = false;

  onMount(() => {
    dialogEl.showModal();
    let firstField = dialogEl.querySelector<HTMLElement>(".content :is(input:not([type=radio]):not([type=checkbox]), select, textarea)");
    firstField?.focus();
    if (firstField instanceof HTMLInputElement) {
      firstField.select();
    }
    return () => dialogEl?.close();
  });

  async function onSubmit() {
    if (okDisabled || isRunning) {
      return;
    }
    isRunning = true;
    try {
      await onOK?.();
      dispatch("close");
    } catch (ex) {
      showError(ex);
    } finally {
      isRunning = false;
    }
  }

  function onCancel() {
    dispatch("close");
  }
</script>

<style>
  .lo-dialog {
    padding: 0;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    box-shadow: var(--lo-shadow-popup);
    font-family: var(--lo-font);
    font-size: var(--lo-font-size);
  }
  .lo-dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.25);
  }
  .dialog-box {
    display: flex;
    flex-direction: column;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 64px);
    margin: 0;
  }
  .title-bar {
    align-items: center;
    padding: 12px 12px 4px 20px;
  }
  .title {
    font-size: 18px;
    font-weight: 600;
  }
  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg-secondary);
    cursor: pointer;
  }
  .close:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  .content {
    flex: 1 1 auto;
    min-height: 0;
    padding: 8px 20px 16px 20px;
    overflow: auto;
  }
  .content :global(input:not([type="radio"]):not([type="checkbox"])) {
    box-sizing: border-box;
  }
  .buttons {
    align-items: center;
    gap: 8px;
    padding: 12px 20px 20px 20px;
  }
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
  .dialog-button.primary {
    border-color: var(--lo-accent);
    background-color: var(--lo-accent);
    color: var(--lo-accent-fg);
  }
  .dialog-button.primary:hover:not(:disabled) {
    border-color: var(--lo-accent-hover);
    background-color: var(--lo-accent-hover);
  }
  .dialog-button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .buttons :global(.dialog-button) {
    font-size: 14px;
  }
</style>
