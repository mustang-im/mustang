{#await check(start, $participants) }
  {$t`Checking…`}
{:then}
  <vbox class="availability-grid">
    <WeekView
      {start}
      defaultFocusHour={start.getHours()}
      showDays={7}
      showHours={5}
      events={freeBusy}
      >
      <hbox slot="top-left">
      </hbox>
    </WeekView>
  </vbox>
{:catch ex}
  <hbox class="error">
    {ex instanceof UserError ? null : showError(ex), ""}
    {ex?.message  ?? ex + ""}
  </hbox>
{/await}

<script lang="ts">
  import { Participant } from "../../../logic/Calendar/Participant";
  import { Event } from "../../../logic/Calendar/Event";
  import { Calendar } from "../../../logic/Calendar/Calendar";
  import WeekView from "../DayView/WeekView.svelte";
  import { UserError } from "../../../logic/util/util";
  import { showError } from "../../Util/error";
  import { ArrayColl, type Collection } from "svelte-collections";
  import { gt, t } from "../../../l10n/l10n";

  /** The invitees for which to show their availability */
  export let participants: Collection<Participant>;
  /** The proposed start time of the event.
   * This is the time that will be checked, along with surrounding times
   * of the same week and hour.
   *
   * If the user clicks on another time in the grid, this start time will be
   * set to the new time.
   * in/out */
  export let start: Date;
  /** The calendar server used to check the participant's availability.
   * The assumption is that they have their calendars on the same server.
   * If not, it won't work. */
  export let calendar: Calendar;


  let freeBusy = new ArrayColl<Event>();
  async function check(start: Date, participants: Collection<Participant>) {
    freeBusy.clear();
    if (!participants?.length || participants.length == 1) {
      throw new UserError(gt`Add some participants`);
    }
    const startDay = start.getDate();
    const showDays = 5;
    const startHour = 8;
    const showHours = 10;
    let from = start;
    let to = new Date(start);
    to.setDate(to.getDate() + showDays);
    let availability = await calendar.arePersonsFree(participants.contents, from, to);
    console.log("availability", availability);
    if (!availability?.length || availability.filter(avp => avp.availability.length).length <= 1) {
      throw new UserError(gt`No way to know`);
    }
    for (let day = startDay; day <= startDay + showDays; day++) {
      for (let hour = startHour; hour <= startHour + showHours - 1; hour++) {
        let event = new Event();
        let startTime = new Date(start);
        startTime.setDate(day);
        startTime.setHours(hour);
        startTime.setMinutes(0);
        startTime.setSeconds(0);
        startTime.setMilliseconds(0);
        let endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);
        event.startTime = startTime;
        event.endTime = endTime;

        let participantsInfo = availability.map(avp => ({
          participant: avp.participant,
          free: avp.availability.find(av => av.from <= startTime && endTime <= av.to)?.free,
        }));
        let freeParticipants = participantsInfo.filter(avp => avp.free === true).map(avp => avp.participant);
        let busyParticipants = participantsInfo.filter(avp => avp.free === false).map(avp => avp.participant);
        let unknownParticipants = participantsInfo.filter(avp => avp.free !== true && avp.free !== false).map(avp => avp.participant);
        if (unknownParticipants.length == participantsInfo.length) {
          console.log("No info about ", event.startTime.toLocaleTimeString());
          continue;
        }
        let freeQuota = freeParticipants.length / participantsInfo.length;
        console.log("free ", Math.round(freeQuota * 100), "%", "at", event.startTime.toLocaleTimeString());

        event.color =
          freeQuota == 1 ? "00FF00" : // green
          freeQuota < 0.6 ? "FF0000" : // red
          "FFFF00"; // yellow
        event.title =
          gt`Busy` + ": " + busyParticipants.map(p => p.name).join(", ") + "\n" +
          gt`Free` + ": " + freeParticipants.map(p => p.name).join(", ") + "\n" +
          gt`Unknown` + ": " + unknownParticipants.map(p => p.name).join(", ");
        freeBusy.add(event);
      }
    }
  }
</script>

<style>
  .availability-grid {
    height: 300px;
    width: 400px;

    margin-block-start: 4px;
    padding-block-start: 8px;
    padding-inline-start: 8px;
    border: 1px dotted var(--border);
    border-radius: 3px;
  }
  .availability-grid :global(.event .time) {
    display: none;
  }
  .availability-grid :global(.day-header) {
    padding: 4px 8px;
  }
  .availability-grid :global(.day-header .date) {
    font-size: 90%;
  }
  .availability-grid :global(.day-header .weekday) {
    font-size: 70%;
    overflow-wrap: break-word;
    overflow-x: hidden;
    max-width: 16px;
  }
  .error {
    color: darkred;
    margin-block-start: 8px;
  }
</style>
