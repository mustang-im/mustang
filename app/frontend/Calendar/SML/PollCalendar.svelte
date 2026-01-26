<!-- <copied from="EditCalendar.svelte"> -->
<vbox class="calendar">
  <hbox class="range-header">
    <DateRange bind:date={showDate} dateInterval={1} />
  </hbox>
  <DayViewGrid
    events={appGlobal.calendarEvents}
    overlayEvents={optionsAsEvents}
    start={showDate}
    showDays={showDays}
    showHours={6}
    defaultFocusHour={focusOption.getHours() - 1}
    >
    <hbox class="option" slot="event-overlay" let:start let:end>
      <EventProposal {start} {end}>
        <PollTimeButtons slot="buttons" time={start} {myVotes} />
      </EventProposal>
    </hbox>
  </DayViewGrid>
</vbox>

<script lang="ts">
  import type { TSMLMeetingTimeVote } from "../../../logic/Mail/SML/TSML";
  import { Event } from "../../../logic/Calendar/Event";
  import { getToday } from "../../Util/date";
  import { appGlobal } from "../../../logic/app";
  import PollTimeButtons from "./PollTimeButtons.svelte";
  import DayViewGrid from "../DayView/DayViewGrid.svelte";
  import EventProposal from "./EventProposal.svelte";
  import DateRange from "../DateRange.svelte";
  import type { ArrayColl, Collection } from "svelte-collections";

  export let options: Collection<Date>;
  /** in minutes */
  export let duration: number;
  export let myVotes: ArrayColl<TSMLMeetingTimeVote>;
  export let focusOption: Date = getToday();
  export let showDays: 1 | 2 | 7 = 2;

  $: showDate = focusOption;

  $: optionsAsEvents = $options.map(start => {
    let event = new Event();
    event.startTime = start;
    event.durationMinutes = duration;
    return event;
  });
</script>

<style>
  .calendar {
    height: 100%;
  }
  .range-header {
    justify-content: center;
  }
  .calendar :global(.top-left.header),
  .calendar :global(.day-header) {
    background-color: var(--leftbar-bg);
  }
  .calendar :global(.day-header) {
    max-height: 2em;
    overflow: hidden;
  }
  .calendar :global(.day-header .date-day) {
    flex-direction: row;
    align-items: center;
    padding: 4px 8px;
  }
  .calendar :global(.day-header .date-day .date) {
    font-size: 100%;
  }
  .calendar :global(.day-header .date-day .weekday) {
    font-size: 80%;
    margin-block-start: -1px;
    margin-inline-start: 6px;
  }
  .option {
    height: 100%;
    width: 100%;
  }
  .calendar .option :global(button.accepted) {
    opacity: 100%;
  }
  .option :global(button.accepted .icon) {
    color: green;
  }
  .option :global(button.remove .icon) {
    color: red;
  }
</style>
