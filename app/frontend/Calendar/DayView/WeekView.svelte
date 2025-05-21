<vbox class="week-view" flex>
  <hbox class="range-header">
    <slot name="top-left" />
    <hbox flex />
    <DateRange bind:date={start} dateInterval={showDays == 2 ? 1 : showDays} />
    <Button classes="today-button" label={$t`Go back to today`} icon={TodayIcon} on:click={goToToday} iconSize="16px" plain iconOnly />
    <hbox flex />
    <slot name="top-right" />
  </hbox>
  <vbox flex bind:offsetHeight={visibleHeight}>
    <Scroll bind:this={scrollE}>
      <grid flex class="week" columns={showDays} style="min-height: {scrollHeight}px;">
        <hbox class="top-left header" />
        {#each days as day}
          <vbox class="day-header header">
            <hbox class="date">{day.toLocaleDateString(getUILocale(), { day: "numeric" })}</hbox>
            <hbox class="weekday">{day.toLocaleDateString(getUILocale(), { weekday: "long" })}</hbox>
            <vbox class="all-day-events">
              {#each allDayEvents.contents.filter(ev => ev.startTime <= day && day < ev.endTime) as event (event.id)}
                <AllDayEvent {event} {start} />
              {/each}
            </vbox>
          </vbox>
        {/each}
        {#each startTimes as start}
          <TimeLabel time={start} />
          <TimeDayRow {days} time={start} {events} />
        {/each}
      </grid>
    </Scroll>
  </vbox>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { getToday, k1DayMS } from "../../Util/date";
  import TimeLabel from "./TimeLabel.svelte";
  import TimeDayRow from "./TimeDayRow.svelte";
  import AllDayEvent from "./AllDayEvent.svelte";
  import DateRange from "../DateRange.svelte";
  import Button from "../../Shared/Button.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import TodayIcon from "lucide-svelte/icons/home";
  import type { Collection } from "svelte-collections";
  import { getUILocale, t } from "../../../l10n/l10n";

  export let start: Date;
  export let events: Collection<Event>;
  export let showDays: 1 | 2 | 7 = 7; // If you add new options, adapt styles below
  /* Number of hours visible at the same time. Larger range reduces size per hour.
   * Other hours are available on scroll. */
  export let showHours = 10;
  export let defaultFocusHour = 8;

  let startHour = 0;
  let endHour = 24;
  let intervalHour = 1;

  let scrollE: Scroll;
  let visibleHeight = 0;
  $: pxPerHour =  visibleHeight / showHours;
  $: scrollHeight = pxPerHour * (endHour - startHour);
  $: focusHour = start.toDateString() == new Date().toDateString()
    ? new Date().getHours()
    : defaultFocusHour;
  $: if (scrollE) scrollE.scrollTo((focusHour - 0.5) * pxPerHour);

  let startTimes: Date[] = [];
  $: start, setStartTimes();
  function setStartTimes() {
    let startTime = new Date(start);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    startTimes = [];
    for (let i = startHour; i < endHour; i += intervalHour) {
      startTime.setHours(i);
      startTimes.push(new Date(startTime));
    }
  }

  let days: Date[] = [];
  $: start, setDays();
  function setDays() {
    let startTime = new Date(start);
    if (showDays > 3) {
      startTime.setDate(startTime.getDate() - 1);
    }
    startTime.setHours(startHour);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    days = [];
    for (let i = 0; i < showDays; i++) {
      days.push(new Date(startTime));
      startTime.setDate(startTime.getDate() + 1)
    }
  }

  let allDayEvents: Collection<Event>;
  $: start, $events, setAllDayEvents();
  function setAllDayEvents() {
    let end = new Date(start.getTime() + showDays * k1DayMS);
    allDayEvents = events.filter(ev => ev.allDay && ev.startTime < end && start < ev.endTime);
  }

  function goToToday() {
    start = getToday();
  }
</script>

<style>
  .week {
    display: grid;
    grid-template-rows: max-content;
    grid-auto-rows: 1fr;
  }
  .week[columns="1"] {
    grid-template-columns: max-content auto;
  }
  .week[columns="2"] {
    grid-template-columns: max-content 3fr 1fr;
  }
  .week[columns="7"] {
    grid-template-columns: max-content 0.33fr 3fr 2fr 1fr 1fr 1fr 1fr;
  }
  .header {
    position: sticky;
    top: 0;
    left: 0;
    background-color: var(--bg);
    z-index: 2;
  }
  .top-left {
    height: calc(100% - 10px);
  }
  .day-header {
    padding: 8px 16px;
    border-top: 1px dotted var(--border);
    border-left: 1px dotted var(--border);
    border-bottom: 1px dotted var(--border);
  }
  .day-header .date {
    font-size: 180%;
    overflow-wrap: break-word;
  }
  .all-day-events {
    margin: 10px -16px -10px -16px;
    opacity: 85%;
  }
  .weekday {
    margin-block-start: -4px;
    margin-block-end: 4px;
  }
  .range-header {
    align-items: center;
  }
  .range-header :global(.today-button) {
    align-self: end;
    margin-block-end: 8px;
  }
</style>
