<vbox class="free-slots" flex>
  <hbox class="range-header">
    <DateRange bind:date={day} dateInterval={7} showDays={kShowDays} />
  </hbox>
  <AvailabilityLoader {event} from={weekStart} to={weekEnd} bind:freeBusy>
    {#if freeBusy.hasInformation}
      <DayViewGrid
        start={day}
        defaultFocusHour={Math.max($event.startTime.getHours() - 1, 0)}
        showDays={kShowDays}
        {showHours}
        events={noEvents}
        overlayEvents={slotEvents}
        >
        <Clickable slot="event-overlay" let:event={slotEvent} onClick={() => moveMeetingTo(slotEvent.startTime)}>
          {@const slot = slotsByEvent.get(slotEvent)}
          {#if slot}
            <hbox class="slot font-small availability-{slot.availability}"
              class:meeting={slot.start < $event.endTime && slot.end > $event.startTime}
              title={slotDetails(slot)}>
              <hbox class="time">
                <span class="start">{getTimeString(slot.start)}</span>
                <span class="end">– {getTimeString(slot.end)}</span>
              </hbox>
              {#if slot.busy.hasItems}
                <hbox class="names">{$t`Busy: ${names(slot.busy)}`}</hbox>
              {/if}
            </hbox>
          {/if}
        </Clickable>
      </DayViewGrid>
    {:else}
      <hbox class="no-info">
        {freeBusy.isSupported
          ? $t`The availability of the participants is unknown`
          : $t`This calendar doesn't provide the availability of other people`}
      </hbox>
    {/if}
  </AvailabilityLoader>
</vbox>

<script lang="ts">
  import { Event } from "../../../../logic/Calendar/Event";
  import type { Participant } from "../../../../logic/Calendar/Participant";
  import type { FreeBusy, FreeBusySlot } from "../../../../logic/Calendar/FreeBusy";
  import AvailabilityLoader from "./AvailabilityLoader.svelte";
  import DayViewGrid from "../../DayView/DayViewGrid.svelte";
  import DateRange from "../../DateRange.svelte";
  import Clickable from "../../../Shared/Clickable.svelte";
  import { getTimeString, getWeekDays, getWeekStart } from "../../../../logic/util/date";
  import { ArrayColl, type Collection } from "svelte-collections";
  import { t } from "../../../../l10n/l10n";

  /** The meeting. Clicking a time slot moves it there.
   * in/out */
  export let event: Event;
  /** How many hours fit into the visible height */
  export let showHours = 5;

  const kShowDays = 5; // Mon-Fri
  const kStartHour = 8;
  const kEndHour = 18;
  const kSlotMinutes = 60;

  let day = new Date(event.startTime);
  $: weekStart = getWeekStart(day);
  $: weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + kShowDays);

  /** The free/busy blocks are no real events and are in no calendar,
   * so they are shown as overlay and not as events, which the user could open. */
  let noEvents = new ArrayColl<Event>();
  let slotEvents = new ArrayColl<Event>();
  let slotsByEvent = new Map<Event, FreeBusySlot>();
  let freeBusy: FreeBusy | null = null;
  $: freeBusy, setSlots();
  function setSlots() {
    let days = getWeekDays(weekStart).slice(0, kShowDays);
    let slots = freeBusy?.slots(days, kStartHour, kEndHour, kSlotMinutes) ?? new ArrayColl<FreeBusySlot>();
    slotsByEvent = new Map(slots.contents.map(slot => {
      let slotEvent = new Event();
      slotEvent.startTime = slot.start;
      slotEvent.endTime = slot.end;
      return [slotEvent, slot];
    }));
    slotEvents.replaceAll([...slotsByEvent.keys()]);
  }

  function names(participants: Collection<Participant>): string {
    return participants.contents.map(participant => participant.name || participant.emailAddress).join(", ");
  }

  function slotDetails(slot: FreeBusySlot): string {
    return [
      `${getTimeString(slot.start)} – ${getTimeString(slot.end)}`,
      slot.free.hasItems ? $t`Free: ${names(slot.free)}` : null,
      slot.busy.hasItems ? $t`Busy: ${names(slot.busy)}` : null,
      slot.unknown.hasItems ? $t`Unknown: ${names(slot.unknown)}` : null,
    ].filter(line => line).join("\n");
  }

  // <copied from="../TimeBox.svelte" onStartTimeChanged()>
  function moveMeetingTo(start: Date) {
    let duration = event.duration;
    event.startTime = new Date(start);
    event.duration = duration;
  }
  // </copied>
</script>

<style>
  .free-slots {
    min-height: 0;
  }
  .range-header {
    justify-content: center;
  }
  .slot {
    height: calc(100% - 4px);
    width: calc(100% - 6px);
    margin: 1px 2px 3px 2px;
    padding: 2px 6px;
    box-sizing: border-box;
    overflow: hidden;
    flex-wrap: wrap;
    align-content: start;
    column-gap: 1em;
    line-height: 1.3;
    border: 1px solid color-mix(in srgb, var(--slot-color) 65%, black);
    border-radius: var(--border-radius);
    background-color: var(--slot-color);
    color: black;
    cursor: pointer;
    container-type: inline-size;
  }
  .slot.availability-free {
    --slot-color: #CBF3E1;
  }
  .slot.availability-partly {
    --slot-color: #F9F791;
  }
  .slot.availability-busy {
    --slot-color: #FF7676;
  }
  .slot.meeting {
    border-width: 2px;
    border-color: var(--fg);
  }
  @media (prefers-color-scheme: dark) {
    .slot {
      background-color: color-mix(in srgb, var(--slot-color) 30%, var(--bg));
      border-color: color-mix(in srgb, var(--slot-color) 60%, var(--bg));
      color: var(--fg);
    }
    .slot.availability-free {
      --slot-color: #3FBF8F;
    }
    .slot.availability-partly {
      --slot-color: #D8CF3A;
    }
    .slot.availability-busy {
      --slot-color: #E05555;
    }
  }
  .slot:hover {
    border-color: var(--fg);
  }
  .time {
    gap: 0.3em;
    font-weight: 600;
    white-space: nowrap;
  }
  .end {
    font-weight: normal;
    opacity: 70%;
  }
  @container (width < 10em) {
    .end {
      display: none;
    }
  }
  .names {
    display: block;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .no-info {
    margin: 12px;
    opacity: 70%;
  }
  .free-slots :global(.day-header .date-day) {
    padding: 4px 8px;
  }
  .free-slots :global(.day-header .date) {
    font-size: 90%;
  }
  .free-slots :global(.day-header .weekday) {
    font-size: 70%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
