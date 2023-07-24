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
  <hbox class="date-interval">{dateIntervalLabel(dateInterval)} of</hbox>
  <hbox class="date-range">{dateRangeString(dateRange)}</hbox>
</hbox>

<script lang="ts">
  import Icon from 'svelte-awesome';
  import calendarAdd from 'svelte-awesome/icons/calendarPlusO';
  import arrowPrevious from 'svelte-awesome/icons/chevronLeft';
  import arrowNext from 'svelte-awesome/icons/chevronRight';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let dateRange = new Date();
  export let dateInterval: 1 | 7 | 31 | 28 = 7;

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

  function dateRangeString(date) {
    console.log("Date range", date);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: dateInterval < 28 ? "numeric" : null,
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
