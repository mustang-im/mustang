<hbox class="title-bar">
  <hbox class="app-title">Calendar</hbox>
  <button class="add-button round large" on:click={addEvent}>
    <Icon data={calendarAdd} scale={1} />
  </button>
  <hbox class="date-paging">
    <button class="previous-button round large" on:click={pagePrevious}>
      <Icon data={arrowPrevious} scale={1} />
    </button>        
    <button class="next-button round large" on:click={pageNext}>
      <Icon data={arrowNext} scale={1} />
    </button>        
  </hbox>
  <hbox class="spacer" />
  <ViewSelector bind:dateInterval />
  <hbox class="date-interval">of</hbox>
  <hbox class="date-range">{simpleDateString(showDate)}</hbox>
</hbox>

<script lang="ts">
  import type { DateInterval } from "./selected";
  import ViewSelector from "./ViewSelector.svelte";
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
  button {
    margin: 8px;
  }
  .next-button, .previous-button {
    margin: 8px;
    background-color: inherit;
    color: inherit;
    border: 1px solid black;
  }
</style>
