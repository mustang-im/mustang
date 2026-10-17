<hbox class="lo-datefield {classes}" class:disabled={!!disabled} class:invalid style:width
  title={typeof disabled == "string" ? disabled : tooltip ?? label}
  bind:this={fieldEl}>
  <input type="text" bind:value={text}
    aria-label={label}
    placeholder={placeholder ?? ""}
    disabled={!!disabled}
    bind:this={inputEl}
    on:change={onTextChanged}
    on:keydown={onKeyDown}
    on:focus={() => invalid = false} />
  <button type="button" class="open" tabindex="-1" disabled={!!disabled}
    title={$t`Choose a date`}
    aria-label={$t`Choose a date`}
    aria-expanded={isOpen}
    on:click|stopPropagation={() => isOpen = !isOpen}>
    <CalendarIcon size={16} />
  </button>
</hbox>
<Popup bind:popupOpen={isOpen} popupAnchor={fieldEl} placement="bottom-start" boundaryElSel="body">
  {#if isOpen}
    <DatePicker date={value} {min} label={label ?? placeholder} onPick={onPick} />
  {/if}
</Popup>

<script lang="ts">
  import { DateText } from "../../Calendar/EditEvent/DateText";
  import DatePicker from "./DatePicker.svelte";
  import Popup from "../../../frontend/Shared/Popup.svelte";
  import { showError } from "../../../frontend/Util/error";
  import CalendarIcon from "lucide-svelte/icons/calendar-days";
  import { t } from "../../../l10n/l10n";

  export let value: Date = null;
  export let min: Date = null;
  export let label: string = null;
  export let placeholder: string = null;
  export let disabled: boolean | string = false;
  export let tooltip: string = null;
  export let width = "156px";
  export let required = false;
  export let onChange: (value: Date) => void | Promise<void> = null;
  export let classes = "";
  export let inputEl: HTMLInputElement = null;

  let text = "";
  let isOpen = false;
  let invalid = false;
  let fieldEl: HTMLElement;

  $: text = DateText.format(value);

  async function setValue(date: Date | null) {
    if (date?.getTime() == value?.getTime()) {
      return;
    }
    let previous = value;
    value = date;
    try {
      await onChange?.(value);
    } catch (ex) {
      value = previous;
      showError(ex);
    }
  }

  function onTextChanged(): boolean {
    if (!text.trim() && !required) {
      void setValue(null);
      return true;
    }
    if (!text.trim()) {
      text = DateText.format(value);
      return true;
    }
    try {
      let reference = value ? new Date(value) : new Date(new Date().setHours(0, 0, 0, 0));
      let date = DateText.parse(text, reference);
      text = DateText.format(value);
      void setValue(date);
      return true;
    } catch (ex) {
      invalid = true;
      text = DateText.format(value);
      showError(ex);
      return false;
    }
  }

  function onPick(day: Date) {
    isOpen = false;
    let date = value ? new Date(value) : new Date(new Date(day).setHours(0, 0, 0, 0));
    date.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    void setValue(date);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.altKey && event.key == "ArrowDown") {
      event.preventDefault();
      isOpen = !isOpen;
    } else if (event.key == "Enter") {
      // A dialog submits on Enter, and that cancels the native change event
      if (!onTextChanged()) {
        event.preventDefault();
      }
    } else if (event.key == "Escape" && isOpen) {
      event.stopPropagation();
      isOpen = false;
    }
  }
</script>

<style>
  .lo-datefield {
    box-sizing: border-box;
    align-items: center;
    min-width: 0;
    height: 32px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
  }
  .lo-datefield:hover:not(.disabled) {
    border-color: var(--lo-border-strong);
  }
  .lo-datefield:focus-within {
    border-color: var(--lo-accent);
    box-shadow: inset 0 -1px 0 0 var(--lo-accent);
  }
  .lo-datefield.invalid {
    border-color: var(--lo-danger);
  }
  .lo-datefield.disabled {
    opacity: 0.5;
  }
  input {
    flex: 1 1 0;
    min-width: 0;
    height: 100%;
    padding: 0 0 0 8px;
    border: none !important;
    background: none;
    color: var(--lo-fg);
    font: inherit;
    box-shadow: none !important;
    outline: none;
  }
  .open {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 100%;
    padding: 0;
    border: none;
    background: none;
    color: var(--lo-fg-secondary);
    cursor: pointer;
  }
  .open:hover:not(:disabled) {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  input::placeholder {
    color: var(--lo-fg-secondary);
  }
</style>
