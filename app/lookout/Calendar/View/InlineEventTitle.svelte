{#if $inlineTitle != null && $selectedSlots}
  <input class="inline-title" type="text"
    bind:value={$inlineTitle}
    bind:this={inputEl}
    aria-label={$t`Title of the new appointment`}
    on:keydown|stopPropagation={onKeyDown}
    on:pointerdown|stopPropagation
    on:click|stopPropagation
    on:dblclick|stopPropagation
    on:blur={onSave} />
{/if}

<script lang="ts">
  import { CalendarActions } from "../CalendarActions";
  import { inlineTitle, selectedSlots } from "../Selected";
  import { tick } from "svelte";
  import { t } from "../../../l10n/l10n";

  let inputEl: HTMLInputElement;

  $: if (inputEl) {
    focusAtEnd();
  }
  async function focusAtEnd() {
    await tick();
    inputEl?.focus();
    inputEl?.setSelectionRange(inputEl.value.length, inputEl.value.length);
  }

  function onKeyDown(keyEvent: KeyboardEvent) {
    if (keyEvent.key == "Enter") {
      keyEvent.preventDefault();
      onSave();
    } else if (keyEvent.key == "Escape") {
      keyEvent.preventDefault();
      $inlineTitle = null;
    }
  }

  function onSave() {
    CalendarActions.commitInlineTitle();
  }
</script>

<style>
  .inline-title {
    position: absolute;
    inset-inline: 2px;
    top: 2px;
    box-sizing: border-box;
    height: 20px;
    padding: 0 4px;
    border: 1px solid var(--lo-accent);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font: inherit;
    font-size: var(--lo-font-size-small);
    font-weight: 600;
    pointer-events: auto;
    outline: none;
    z-index: 6;
  }
</style>
