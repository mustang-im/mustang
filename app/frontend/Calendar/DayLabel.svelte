<hbox class="day" on:dblclick={changeToDay} class:today={day.getTime() == today.getTime()}>
  <hbox class="date-number">
    {day.toLocaleDateString(undefined, { day: "numeric" })}
  </hbox>
  {#if withMonthOnFirst && day.getDate() == 1 ||
          withMonthOnMonday && day.getDay() == 1 }
    <hbox class="month">
      {day.toLocaleDateString(undefined, { month: "short" })}
    </hbox>
  {/if}
</hbox>

<script lang="ts">
  import { selectedShowDate, selectedDateInterval } from "./selected";

  export let day: Date
  export let withMonthOnMonday = true;
  export let withMonthOnFirst = true;

  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  function changeToDay() {
    $selectedShowDate = day;
    $selectedDateInterval = 1;
  }
</script>

<style>
  .day {
    padding: 4px 8px;
    border-left: 1px dashed #E1E2E5;
    font-size: 13px;
  }
  .today {
    padding: 0px 8px;
  }
  .today .date-number {
    background-color: black;
    color: white;
    border-radius: 1000px;
    padding: 4px 6px;
  }
  .month {
    font-size: 90%;
    align-self: end;
    margin-left: 8px;
  }
</style>
