<hbox class="date-field" class:disabled class:invalid style:width bind:this={fieldEl}>
  <input type="text" bind:value={text}
    aria-label={label}
    title={label}
    {disabled}
    on:change={onTextChanged}
    on:keydown={onKeyDown}
    on:focus={() => invalid = false}
    />
  <button class="open" tabindex="-1" {disabled}
    title={$t`Choose a date`}
    aria-label={$t`Choose a date`}
    aria-expanded={isOpen}
    on:click|stopPropagation={() => isOpen = !isOpen}>
    <CalendarIcon size={16} />
  </button>
</hbox>
<Popup bind:popupOpen={isOpen} popupAnchor={fieldEl} placement="bottom-start" boundaryElSel="body">
  {#if isOpen}
    <DatePicker {date} {min} {label} onPick={onPick} />
  {/if}
</Popup>

<script lang="ts">
  import { DateText } from "./DateText";
  import DatePicker from "./DatePicker.svelte";
  import Popup from "../../../frontend/Shared/Popup.svelte";
  import { showError } from "../../../frontend/Util/error";
  import CalendarIcon from "lucide-svelte/icons/calendar-days";
  import { t } from "../../../l10n/l10n";

  export let date: Date;
  export let label: string;
  export let min: Date = null;
  export let disabled = false;
  export let width = "156px";
  export let onChange: (date: Date) => void;

  let text = "";
  let isOpen = false;
  let invalid = false;
  let fieldEl: HTMLElement;

  $: text = DateText.format(date);

  function onTextChanged(): boolean {
    try {
      let newDate = DateText.parse(text, date ?? new Date());
      text = DateText.format(date);
      if (newDate.getTime() != date?.getTime()) {
        onChange(newDate);
      }
      return true;
    } catch (ex) {
      invalid = true;
      text = DateText.format(date);
      showError(ex);
      return false;
    }
  }

  function onPick(day: Date) {
    isOpen = false;
    let newDate = new Date(date ?? day);
    newDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(newDate);
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
  .date-field {
    box-sizing: border-box;
    align-items: center;
    height: 32px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
  }
  .date-field:hover:not(.disabled) {
    border-color: var(--lo-border-strong);
  }
  .date-field:focus-within {
    border-color: var(--lo-accent);
    box-shadow: inset 0 -1px 0 0 var(--lo-accent);
  }
  .date-field.invalid {
    border-color: var(--lo-danger);
  }
  .date-field.disabled {
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
</style>
