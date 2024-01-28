<hbox class="day" on:dblclick={changeToDay}>
  {day.toLocaleDateString(undefined, { day: "numeric" })}
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
  .month {
    font-size: 90%;
    align-self: end;
    margin-left: 8px;
  }
</style>
