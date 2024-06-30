<hbox class="date-range-header">
  <hbox class="date-range">{simpleDateString(date)}</hbox>
  <Button classes="previous-button" label={$t`Previous ${dateInterval} days`} icon={ChevronLeftIcon} on:click={pagePrevious} iconSize="16px" plain iconOnly />
  <Button classes="next-button" label={$t`Next ${dateInterval} days`} icon={ChevronRightIcon} on:click={pageNext} iconSize="16px" plain iconOnly />
</hbox>

<script lang="ts">
  import Button from "../Shared/Button.svelte";
  import ChevronLeftIcon from "lucide-svelte/icons/chevron-left";
  import ChevronRightIcon from "lucide-svelte/icons/chevron-right";
  import { getUILocale, t } from "../../l10n/l10n";

  export let date = new Date(); /* in/out */
  export let dateInterval: number; /* in */

  function pageNext() {
    date.setDate(date.getDate() + dateInterval);
    date = date;
  }
  function pagePrevious() {
    date.setDate(date.getDate() - dateInterval);
    date = date;
  }

  function simpleDateString(date) {
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
    margin-bottom: 4px;
  }
  .date-range {
    font-size: 18px;
    margin-left: 8px;
    margin-right: 8px;
  }
</style>
