<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox flex class="event-edit-window">
  <hbox class="window-title-bar">
    {event.title ? 'Edit event' : 'New event'}
    <hbox flex class="spacer" />
    <RoundButton
      label="Close"
      icon={CloseIcon}
      iconSize="16px"
      on:click={onClose}
      />
  </hbox>
  <hbox flex class="left-right">
    <vbox flex class="left-pane">
      <hbox class="title">
        <input placeholder="Title - Enter the topic of the meeting" bind:value={event.title} />
      </hbox>
      <vbox class="participants">
        <PersonsAutocomplete persons={event.participants} placeholder="Add participants">
          <hbox slot="display-bottom-row" let:person>
            <PersonAvailability {person} />
          </hbox>
          <hbox slot="result-bottom-row" let:person>
            <PersonAvailability {person} />
          </hbox>
        </PersonsAutocomplete>
      </vbox>
      <vbox class="location">
        <hbox class="online">
          <Checkbox bind:checked={event.isOnline} label="Online" />
          <input type="url" bind:value={event.onlineMeetingURL} disabled={!event.isOnline} placeholder="Meeting URL" />
          <Button
            label="Copy"
            icon={CopyIcon}
            iconSize="16px"
            disabled={!event.isOnline || !event.onlineMeetingURL}
            on:click={onCopyMeetingURL}
            />
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
        <Button
          label="Save"
          icon={SaveIcon}
          iconSize="16px"
          on:click={onSave}
          />
      </hbox>
    </vbox>
  </hbox>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { EventEditMustangApp, calendarMustangApp } from "../CalendarMustangApp";
  import PersonsAutocomplete from "../../Shared/PersonAutocomplete/PersonsAutocomplete.svelte";
  import PersonAvailability from "./PersonAvailability.svelte";
  import TimeInput from "./TimeInput.svelte";
  import DurationUnit from "./DurationUnit.svelte";
  import Button from "../../Shared/Button.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import { Checkbox } from "@svelteuidev/core";
  import SaveIcon from "lucide-svelte/icons/check";
  import CloseIcon from "lucide-svelte/icons/x";
  import CopyIcon from "lucide-svelte/icons/copy";

  export let event: Event;

  let durationUnit: DurationUnit;
  let durationInUnit: number;

  function onCopyMeetingURL() {
    new Clipboard().writeText(event.onlineMeetingURL);
  }

  function onSave() {
    onClose();
  }

  function onClose() {
    let me = calendarMustangApp.subApps.find(app => app instanceof EventEditMustangApp && app.mainWindowProperties.event == event);
    calendarMustangApp.subApps.remove(me);
  }
</script>

<style>
  .event-edit-window {
    margin: 30px 40px;
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
