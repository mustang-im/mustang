{#if event}
  {#if progress}
    <hbox class="progressbar" style="width: {progress * 100}%" />
  {/if}
  <hbox class="time font-small">
    {duration}
  </hbox>
  <!--hbox class="debug">
    Start time {event.startTime?.toLocaleTimeString(getDateTimeFormatPref())}
    End time {event.endTime?.toLocaleTimeString(getDateTimeFormatPref())}
    Started {meeting.started?.toLocaleTimeString(getDateTimeFormatPref())}
    End time {meeting.ended?.toLocaleTimeString(getDateTimeFormatPref())}
  </hbox-->
{/if}

<script lang="ts">
  import type { VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import { getDateTimeFormatPref } from "../../../l10n/l10n";

  export let meeting: VideoConfMeeting;

  $: event = meeting?.event;
  $: progress = event ? meeting.started && event.startTime && event.endTime && event.endTime.getTime() - event.startTime.getTime() > 0
      ? (new Date().getTime() - event.startTime.getTime()) / (event.endTime.getTime() - event.startTime.getTime())
      : 0
    : 0;
  $: duration = calculateDuration(meeting.started);
  function calculateDuration(started: Date): string {
    if (!started) {
      return;
    }
    let dur = new Date();
    dur.setTime(dur.getTime() - meeting.started.getTime());
    console.log("dur", dur);
    duration = dur.toLocaleTimeString(getDateTimeFormatPref());
    setTimeout(calculateDuration, 1000);
    return duration;
  }
</script>

<style>
  .progressbar {
    border-top: 2px solid green;
    align-self: flex-start;
  }
  .time {
    align-self: flex-end;
    margin: 4px 16px -4px 0;
  }
</style>
