<vbox class="dialog-area" class:modal
  on:keydown={onKeyDown}
  on:mousedown|self={onBackdropClick}>
  <vbox class="dialog" role="dialog" aria-modal={modal} aria-label={title}
    style:width style:height
    tabindex="-1"
    bind:this={dialogEl}>
    <hbox class="title-bar">
      <hbox flex class="title">{title}</hbox>
      <slot name="title-buttons" />
      {#if onClose}
        <button class="close" title={$t`Close`} aria-label={$t`Close`} on:click={onClose}>
          <CloseIcon size={16} />
        </button>
      {/if}
    </hbox>
    <vbox flex class="body">
      <slot />
    </vbox>
    {#if $$slots.footer}
      <hbox class="footer">
        <slot name="footer" />
      </hbox>
    {/if}
  </vbox>
</vbox>

<script lang="ts">
  import CloseIcon from "lucide-svelte/icons/x";
  import { t } from "../../../l10n/l10n";
  import { onMount } from "svelte";

  export let title: string;
  export let onClose: () => void = null;
  export let modal = true;
  export let width: string = null;
  export let height: string = null;

  let dialogEl: HTMLElement;

  onMount(() => {
    if (!dialogEl.contains(document.activeElement)) {
      let autofocus = dialogEl.querySelector<HTMLElement>("[autofocus]");
      (autofocus ?? dialogEl).focus();
    }
  });

  function onKeyDown(event: KeyboardEvent) {
    if (event.key != "Escape" || !onClose) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    onClose();
  }

  function onBackdropClick() {
    if (modal) {
      dialogEl.focus();
    }
  }
</script>

<style>
  .dialog-area {
    flex: 1 1 0;
    min-height: 0;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .dialog-area.modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.28);
  }
  .dialog {
    max-width: 100%;
    max-height: 100%;
    min-height: 0;
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius);
    box-shadow: var(--lo-shadow-popup);
    outline: none;
  }
  .title-bar {
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
    padding: 10px 10px 6px 20px;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg-secondary);
  }
  .close:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  .body {
    flex: 1 1 auto;
    min-height: 0;
    padding: 8px 20px 12px 20px;
  }
  .footer {
    flex-shrink: 0;
    justify-content: end;
    align-items: center;
    gap: 8px;
    padding: 12px 20px 16px 20px;
  }
</style>
