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
  <NativeSelect
      data={dateIntervalOptions}
      bind:value={dateIntervalSelected}
  />
  <hbox class="date-interval">of</hbox>
  <hbox class="date-range">{dateRangeString(dateRange)}</hbox>
</hbox>

<script lang="ts">
  import { NativeSelect } from '@svelteuidev/core';
  import Icon from 'svelte-awesome';
  import calendarAdd from 'svelte-awesome/icons/calendarPlusO';
  import arrowPrevious from 'svelte-awesome/icons/chevronLeft';
  import arrowNext from 'svelte-awesome/icons/chevronRight';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let dateRange = new Date(); /* in/out */
  export let dateInterval: 1 | 7 | 31 | 28 = 7; /* in/out */

  function addEvent() {
    dispatch('addEvent');
  }
  function pageNext() {
    dateRange.setDate(dateRange.getDate() + dateInterval);
    dateRange = dateRange;
  }
  function pagePrevious() {
    dateRange.setDate(dateRange.getDate() - dateInterval);
    dateRange = dateRange;
  }

  function dateIntervalLabel(interval: number) {
    if (interval == 1) {
      return "Day";
    } else if (interval == 7) {
      return "Week";
    } else if (interval == 31) {
      return "Month";
    } else if (interval == 28) {
      return "4 Weeks";
    } else {
      return interval + " days";
    }
  }

  let dateIntervalSelected = dateInterval.toString();
  $: dateInterval = parseInt(dateIntervalSelected) as 1 | 7 | 31 | 28;
  const dateIntervalOptions = [
    { value: "1", label: dateIntervalLabel(1) },
    { value: "7", label: dateIntervalLabel(7) },
    { value: "28", label: dateIntervalLabel(28) },
    { value: "31", label: dateIntervalLabel(31) },
  ];

  function dateRangeString(date) {
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
