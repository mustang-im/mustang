<hbox class="title-bar">
  <hbox class="app-title">Calendar</hbox>
  <RoundButton classes="add-button" on:click={addEvent}>
    <Icon slot="icon" data={calendarAdd} scale={1} />
  </RoundButton>
  <hbox class="date-paging">
    <RoundButton classes="previous-button" on:click={pagePrevious}>
        <Icon slot="icon" data={arrowPrevious} scale={1} />
    </RoundButton>
    <RoundButton classes="next-button" on:click={pageNext}>
        <Icon slot="icon" data={arrowNext} scale={1} />
    </RoundButton>
  </hbox>
  <hbox class="spacer" />
  <ViewSelector bind:dateInterval />
  <hbox class="date-interval">of</hbox>
  <hbox class="date-range">{simpleDateString(showDate)}</hbox>
</hbox>

<script lang="ts">
  import type { DateInterval } from "./selected";
  import ViewSelector from "./ViewSelector.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Icon from 'svelte-awesome';
  import calendarAdd from 'svelte-awesome/icons/calendarPlusO';
  import arrowPrevious from 'svelte-awesome/icons/chevronLeft';
  import arrowNext from 'svelte-awesome/icons/chevronRight';
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
    color: inherit;
    align-items: center;
    justify-content: center;
  }
</style>
