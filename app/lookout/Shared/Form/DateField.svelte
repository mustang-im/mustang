<input type="date" class="lo-datefield {classes}"
  value={dateString}
  min={toDateString(min)}
  max={toDateString(max)}
  disabled={!!disabled}
  aria-label={label}
  title={typeof disabled == "string" ? disabled : tooltip}
  style:width
  bind:this={inputEl}
  on:change={onChanged} />

<script lang="ts">
  import { showError } from "../../../frontend/Util/error";

  export let value: Date = null;
  export let min: Date = null;
  export let max: Date = null;
  export let label: string = null;
  export let disabled: boolean | string = false;
  export let tooltip: string = null;
  export let width: string = null;
  export let onChange: (value: Date) => void | Promise<void> = null;
  export let classes = "";
  export let inputEl: HTMLInputElement = null;

  $: dateString = toDateString(value);

  function toDateString(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return "";
    }
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  async function onChanged() {
    let [year, month, day] = inputEl.value.split("-").map(Number);
    if (!year) {
      return;
    }
    let date = value ? new Date(value) : new Date();
    date.setFullYear(year, month - 1, day);
    if (!value) {
      date.setHours(0, 0, 0, 0);
    }
    value = date;
    try {
      await onChange?.(value);
    } catch (ex) {
      showError(ex);
    }
  }
</script>

<style>
  .lo-datefield {
    box-sizing: border-box;
    min-width: 0;
    height: 32px;
    margin: 0;
    padding: 0 6px 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    background-image: none;
    color: var(--lo-fg);
    font: inherit;
  }
  .lo-datefield:hover:not(:disabled) {
    border-color: var(--lo-border-strong);
  }
  .lo-datefield:focus {
    outline: none;
    border-color: var(--lo-accent);
    box-shadow: inset 0 -1px 0 var(--lo-accent);
  }
  .lo-datefield:disabled {
    background-color: var(--lo-pane-alt-bg);
    color: var(--lo-fg-disabled);
  }
  .lo-datefield::-webkit-calendar-picker-indicator {
    opacity: 0.7;
  }
  .lo-datefield::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
</style>
