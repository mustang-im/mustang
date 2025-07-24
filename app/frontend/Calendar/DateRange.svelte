<hbox class="date-range-header">
  <hbox class="date-range">{@html htmlMonthYear(date)}</hbox>
  <Button classes="previous-button" label={$t`Previous ${dateInterval} days`} icon={ChevronLeftIcon} on:click={pagePrevious} iconSize="16px" plain iconOnly />
  <Button classes="next-button" label={$t`Next ${dateInterval} days`} icon={ChevronRightIcon} on:click={pageNext} iconSize="16px" plain iconOnly />
</hbox>

<script lang="ts">
  import Button from "../Shared/Button.svelte";
  import ChevronLeftIcon from "lucide-svelte/icons/chevron-left";
  import ChevronRightIcon from "lucide-svelte/icons/chevron-right";
  import { getDateTimeFormatPref, t } from "../../l10n/l10n";

  export let date = new Date(); /* in/out */
  export let dateInterval: number; /* in */

  function pageNext() {
    // Advance months by 42 days just to be sure, e.g. for March 2025
    // MonthView.setDays will then rewind as necessary.
    date.setDate(date.getDate() + (dateInterval == 35 ? 42 : dateInterval));
    date = date;
  }
  function pagePrevious() {
    // Rewind by 28 days at most, e.g. for February 2025
    // MonthView.setDays will rewind further if necessary.
    date.setDate(date.getDate() - (dateInterval == 35 ? 28 : dateInterval));
    date = date;
  }

  function monthYear(date): string {
    // Show the month that covers most of the current date range.
    date = new Date(date);
    date.setDate(date.getDate() + (dateInterval >> 1));
    return date.toLocaleDateString(getDateTimeFormatPref(), {
      year: "numeric",
      month: "long",
      // day: dateInterval < 28 ? "numeric" : undefined,
    });
  }

  function htmlMonthYear(date): string {
    let str = monthYear(date);
    let year = date.getFullYear();
    return str.replace(year, `&nbsp;<span class="year">${year}</span>&nbsp;`);
  }
</script>

<style>
  .date-range-header {
    align-items: center;
    align-self: end;
    margin-block-end: 4px;
  }
  .date-range {
    font-size: 18px;
    margin-inline-start: 8px;
    margin-inline-end: 8px;
    min-width: 9em;
  }
</style>
