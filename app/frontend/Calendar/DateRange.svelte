<hbox class="range-header">
  <hbox class="date-range">{simpleDateString(date)}</hbox>
  <Button classes="previous-button" icon={ChevronLeftIcon} on:click={pagePrevious} iconSize="16px" plain />
  <Button classes="next-button" icon={ChevronRightIcon} on:click={pageNext} iconSize="16px" plain />
</hbox>

<script lang="ts">
  import Button from "../Shared/Button.svelte";
  import ChevronLeftIcon from "lucide-svelte/icons/chevron-left";
  import ChevronRightIcon from "lucide-svelte/icons/chevron-right";

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
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      // day: dateInterval < 28 ? "numeric" : undefined,
    });
  }
</script>

<style>
  .range-header {
    margin-bottom: 4px;
  }
  .date-range {
    font-size: 18px;
    margin-left: 8px;
    width: 10em;
  }
</style>
