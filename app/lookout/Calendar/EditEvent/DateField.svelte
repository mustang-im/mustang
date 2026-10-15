<hbox class="date-field" class:disabled title={label}>
  <span class="weekday">{weekday}</span>
  <DateInput {date} {disabled} on:change={event => onChange(event.detail)} />
</hbox>

<script lang="ts">
  import DateInput from "../../../frontend/Calendar/EditEvent/DateInput.svelte";
  import { getDateTimeLocale } from "../../../l10n/l10n";

  export let date: Date;
  export let label: string;
  export let disabled = false;
  export let onChange: (date: Date) => void;

  $: weekday = date?.toLocaleDateString(getDateTimeLocale(), { weekday: "short" }) ?? "";
</script>

<style>
  .date-field {
    align-items: center;
    height: 32px;
    padding-inline-start: 8px;
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
  .date-field.disabled {
    opacity: 0.5;
  }
  .weekday {
    min-width: 2.2em;
    color: var(--lo-fg);
  }
  .date-field :global(input) {
    height: 100%;
    padding: 0 6px 0 2px;
    border: none !important;
    background: none;
    color: var(--lo-fg);
    font: inherit;
    box-shadow: none !important;
    outline: none;
    color-scheme: light dark;
  }
</style>
