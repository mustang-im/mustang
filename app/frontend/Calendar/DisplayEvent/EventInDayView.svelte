<vbox class="calendar" flex>
  <hbox class="date header">
    {getFormattedDateString(calendarStart, { weekday: "short", day: "numeric", month: "short" })}
  </hbox>
  <DayViewGrid
    events={appGlobal.calendarEvents}
    overlayEvents={new ArrayColl([event])}
    start={calendarStart}
    showHours={4}
    showDays={1}
    defaultFocusHour={calendarStart.getHours() + calendarStart.getMinutes() / 60 - 1}
    >
    <hbox class="proposal" slot="event-overlay" let:start let:end let:event>
      <EventProposal {start} {end}>
        <slot name="event-buttons" slot="buttons" {event} {start} {end} />
      </EventProposal>
    </hbox>
    <hbox slot="day-header" /><!-- Removed here. We add it above. -->
  </DayViewGrid>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { appGlobal } from "../../../logic/app";
  import DayViewGrid from "../DayView/DayViewGrid.svelte";
  import { getFormattedDateString } from "../../Util/date";
  import EventProposal from "../SML/Shared/EventProposal.svelte";
  import { ArrayColl } from "svelte-collections";

  export let event: Event;

  $: calendarStart = new Date($event?.startTime?.getTime());
</script>

<style>
  .date.header {
    justify-content: center;
  }
  .calendar :global(.header) {
    background-color: var(--leftbar-bg);
  }
  .calendar :global(.time.label) {
    width: 1.1em;
    max-height: 1.3em;
    overflow: hidden;
    font-size: 70%;
    margin-inline-end: 6px;
  }
  .proposal {
    height: 100%;
    width: 100%;
  }
</style>
