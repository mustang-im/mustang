<hbox class="day" on:click={selectDay} on:dblclick={changeToDay} class:today={day.getTime() == today.getTime()}>
  <hbox class="date-number">
    {day.toLocaleDateString(getUILocale(), { day: "numeric" })}
  </hbox>
  {#if withMonthOnFirst && day.getDate() == 1 ||
          withMonthOnMonday && day.getDay() == 1 }
    <hbox class="month">
      {day.toLocaleDateString(getUILocale(), { month: "short" })}
    </hbox>
  {/if}
  <hbox class="today-icon" flex>
    <TodayIcon size={14} />
  </hbox>
</hbox>

<script lang="ts">
  import { selectedDate, selectedDateInterval } from "../selected";
  import { getToday } from "../../Util/date";
  import TodayIcon from "lucide-svelte/icons/home";
  import { getUILocale } from "../../../l10n/l10n";

  export let day: Date
  export let withMonthOnMonday = true;
  export let withMonthOnFirst = true;

  const today = getToday();

  function selectDay() {
    $selectedDate = day;
  }

  function changeToDay() {
    $selectedDate = day;
    $selectedDateInterval = 2;
  }
</script>

<style>
  .day {
    padding: 4px 8px;
    border-left: 1px dotted var(--border);
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
  @media (prefers-color-scheme: dark) {
    .today .date-number {
      background-color: var(--selected-bg);
    }
  }
  .month {
    font-size: 90%;
    align-self: end;
    margin-inline-start: 8px;
  }
  .today-icon {
    display: none;
  }
  .day.today .today-icon {
    display: flex;
    margin-inline-start: 8px;
    justify-content: start;
    align-items: center;
  }
  .today-icon :global(svg) {
    stroke-width: 1px;
  }
</style>
