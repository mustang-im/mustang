<vbox flex>
  <hbox class="title selectable">
    {event.title}
  </hbox>
  <vbox class="participants">
    <PersonsAutocomplete persons={event.participants} disabled>
    <hbox slot="person-popup-buttons" let:person>
      <ParticipantConfirmText participant={person} />
    </hbox>
      <hbox slot="result-bottom-row" let:person>
        <PersonAvailability {person} />
      </hbox>
    </PersonsAutocomplete>
  </vbox>
  <grid class="location">
    <Checkbox checked={event.isOnline} label={$t`Online`} disabled />
    <input type="url" value={event.onlineMeetingURL} disabled />
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
    <Checkbox checked={!!event.location} label={$t`In Presence`} disabled />
    <input type="url" value={event.location} disabled />
  </grid>
  <hbox>{$t`When`}</hbox>
  <grid class="time">
    <label for="start-time">{$t`Day`}</label>
    <DateInput date={event.startTime} disabled />

    <label for="start-time">{$t`Start`}</label>
    <TimeInput time={event.startTime} disabled />

    <label for="end-time">{$t`End`}</label>
    <TimeInput time={event.endTime} disabled />

    <label for="duration">{$t`Duration`}</label>
    <hbox>
      <input class="duration" type="number" value={durationInUnit} disabled />
      <DurationUnit durationInSeconds={event.duration} bind:durationInUnit bind:this={durationUnit} disabled />
    </hbox>
  </grid>
  <Checkbox label={$t`All day`} checked={event.allDay} disabled />
  <Checkbox label={$t`Repeated`} checked={event.recurrenceCase != RecurrenceCase.Normal} disabled />
  {#if event.recurrenceCase != RecurrenceCase.Normal}
    <hbox>
      <hbox>{$t`Every *=> Every 2 weeks`}</hbox>
      &nbsp;
      {#if interval > 1}
        <hbox class="value">{interval}</hbox>
        &nbsp;
      {/if}
      <select value={frequency} disabled>
        <option value={Frequency.Daily}>{$plural(interval, { one: 'day', other: 'days' })}</option>
        <option value={Frequency.Weekly}>{$plural(interval, { one: 'week', other: 'weeks' })}</option>
        <option value={Frequency.Monthly}>{$plural(interval, { one: 'month', other: 'months' })}</option>
        <option value={Frequency.Yearly}>{$plural(interval, { one: 'year', other: 'years' })}</option>
      </select>
    </hbox>
    {#if frequency == Frequency.Yearly }
      <RadioGroup value={week} items={yearWeekOptions} disabled />
    {:else if frequency == Frequency.Monthly }
      <RadioGroup value={week} items={monthWeekOptions} disabled />
    {:else if frequency == Frequency.Weekly }
      <CheckboxGroup size="sm" radius="xl" group={weekdays} label={$t`On days`} items={weekdayOptions} disabled />
    {/if}
    <hbox>
      <Radio label="{$t`Forever`}" group={end} value="none" disabled />
    </hbox>
    <hbox>
      <Radio class="inline" label="{$t`For `}" group={end} value="count" disabled />&nbsp;<input class="auto" type="number" min={1} max={99} value={count} disabled> end = "count"}>&nbsp;{$plural(count, { one: 'time', other: 'times' })}
    </hbox>
    <hbox>
      <Radio class="inline" label="{$t`Until`}" group={end} value="date" disabled />&nbsp;<DateInput date={seriesEndTime} disabled />
    </hbox>
  {/if}
  <Checkbox label={$t`Alarm`} checked={!!event.alarm} disabled />
</vbox>

<script lang="ts">
  import { RecurrenceCase, type Event } from "../../../logic/Calendar/Event";
  import { Frequency } from "../../../logic/Calendar/RecurrenceRule";
  import { openExternalURL } from "../../../logic/util/os-integration";
  import PersonsAutocomplete from "../../Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import PersonAvailability from "../EditEvent/PersonAvailability.svelte";
  import ParticipantConfirmText from "../EditEvent/ParticipantConfirmText.svelte";
  import DateInput from "../EditEvent/DateInput.svelte";
  import TimeInput from "../EditEvent/TimeInput.svelte";
  import DurationUnit from "../EditEvent/DurationUnit.svelte";
  import RadioGroup from "../EditEvent/RadioGroup.svelte";
  import CheckboxGroup from "../EditEvent/CheckboxGroup.svelte";
  import Button from "../../Shared/Button.svelte";
  import { Checkbox, Radio } from "@svelteuidev/core";
  import CopyIcon from "lucide-svelte/icons/copy";
  import BrowserIcon from "lucide-svelte/icons/globe";
  import { getDateTimeFormatPref, t, plural } from "../../../l10n/l10n";

  export let event: Event;

  $: frequency = event.recurrenceRule?.frequency || Frequency.Daily;
  $: interval = event.recurrenceRule?.interval || 1;
  $: count = Number.isFinite(event.recurrenceRule?.count) ? event.recurrenceRule.count : 1;
  $: weekdays = event.recurrenceRule?.weekdays || [event.startTime.getDay()];
  $: week = event.recurrenceRule?.week || 0;
  $: end = event.recurrenceRule?.seriesEndTime ? "date" : Number.isFinite(event.recurrenceRule?.count) ? "count" : "none";
  $: seriesEndTime = event.recurrenceRule?.seriesEndTime || event.startTime;
  $: minDate = event.startTime;
  let durationUnit: DurationUnit;
  let durationInUnit: number;
  let yearWeekOptions;
  let monthWeekOptions;
  let weekdayOptions;

  updateDateUI();
  function updateDateUI() {
    yearWeekOptions = [{ label: $t`On ${event.startTime.toLocaleDateString(getDateTimeFormatPref(), { day: "numeric", month: "long" })}`, value: 0 }];
    monthWeekOptions = [{ label: $t`On day ${event.startTime.getDate()}`, value: 0 }];

    let weekday = event.startTime.toLocaleDateString(getDateTimeFormatPref(), { weekday: "long" });
    let weekno = Math.ceil(event.startTime.getDate() / 7);
    if (weekno < 5) {
      let weekname = [$t`first`, $t`second`, $t`third`, $t`fourth`][weekno - 1];
      yearWeekOptions.push({ label: `On the ${weekname} ${weekday} in ${event.startTime.toLocaleDateString(getDateTimeFormatPref(), { month: "long" })}`, value: weekno });
      monthWeekOptions.push({ label: `On the ${weekname} ${weekday}`, value: weekno });
    }

    if (isLastWeekOfMonth(event.startTime)) {
      yearWeekOptions.push({ label: $t`On the last ${weekday} in ${event.startTime.toLocaleDateString(getDateTimeFormatPref(), { month: "long" })}`, value: 5 });
      monthWeekOptions.push({ label: $t`On the last ${weekday}`, value: 5 });
    }

    if (week && (week < 5 || yearWeekOptions.length == 2)) {
      week = weekno;
    }

    weekdayOptions = [1, 2, 3, 4, 5, 6, 7].map(day => new Date(2010, 2, day)).map(date => ({
      value: date.getDay(),
      checked: date.getDay() == event.startTime.getDay() || weekdays.includes(date.getDay()),
      disabled: date.getDay() == event.startTime.getDay(),
      label: date.toLocaleDateString(getDateTimeFormatPref(), { weekday: "narrow" }),
    }));

    if (seriesEndTime <= event.startTime) {
      seriesEndTime = new Date(event.startTime);
      seriesEndTime.setHours(23, 59, 59, 0);
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
    navigator.clipboard.writeText(event.onlineMeetingURL);
  }

  function onOpenMeetingURL() {
    openExternalURL(event.onlineMeetingURL);
  }
</script>

<style>
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
