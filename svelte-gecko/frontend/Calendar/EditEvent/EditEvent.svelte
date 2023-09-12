<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox flex class="event-edit-window">
  <hbox class="window-title-bar">
    {event.title ? 'Edit event' : 'New event'}
    <hbox class="spacer" />
    <Button compact color="gray" on:click={onClose}>X</Button>
  </hbox>
  <hbox flex ="left-right">
    <vbox flex class="left-pane">
      <hbox class="title">
        <input placeholder="Title - Enter the topic of the meeting" bind:value={event.title} />
      </hbox>
      <vbox class="participants">
        <input placeholder="Add a participant or group" />
        <grid class="participants-list">
          {#each event.participants as participant (participant.id)}
            <ParticipantDisplay {participant} />
          {/each}
        </grid>
      </vbox>
    </vbox>
    <vbox flex class="right-pane">
      <hbox>When</hbox>
      <grid class="time">
        <label for="start-time">Day</label>
        <hbox>{event.startTime.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" })}</hbox>

        <label for="start-time">Start</label>
        <TimeInput time={event.startTime} />

        <label for="end-time">End</label>
        <TimeInput time={event.endTime} />

        <label for="duration">Duration</label>
        <hbox>
          <input type="number" bind:value={durationInUnit} on:change={durationUnit.onChange} min={0} id="duration" />
          <DurationUnit bind:durationInSeconds={event.duration} bind:durationInUnit bind:this={durationUnit} />
        </hbox>
      </grid>
      <Checkbox label="All day" bind:checked={event.allDay} />
      <Checkbox label="Repeated" bind:checked={event.repeat} />
      <Checkbox label="Alarm" checked={!!event.alarm} />
      <hbox class="spacer" />
      <hbox class="buttons">
        <hbox class="spacer" />
        <Button on:click={onClose}>OK</Button>
      </hbox>
    </vbox>
  </hbox>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { editingEvent } from "../selected";
  import ParticipantDisplay from "./ParticipantDisplay.svelte";
  import TimeInput from "./TimeInput.svelte";
  import DurationUnit from "./DurationUnit.svelte";
  import { Button, Checkbox } from "@svelteuidev/core";

  export let event: Event;

  let durationUnit: DurationUnit;
  let durationInUnit: number;

  function onClose() {
    $editingEvent = null;
  }
</script>

<style>
  .event-edit-window {
    margin: 15%;
  }
  .window-title-bar {
    margin-bottom: 32px;
    font-weight: bold;
  }
  .left-pane {
    flex: 2 0 0;
  }
  .right-pane {
    flex: 1 0 0;
  }
  input {
    border-top: none;
    border-left: none;
    border-right: none;
    width: 100%;
  }
  .title input {
    font-size: 200%;
  }
  .participants {
    margin-top: 32px;
  }
  .participants input {
    font-size: 120%;
  }
  .participants-list {
    min-height: 256px;
  }
  grid.time {
    grid-template-columns: max-content 1fr;
    justify-content: center;
    align-items: center;
  }
  grid input {
    margin: 8px;
  }
</style>
