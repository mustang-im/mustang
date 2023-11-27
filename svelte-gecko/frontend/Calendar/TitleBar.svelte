<hbox class="title-bar">
  <hbox class="app-title">Calendar</hbox>
  <RoundButton classes="add-button" icon={AddToCalendarIcon} on:click={addEvent} iconSize="24px" filled />
  <RoundButton classes="previous-button" icon={ChevronLeftIcon} on:click={pagePrevious} iconSize="24px" />
  <RoundButton classes="next-button" icon={ChevronRightIcon} on:click={pageNext} iconSize="24px" />
  <hbox class="spacer" />
  <ViewSelector bind:dateInterval />
  <hbox class="date-interval">of</hbox>
  <hbox class="date-range">{simpleDateString(showDate)}</hbox>
</hbox>

<script lang="ts">
  import type { DateInterval } from "./selected";
  import ViewSelector from "./ViewSelector.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import ChevronLeftIcon from "lucide-svelte/icons/chevron-left";
  import ChevronRightIcon from "lucide-svelte/icons/chevron-right";
  import AddToCalendarIcon from "lucide-svelte/icons/calendar-plus";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let showDate = new Date(); /* in/out */
  export let dateInterval: DateInterval = 7; /* in/out */

  function addEvent() {
    dispatch('addEvent');
  }
  function pageNext() {
    showDate.setDate(showDate.getDate() + dateInterval);
    showDate = showDate;
  }
  function pagePrevious() {
    showDate.setDate(showDate.getDate() - dateInterval);
    showDate = showDate;
  }

  function simpleDateString(date) {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: dateInterval < 28 ? "numeric" : undefined,
    });
  }
</script>

<style>
  .title-bar {
    align-items: baseline;
    margin: 16px 32px;
  }
  .app-title {
    font-size: 200%;
    margin-right: 48px;
  }
  .date-interval {
    margin-left: 16px;
    margin-right: 16px;
  }
  .date-range {
    font-size: 200%;
  }
  .title-bar :global(.add-button),
  .title-bar :global(.next-button),
  .title-bar :global(.previous-button) {
    margin: 4px;
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
    position: relative;
  }
</style>
