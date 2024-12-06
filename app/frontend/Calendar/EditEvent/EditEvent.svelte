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
        <DateInput date={event.startTime} on:change={updateDateUI} />

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
      <Checkbox label={$t`Repeated`} bind:checked={event.repeat} disabled={event.parentEvent}/>
      {#if event.repeat}
        <hbox>
          <label>{`Every`}</label>&nbsp;<input class="auto" type="number" min={1} max={99} bind:value={interval} />&nbsp;
          <select bind:value={frequency}>
            <option value="{Frequency.Daily}">{$plural(interval, { one: 'day', other: 'days' })}</option>
            <option value="{Frequency.Weekly}">{$plural(interval, { one: 'week', other: 'weeks' })}</option>
            <option value="{Frequency.Monthly}">{$plural(interval, { one: 'month', other: 'months' })}</option>
            <option value="{Frequency.Yearly}">{$plural(interval, { one: 'year', other: 'years' })}</option>
          </select>
        </hbox>
        {#if frequency == Frequency.Yearly }
          <RadioGroup bind:group={week} items={yearWeekOptions} />
        {:else if frequency == Frequency.Monthly }
          <RadioGroup bind:group={week} items={monthWeekOptions} />
        {:else if frequency == Frequency.Weekly }
          <CheckboxGroup size="sm" radius="xl" bind:group={weekdays} label={$t`On days`} items={weekdayOptions} />
        {/if}
        <hbox>
          <Radio label="{$t`Forever`}" bind:group={end} value="none" />
        </hbox>
        <hbox>
          <Radio class="inline" label="{$t`For `}" bind:group={end} value="count" />&nbsp;<input class="auto" type="number" min={1} max={99} bind:value={count} on:input={() => end = "count"}>&nbsp;{$plural(count, { one: 'time', other: 'times' })}
        </hbox>
        <hbox>
          <Radio class="inline" label="{$t`Until`}" bind:group={end} value="date" />&nbsp;<DateInput date={endDate} min={minDate} on:change={() => end = "date"} />
        </hbox>
      {/if}
      <Checkbox label={$t`Alarm`} checked={!!event.alarm} />
      <hbox class="spacer" />
      <hbox class="buttons">
        {#if event.response == ResponseType.Unknown || event.response == ResponseType.Organizer}
          <Button
            label={$t`Delete Event`}
            classes="delete"
            icon={DeleteIcon}
            iconSize="16px"
            disabled={!event.dbID && !event.parentEvent}
            onClick={onDelete}
            />
          <hbox class="spacer" />
          <Button
            label={$t`Save`}
            icon={SaveIcon}
            iconSize="16px"
            disabled={!canSave}
            onClick={onSave}
            />
        {:else}
          <Button label={$t`Accept`} onClick={onAccept} />
          <hbox class="spacer" />
          <Button label={$t`Decline`} onClick={onDecline} />
          <hbox class="spacer" />
          <Button label={$t`Tentative`} onClick={onTentative} />
        {/if}
      </hbox>
    </vbox>
  </hbox>
</vbox>

<script lang="ts">
  import { plural } from 'svelte-i18n-lingui';
  import type { Event } from "../../../logic/Calendar/Event";
  import { Frequency, RecurrenceRule, type RecurrenceInit } from "../../../logic/Calendar/RecurrenceRule";
  import { EventEditMustangApp, calendarMustangApp } from "../CalendarMustangApp";
  import { ResponseType, type Responses } from "../../../logic/Calendar/IMIP";
  import PersonsAutocomplete from "../../Shared/PersonAutocomplete/PersonsAutocomplete.svelte";
  import PersonAvailability from "./PersonAvailability.svelte";
  import DateInput from "./DateInput.svelte";
  import TimeInput from "./TimeInput.svelte";
  import DurationUnit from "./DurationUnit.svelte";
  import RadioGroup from "./RadioGroup.svelte";
  import CheckboxGroup from "./CheckboxGroup.svelte";
  import HTMLEditorToolbar from "../../Shared/Editor/HTMLEditorToolbar.svelte";
  import HTMLEditor from "../../Shared/Editor/HTMLEditor.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import { Checkbox, Radio } from "@svelteuidev/core";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SaveIcon from "lucide-svelte/icons/check";
  import CloseIcon from "lucide-svelte/icons/x";
  import CopyIcon from "lucide-svelte/icons/copy";
  import BrowserIcon from "lucide-svelte/icons/globe";
  import type { Editor } from '@tiptap/core';
  import { getUILocale, t } from "../../../l10n/l10n";

  export let event: Event;

  let durationUnit: DurationUnit;
  let durationInUnit: number;
  let editor: Editor;
  let frequency = event.recurrenceRule?.frequency || Frequency.Daily;
  let interval = event.recurrenceRule?.interval || 1;
  let count = Number.isFinite(event.recurrenceRule?.count) ? event.recurrenceRule.count : 1;
  let weekdays = event.recurrenceRule?.weekdays || [event.startTime.getDay()];
  let week = event.recurrenceRule?.week || 0;
  let end = event.recurrenceRule?.endDate ? "date" : Number.isFinite(event.recurrenceRule?.count) ? "count" : "none";
  let endDate = event.recurrenceRule?.endDate || event.startTime;
  let minDate = event.startTime;
  let yearWeekOptions, monthWeekOptions, weekdayOptions;

  updateDateUI();
  function updateDateUI() {
    yearWeekOptions = [{ label: $t`On ${event.startTime.toLocaleDateString(getUILocale(), { day: "numeric", month: "long" })}`, value: 0 }];
    monthWeekOptions = [{ label: $t`On day ${event.startTime.getDate()}`, value: 0 }];

    let weekday = event.startTime.toLocaleDateString(getUILocale(), { weekday: "long" });
    let weekno = Math.ceil(event.startTime.getDate() / 7);
    if (weekno < 5) {
      let weekname = [$t`first`, $t`second`, $t`third`, $t`fourth`][weekno - 1];
      yearWeekOptions.push({ label: `On the ${weekname} ${weekday} in ${event.startTime.toLocaleDateString(getUILocale(), { month: "long" })}`, value: weekno });
      monthWeekOptions.push({ label: `On the ${weekname} ${weekday}`, value: weekno });
    }

    if (isLastWeekOfMonth(event.startTime)) {
      yearWeekOptions.push({ label: $t`On the last ${weekday} in ${event.startTime.toLocaleDateString(getUILocale(), { month: "long" })}`, value: 5 });
      monthWeekOptions.push({ label: $t`On the last ${weekday}`, value: 5 });
    }

    if (week && (week < 5 || yearWeekOptions.length == 2)) {
      week = weekno;
    }

    weekdayOptions = [1, 2, 3, 4, 5, 6, 7].map(day => new Date(2010, 2, day)).map(date => ({
      value: date.getDay(),
      checked: date.getDay() == event.startTime.getDay() || weekdays.includes(date.getDay()),
      disabled: date.getDay() == event.startTime.getDay(),
      label: date.toLocaleDateString(getUILocale(), { weekday: "narrow" }),
    }));

    if (endDate <= event.startTime) {
      endDate = new Date(event.startTime);
      endDate.setHours(23, 59, 59, 0);
    }
    minDate = event.startTime;
    event.endTime.setFullYear(event.startTime.getFullYear(), event.startTime.getMonth(), event.startTime.getDate());
  }

  function isLastWeekOfMonth(date) {
    date = new Date(date);
    date.setDate(date.getDate() + 7);
    return date.getDate() < 8;
  }

  function onCopyMeetingURL() {
    new Clipboard().writeText(event.onlineMeetingURL);
  }

  function onOpenMeetingURL() {
    // event.onlineMeetingURL
  }

  $: canSave = event && event.title && event.startTime && event.endTime &&
      event.startTime.getTime() <= event.endTime.getTime();

  function newRecurrenceRule(): RecurrenceRule {
    let init: RecurrenceInit = { startDate: event.startTime, frequency, interval };
    switch (end) {
    case "count":
      init.count = count;
      break;
    case "date":
      init.endDate = endDate;
      break;
    }
    switch (frequency) {
    case Frequency.Weekly:
      if (weekdays.length > 1) {
        init.weekdays = weekdays;
      }
      break;
    case Frequency.Monthly:
    case Frequency.Yearly:
      init.week = week;
      if (week) {
        init.weekdays = [event.startTime.getDay()];
      }
      break;
    }
    return new RecurrenceRule(init);
  }

  function confirmAndChangeRule(): boolean {
    if (!event.repeat) {
      if (!event.recurrenceRule) {
        // Never a recurring event.
        return true;
      }
      if (!confirm($t`Are you sure you want to remove this unfortunate series of events?`)) {
        return false;
      }
      event.recurrenceRule = null;
    } else {
      let rule = newRecurrenceRule();
      if (event.recurrenceRule) {
        if (event.startTime.getTime() == event.recurrenceRule.startDate.getTime() &&
            rule.getCalString() == event.recurrenceRule.getCalString()) {
          // Rule hasn't actually changed.
          return true;
        }
        if (!confirm($t`This change will reset all of your series to default values.`)) {
          return false;
        }
      }
      event.recurrenceRule = rule;
    }
    event.clearExceptions();
    return true;
  }

  async function onSave() {
    if (!confirmAndChangeRule()) {
      return;
    }
    await event.saveToServer();
    await event.save();
    if (!event.calendar.events.contains(event)) {
      event.calendar.events.add(event);
    }
    if (event.recurrenceRule) {
      event.fillRecurrences(new Date(Date.now() + 1e11));
    }
    onClose();
  }

  async function onDelete() {
    if (event.recurrenceRule) {
      if (!confirm($t`Are you sure you want to remove this unfortunate series of events?`)) {
        return;
      }
    }
    await event.deleteFromServer();
    await event.deleteIt();
    onClose();
  }

  function respond(response: Responses) {
    event.respondToInvitation(response).catch(backgroundError);
  }
  function onAccept() {
    respond(ResponseType.Accept);
  }
  function onTentative() {
    respond(ResponseType.Tentative);
  }
  function onDecline() {
    respond(ResponseType.Decline);
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
    margin-block-end: 8px;
    font-weight: bold;
  }
  .left-pane {
    flex: 2 0 0;
    width: 0px;
  }
  .right-pane {
    flex: 1 0 0;
    margin-inline-start: 32px;
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
    margin-block-start: 24px;
    margin-block-end: 16px;
  }
  grid.location {
    grid-template-columns: max-content 1fr max-content;
  }
  grid.location :global(.svelteui-Checkbox-root) {
    margin: 4px 12px 4px 0px;
  }
  grid.location .buttons {
    margin-inline-start: 24px;
  }
  .availability {
    font-size: 12px;
  }
  .description {
    min-height: 10em;
    margin-block-start: 16px;
  }
  .editor-wrapper {
    border: 1px solid lightgray;
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .editor {
    font-family: unset;
    padding: 8px 12px;
    min-width: fit-content;
  }
  grid.time {
    grid-template-columns: max-content max-content;
    justify-items: start;
    align-items: center;
    margin-block-end: 12px;
  }
  grid.time label {
    margin-inline-end: 8px;
  }
  .right-pane :global(.svelteui-Checkbox-root) {
    margin: 2px;
  }
  grid.time :global(input:not([type="date"])) {
    max-width: 5em;
    text-align: right;
  }
  .duration {
    margin-inline-end: 6px;
  }
  grid :global(input) {
    padding: 4px 8px;
    margin-block-start: 2px;
  }
  .event-edit-window :global(.svelteui-Checkbox-label) {
    padding-inline-start: 8px;
  }
  .buttons :global(button.delete) {
    background-color: lightsalmon;
    color: black;
  }
  input.auto {
    width: auto;
  }
  :global(.inline) {
    display: inline-flex !important;
  }
</style>
