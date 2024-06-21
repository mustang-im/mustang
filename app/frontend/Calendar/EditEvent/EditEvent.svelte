<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox flex class="event-edit-window">
  <hbox class="window-title-bar">
    {event.title ? $t`Edit event` : $t`New event`}
    <hbox flex class="spacer" />
    <RoundButton
      label={$t`Close`}
      icon={CloseIcon}
      iconSize="16px"
      on:click={onClose}
      />
  </hbox>
  <hbox flex class="left-right">
    <vbox flex class="left-pane">
      <hbox class="title">
        <input placeholder={$t`Title - Enter the topic of the meeting`} bind:value={event.title} />
      </hbox>
      <vbox class="participants">
        <PersonsAutocomplete persons={event.participants} placeholder={$t`Add participants`}>
          <hbox slot="display-bottom-row" let:person>
            <PersonAvailability {person} />
          </hbox>
          <hbox slot="result-bottom-row" let:person>
            <PersonAvailability {person} />
          </hbox>
        </PersonsAutocomplete>
      </vbox>
      <grid class="location">
        <Checkbox bind:checked={event.isOnline} label={$t`Online`} />
        <input type="url" bind:value={event.onlineMeetingURL} disabled={!event.isOnline} placeholder={$t`Meeting URL`} />
        <hbox class="buttons">
          <Button
            label={$t`Copy`}
            icon={CopyIcon}
            iconSize="16px"
            iconOnly
            plain
            disabled={!event.isOnline || !event.onlineMeetingURL}
            on:click={onCopyMeetingURL}
            />
          <Button
            label={$t`Open`}
            icon={BrowserIcon}
            iconSize="16px"
            iconOnly
            plain
            disabled={!event.isOnline || !event.onlineMeetingURL}
            on:click={onOpenMeetingURL}
            />
        </hbox>
        <Checkbox checked={!!event.location} disabled={!event.location} label={$t`In Presence`} />
        <input type="url" bind:value={event.location} placeholder={$t`Location`} />
        <hbox class="buttons" />
      </grid>
      <vbox class="description" flex>
        <HTMLEditorToolbar {editor} />
        <vbox flex class="editor-wrapper">
          <Scroll>
            <vbox flex class="editor">
              <HTMLEditor bind:html={event.descriptionHTML} bind:editor />
            </vbox>
          </Scroll>
        </vbox>
      </vbox>
    </vbox>
    <vbox flex class="right-pane">
      <hbox>{$t`When`}</hbox>
      <grid class="time">
        <label for="start-time">{$t`Day`}</label>
        <hbox>{event.startTime.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" })}</hbox>

        <label for="start-time">{$t`Start`}</label>
        <TimeInput time={event.startTime} />

        <label for="end-time">{$t`End`}</label>
        <TimeInput time={event.endTime} />

        <label for="duration">{$t`Duration`}</label>
        <hbox>
          <input class="duration" type="number" bind:value={durationInUnit} on:input={durationUnit.onChange} min={0} />
          <DurationUnit bind:durationInSeconds={event.duration} bind:durationInUnit bind:this={durationUnit} />
        </hbox>
      </grid>
      <Checkbox label={$t`All day`} bind:checked={event.allDay} />
      <Checkbox label={$t`Repeated`} bind:checked={event.repeat} />
      <Checkbox label={$t`Alarm`} checked={!!event.alarm} />
      <hbox class="spacer" />
      <hbox class="buttons">
        <hbox class="spacer" />
        <Button
          label={$t`Save`}
          icon={SaveIcon}
          iconSize="16px"
          disabled={!canSave}
          onClick={onSave}
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
  import HTMLEditorToolbar from "../../Shared/Editor/HTMLEditorToolbar.svelte";
  import HTMLEditor from "../../Shared/Editor/HTMLEditor.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import { Checkbox } from "@svelteuidev/core";
  import SaveIcon from "lucide-svelte/icons/check";
  import CloseIcon from "lucide-svelte/icons/x";
  import CopyIcon from "lucide-svelte/icons/copy";
  import BrowserIcon from "lucide-svelte/icons/globe";
  import type { Editor } from '@tiptap/core';
  import { t } from "svelte-i18n-lingui";

  export let event: Event;

  let durationUnit: DurationUnit;
  let durationInUnit: number;
  let editor: Editor;

  function onCopyMeetingURL() {
    new Clipboard().writeText(event.onlineMeetingURL);
  }

  function onOpenMeetingURL() {
    // event.onlineMeetingURL
  }

  $: canSave = event && event.title && event.startTime && event.endTime &&
      event.startTime.getTime() <= event.endTime.getTime();

  async function onSave() {
    if (!event.calendar.events.contains(event)) {
      event.calendar.events.add(event);
    }
    await event.save();
    onClose();
  }

  function onClose() {
    let me = calendarMustangApp.subApps.find(app => app instanceof EventEditMustangApp && app.mainWindowProperties.event == event);
    calendarMustangApp.subApps.remove(me);
  }
</script>

<style>
  .event-edit-window {
    padding: 20px 32px;
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
  .window-title-bar {
    margin-bottom: 8px;
    font-weight: bold;
  }
  .left-pane {
    flex: 2 0 0;
  }
  .right-pane {
    flex: 1 0 0;
    margin-left: 32px;
  }
  input {
    border-top: none;
    border-left: none;
    border-right: none;
    width: 100%;
  }
  .title input {
    font-size: 200%;
    padding: 6px 12px;
  }
  .participants {
    margin-top: 24px;
    margin-bottom: 16px;
  }
  grid.location {
    grid-template-columns: max-content 1fr max-content;
  }
  grid.location :global(.svelteui-Checkbox-root) {
    margin: 4px 12px 4px 0px;
  }
  grid.location .buttons {
    margin-left: 24px;
  }
  .availability {
    font-size: 12px;
  }
  .description {
    min-height: 10em;
    margin-top: 16px;
  }
  .editor-wrapper {
    border: 1px solid lightgray;
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .editor {
    font-family: unset;
    padding: 8px 12px;
  }
  grid.time {
    grid-template-columns: max-content 1fr;
    justify-content: center;
    align-items: center;
    margin-bottom: 12px;
  }
  grid.time label {
    margin-right: 8px;
  }
  .right-pane :global(.svelteui-Checkbox-root) {
    margin: 2px;
  }
  grid.time :global(input) {
    max-width: 5em;
    text-align: right;
  }
  .duration {
    margin-right: 6px;
  }
  grid :global(input) {
    padding: 4px 8px;
    margin-top: 2px;
  }
  .event-edit-window :global(.svelteui-Checkbox-label) {
    padding-left: 8px;
  }
</style>
