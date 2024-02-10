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
        <PersonsAutocomplete persons={event.participants} placeholder="Add participants">
          <slot slot="display-bottom-row" let:person>
            <PersonAvailability {person} />
          </slot>
          <slot slot="result-bottom-row" let:person>
            <PersonAvailability {person} />
          </slot>
        </PersonsAutocomplete>
      </vbox>
      <vbox class="location">
        <hbox class="online">
          <Checkbox bind:checked={event.isOnline} label="Online" />
          <input type="url" bind:value={event.onlineMeetingURL} disabled={!event.isOnline} placeholder="Meeting URL" />
          <Button on:click={onCopyMeetingURL} disabled={!event.isOnline || !event.onlineMeetingURL}>Copy</Button>
        </hbox>
        <hbox class="presence">
          <Checkbox checked={!!event.location} disabled={!event.location} label="In Presence" />
          <input type="url" bind:value={event.location} placeholder="Location" />
        </hbox>
      </vbox>
      <vbox class="description">
        <textarea class="descriptionText" bind:value={event.descriptionText} />
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
          <input type="number" bind:value={durationInUnit} on:input={durationUnit.onChange} min={0} id="duration" />
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
  import PersonsAutocomplete from "../../Shared/PersonAutocomplete/PersonsAutocomplete.svelte";
  import PersonAvailability from "./PersonAvailability.svelte";
  import TimeInput from "./TimeInput.svelte";
  import DurationUnit from "./DurationUnit.svelte";
  import { Button, Checkbox } from "@svelteuidev/core";

  export let event: Event;

  let durationUnit: DurationUnit;
  let durationInUnit: number;

  function onCopyMeetingURL() {
    new Clipboard().writeText(event.onlineMeetingURL);
  }

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
  .availability {
    font-size: 12px;
  }
  .descriptionText {
    min-height: 10em;
    border: 1px solid lightgrey;
    margin-top: 32px;
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
