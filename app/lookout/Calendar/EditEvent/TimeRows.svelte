{#if showSummary && isSeriesMaster}
  <span class="row-label">{$t`Recurrence`}</span>
  <vbox class="recurrence-summary">
    <span>{summary}</span>
    {#if !readOnly}
      <button class="link-button" on:click={onRecurrence}>
        <RecurrenceIcon size={14} /> {$t`Edit Recurrence`}
      </button>
    {/if}
  </vbox>
{:else}
  <span class="row-label">{$t`Start time`}</span>
  <hbox class="time-row">
    <DateField date={$event.startTime} label={$t`Start date`} disabled={readOnly}
      onChange={day => editor.setStartDate(day)} />
    {#if !$event.allDay}
      <TimeCombo time={$event.startTime} options={startOptions} label={$t`Start time`} disabled={readOnly}
        onChange={time => editor.setStart(time)} />
    {/if}
    {#if !readOnly}
      <label class="check">
        <input type="checkbox" checked={$event.allDay} on:change={onAllDayChanged} />
        {$t`All day`}
      </label>
    {/if}
    {#if showTimezone}
      <hbox class="timezone lo-secondary" title={$t`Time zone of this event`}>
        <TimezoneIcon size={14} /> {$event.timezone}
      </hbox>
    {/if}
  </hbox>
  <span class="row-label">{$t`End time`}</span>
  <hbox class="time-row">
    <DateField date={lastDay} label={$t`End date`} disabled={readOnly}
      onChange={day => editor.setEndDate(day)} />
    {#if !$event.allDay}
      <TimeCombo time={$event.endTime} options={endOptions} label={$t`End time`} disabled={readOnly}
        onChange={time => editor.setEnd(time)} />
    {/if}
    {#if showRecurrenceLink && !readOnly}
      <button class="link-button" on:click={onRecurrence}>
        <RecurrenceIcon size={14} />
        {isRecurring ? $t`Edit Recurrence` : $t`Make Recurring`}
      </button>
    {/if}
  </hbox>
{/if}

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { RecurrencePattern } from "./RecurrencePattern";
  import { EventTimeEditor } from "./EventTimeEditor";
  import { TimeOptions } from "./TimeOptions";
  import TimeCombo from "./TimeCombo.svelte";
  import DateField from "./DateField.svelte";
  import { isSameTimezone } from "../../../frontend/Util/date";
  import RecurrenceIcon from "lucide-svelte/icons/repeat-2";
  import TimezoneIcon from "lucide-svelte/icons/globe";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
  export let editor: EventTimeEditor;
  export let pattern: RecurrencePattern = null;
  export let readOnly = false;
  export let showSummary = true;
  export let showRecurrenceLink = true;
  export let onRecurrence: () => void = () => {};

  $: parentEvent = $event.parentEvent;
  $: isSeriesMaster = !!$event.recurrenceRule && !$event.parentEvent;
  $: isRecurring = isSeriesMaster || !!$parentEvent?.recurrenceRule;
  $: summary = $event && pattern ? pattern.summary(event) : "";
  $: startOptions = TimeOptions.startTimes($event.startTime);
  $: lastDay = EventTimeEditor.lastDay($event);
  $: endOptions = TimeOptions.endTimes($event.startTime, $event.endTime);
  $: showTimezone = !$event.allDay && !isSameTimezone($event.timezone, $event.startTime);

  function onAllDayChanged(changeEvent: globalThis.Event) {
    let checked = (changeEvent.target as HTMLInputElement).checked;
    if (checked) {
      editor.setAllDay(true);
    } else {
      editor.setTimed();
    }
  }
</script>

<style>
  .row-label {
    color: var(--lo-fg-secondary);
    justify-self: end;
    white-space: nowrap;
  }
  .time-row {
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-inline-start: 12px;
    white-space: nowrap;
    cursor: pointer;
  }
  .check input {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--lo-accent);
  }
  .timezone {
    align-items: center;
    gap: 4px;
    margin-inline-start: 12px;
    font-size: var(--lo-font-size-small);
  }
  .link-button {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-inline-start: 6px;
    padding: 4px 6px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    cursor: pointer;
    white-space: nowrap;
  }
  .link-button:hover {
    background-color: var(--lo-hover-bg);
    text-decoration: underline;
  }
  .recurrence-summary {
    align-items: start;
    gap: 2px;
  }
  .recurrence-summary .link-button {
    margin-inline-start: -6px;
  }
</style>
