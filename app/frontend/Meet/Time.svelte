{#if event}
  {#if progress}
    <hbox class="progressbar" style="width: {progress * 100}%" />
  {/if}
  <hbox class="time">
    {duration}
  </hbox>
  <!--hbox class="debug">
    Start time {event.startTime?.toLocaleTimeString()}
    End time {event.endTime?.toLocaleTimeString()}
    Started {meeting.started?.toLocaleTimeString()}
    End time {meeting.ended?.toLocaleTimeString()}
  </hbox-->
{/if}

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";

  export let meeting: VideoConfMeeting;

  $: event = meeting?.event;
  $: progress = meeting.started && event.startTime && event.endTime && event.endTime.getTime() - event.startTime.getTime() > 0
    ? (new Date().getTime() - event.startTime.getTime()) / (event.endTime.getTime() - event.startTime.getTime())
    : 0;
  $: duration = calculateDuration(meeting.started);
  function calculateDuration(started: Date): string {
    if (!started) {
      return;
    }
    let dur = new Date();
    dur.setTime(dur.getTime() - meeting.started.getTime());
    console.log("dur", dur);
    duration = dur.toLocaleTimeString();
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
    font-size: 14px;
  }
</style>
