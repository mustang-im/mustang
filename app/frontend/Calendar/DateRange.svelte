<hbox class="date-range-header">
  <hbox class="date-range">{simpleDateString(date)}</hbox>
  <Button classes="previous-button" label={$t`Previous ${dateLabel(dateInterval)}`} icon={ChevronLeftIcon} on:click={pagePrevious} iconSize="16px" plain iconOnly />
  <Button classes="next-button" label={$t`Next ${dateLabel(dateInterval)}`} icon={ChevronRightIcon} on:click={pageNext} iconSize="16px" plain iconOnly />
</hbox>

<script lang="ts">
  import Button from "../Shared/Button.svelte";
  import ChevronLeftIcon from "lucide-svelte/icons/chevron-left";
  import ChevronRightIcon from "lucide-svelte/icons/chevron-right";
  import { getUILocale, t } from "../../l10n/l10n";

  export let date = new Date(); /* in/out */
  export let dateInterval: number; /* in */

  function dateLabel(dateInterval) {
    return {
      "1": "day",
      "7": "week",
      "14": "fortnight",
      "21": "3 weeks",
      "28": "4 weeks",
      "35": "month"
    }[dateInterval] || dateInterval + " days";
  }

  function pageNext() {
    date.setDate(date.getDate() + dateInterval);
    date = date;
  }
  function pagePrevious() {
    if (dateInterval == 35) {
      date.setDate(date.getDate() - 28);
    } else {
      date.setDate(date.getDate() - dateInterval);
    }
    date = date;
  }

  function simpleDateString(date) {
    date = new Date(date);
    date.setDate(date.getDate() + (dateInterval >> 1));
    return date.toLocaleDateString(getUILocale(), {
      year: "numeric",
      month: "long",
      // day: dateInterval < 28 ? "numeric" : undefined,
    });
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
  }
</style>
