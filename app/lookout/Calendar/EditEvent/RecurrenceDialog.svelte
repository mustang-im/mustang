<Dialog title={isMeeting ? $t`Meeting Recurrence` : $t`Appointment Recurrence`}
  okLabel={$t`OK`} okDisabled={okDisabled} onOK={onOK} width="600px" on:close={onClose}>
  <fieldset>
    <legend>{$t`Appointment time`}</legend>
    <grid class="appointment-time">
      <span class="label">{$t`Start`}</span>
      <TimeCombo time={startTime} options={startOptions} label={$t`Start`} disabled={allDay}
        onChange={time => setStartTime(time)} />
      <span class="label">{$t`End`}</span>
      <TimeCombo time={endTime} options={endOptions} label={$t`End`} disabled={allDay}
        onChange={time => setEndTime(time)} />
      <span class="label">{$t`Duration`}</span>
      <select value={durationMinutes} on:change={onDurationChanged} aria-label={$t`Duration`}>
        {#each durationChoices as minutes}
          <option value={minutes}>{TimeOptions.durationLabel(minutes)}</option>
        {/each}
      </select>
    </grid>
  </fieldset>

  <fieldset>
    <legend>{$t`Recurrence pattern`}</legend>
    <hbox class="pattern">
      <vbox class="frequencies">
        {#each frequencies as choice}
          <label class="radio">
            <input type="radio" name="frequency" value={choice.value} bind:group={pattern.frequency} />
            {choice.label}
          </label>
        {/each}
      </vbox>
      <vbox class="options">
        {#if pattern.frequency == Frequency.Daily}
          <label class="radio">
            <input type="radio" name="daily" value="interval" bind:group={pattern.dailyMode} />
            {$t`Every`}
            <input type="number" class="number" min="1" max="999" bind:value={pattern.interval}
              on:focus={() => pattern.dailyMode = "interval"} aria-label={$t`Interval`} />
            {$plural(pattern.interval, { one: "day", other: "days" })}
          </label>
          <label class="radio" title={canRepeatOnWeekdays ? null : $t`The series starts on a weekend`}>
            <input type="radio" name="daily" value="weekdays" bind:group={pattern.dailyMode}
              disabled={!canRepeatOnWeekdays} />
            {$t`Every weekday`}
          </label>
        {:else if pattern.frequency == Frequency.Weekly}
          <hbox class="line">
            {$t`Recur every`}
            <input type="number" class="number" min="1" max="999" bind:value={pattern.interval} aria-label={$t`Interval`} />
            {$plural(pattern.interval, { one: "week", other: "weeks" })} {$t`on:`}
          </hbox>
          <grid class="weekdays">
            {#each kAllWeekdays as weekday}
              <label class="check" title={weekday == startWeekday ? $t`The day of the start date` : null}>
                <input type="checkbox"
                  checked={weekday == startWeekday || pattern.weekdays.includes(weekday)}
                  disabled={weekday == startWeekday}
                  on:change={() => toggleWeekday(weekday)} />
                {weekdayLabel(weekday, "long")}
              </label>
            {/each}
          </grid>
        {:else if pattern.frequency == Frequency.Monthly}
          <label class="radio">
            <input type="radio" name="monthly" value="day" bind:group={pattern.monthlyMode} />
            {$t`Day ${rangeStart.getDate()} of every *=> as in: Day 15 of every 2 months`}
            <input type="number" class="number" min="1" max="99" bind:value={pattern.interval}
              on:focus={() => pattern.monthlyMode = "day"} aria-label={$t`Interval`} />
            {$plural(pattern.interval, { one: "month", other: "months" })}
          </label>
          <label class="radio">
            <input type="radio" name="monthly" value={weekMode} checked={pattern.monthlyMode != "day"}
              on:change={() => pattern.monthlyMode = weekMode} />
            {$t`The *=> as in: The third Thursday of every 2 months`}
            <select value={weekMode} on:change={onWeekModeChanged} aria-label={$t`Week of the month`}>
              {#each weekChoices as choice}
                <option value={choice.mode}>{choice.label}</option>
              {/each}
            </select>
            {weekdayName}
            {$t`of every *=> as in: The third Thursday of every 2 months`}
            <input type="number" class="number" min="1" max="99" bind:value={pattern.interval} aria-label={$t`Interval`} />
            {$plural(pattern.interval, { one: "month", other: "months" })}
          </label>
        {:else if pattern.frequency == Frequency.Yearly}
          <hbox class="line">
            {$t`Recur every`}
            <input type="number" class="number" min="1" max="99" bind:value={pattern.interval} aria-label={$t`Interval`} />
            {$plural(pattern.interval, { one: "year", other: "years" })}
          </hbox>
          <label class="radio">
            <input type="radio" name="yearly" value="day" bind:group={pattern.monthlyMode} />
            {$t`On ${dayOfYear} *=> as in: On October 15`}
          </label>
          <label class="radio">
            <input type="radio" name="yearly" value={weekMode} checked={pattern.monthlyMode != "day"}
              on:change={() => pattern.monthlyMode = weekMode} />
            {$t`On the *=> as in: On the third Thursday of October`}
            <select value={weekMode} on:change={onWeekModeChanged} aria-label={$t`Week of the month`}>
              {#each weekChoices as choice}
                <option value={choice.mode}>{choice.label}</option>
              {/each}
            </select>
            {$t`${weekdayName} of ${monthName} *=> as in: (On the third) Thursday of October`}
          </label>
        {/if}
      </vbox>
    </hbox>
  </fieldset>

  <fieldset>
    <legend>{$t`Range of recurrence`}</legend>
    <hbox class="range">
      <hbox class="range-start">
        <span class="label">{$t`Start`}</span>
        <DateField date={rangeStart} label={$t`Start of the series`} onChange={day => setRangeStart(day)} />
      </hbox>
      <vbox class="range-end">
        <label class="radio">
          <input type="radio" name="end" value="date" bind:group={pattern.end} />
          <span class="end-label">{$t`End by:`}</span>
          <DateField date={pattern.endDate} label={$t`End of the series`}
            onChange={day => { pattern.endDate = day; pattern.end = "date"; }} />
        </label>
        <label class="radio">
          <input type="radio" name="end" value="count" bind:group={pattern.end} />
          <span class="end-label">{$t`End after:`}</span>
          <input type="number" class="number" min="1" max="999" bind:value={pattern.count}
            on:focus={() => pattern.end = "count"} aria-label={$t`Number of occurrences`} />
          {$plural(pattern.count, { one: "occurrence", other: "occurrences" })}
        </label>
        <label class="radio">
          <input type="radio" name="end" value="none" bind:group={pattern.end} />
          {$t`No end date`}
        </label>
      </vbox>
    </hbox>
  </fieldset>

  <svelte:fragment slot="buttons-start">
    <DialogButton label={$t`Remove Recurrence`} disabled={!hasRecurrence} onClick={onRemove} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { EventEditFlow } from "./EventEditFlow";
  import type { EventTimeEditor } from "./EventTimeEditor";
  import { RecurrencePattern, type MonthlyMode } from "./RecurrencePattern";
  import { TimeOptions } from "./TimeOptions";
  import { Frequency } from "../../../logic/Calendar/RecurrenceRule";
  import Dialog from "../../Mail/Dialogs/Dialog.svelte";
  import DialogButton from "./DialogButton.svelte";
  import TimeCombo from "./TimeCombo.svelte";
  import DateField from "./DateField.svelte";
  import { kAllWeekdays, weekdayLabel } from "../../../frontend/Util/date";
  import { getDateTimeLocale, gt, plural, t } from "../../../l10n/l10n";

  export let event: Event;
  export let flow: EventEditFlow;
  export let timeEditor: EventTimeEditor;
  export let onClose: () => void;

  const isMeeting = event.participants.hasItems;
  const allDay = event.allDay;
  const hasRecurrence = !!flow.master.recurrenceRule;
  let pattern = flow.pattern.clone();
  let rangeStart = new Date(event.startTime);
  let startTime = new Date(event.startTime);
  let durationMinutes = Math.round(event.duration / 60);

  const frequencies = [
    { value: Frequency.Daily, label: gt`Daily` },
    { value: Frequency.Weekly, label: gt`Weekly` },
    { value: Frequency.Monthly, label: gt`Monthly` },
    { value: Frequency.Yearly, label: gt`Yearly` },
  ];

  $: endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  $: startOptions = TimeOptions.startTimes(startTime);
  $: endOptions = TimeOptions.endTimes(startTime, endTime);
  $: durationChoices = durationList(durationMinutes, allDay);
  $: startWeekday = rangeStart.getDay();
  $: canRepeatOnWeekdays = RecurrencePattern.canRepeatOnWeekdays(rangeStart);
  $: weekChoices = RecurrencePattern.weekChoices(rangeStart);
  $: weekMode = weekChoices.find(choice => choice.mode == pattern.monthlyMode)?.mode ?? weekChoices[0].mode;
  $: weekdayName = rangeStart.toLocaleDateString(getDateTimeLocale(), { weekday: "long" });
  $: monthName = rangeStart.toLocaleDateString(getDateTimeLocale(), { month: "long" });
  $: dayOfYear = rangeStart.toLocaleDateString(getDateTimeLocale(), { month: "long", day: "numeric" });
  $: okDisabled = invalidReason(pattern, rangeStart);

  function durationList(current: number, allDay: boolean): number[] {
    const kTimed = [0, 5, 10, 15, 30, 60, 90, 120, 150, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 1080, 1440, 2880, 4320, 5760, 10080, 20160];
    const kAllDay = [1440, 2880, 4320, 5760, 7200, 8640, 10080, 20160];
    let list = allDay ? kAllDay : kTimed;
    return list.includes(current) ? list : [...list, current].sort((a, b) => a - b);
  }

  function invalidReason(pattern: RecurrencePattern, rangeStart: Date): string | false {
    if (!(pattern.interval >= 1)) {
      return gt`Please enter a number of 1 or more`;
    }
    if (pattern.end == "count" && !(pattern.count >= 1)) {
      return gt`Please enter a number of 1 or more`;
    }
    let firstDay = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    if (pattern.end == "date" && pattern.endDate < firstDay) {
      return gt`The end date is before the start date`;
    }
    return false;
  }

  function setStartTime(time: Date) {
    startTime = time;
  }

  function setEndTime(time: Date) {
    let minutes = Math.round((time.getTime() - startTime.getTime()) / 60000);
    if (minutes < 0) {
      minutes += 24 * 60;
    }
    durationMinutes = minutes;
  }

  function onDurationChanged(changeEvent: globalThis.Event) {
    durationMinutes = Number((changeEvent.target as HTMLSelectElement).value);
  }

  function setRangeStart(day: Date) {
    rangeStart = day;
    startTime.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    startTime = startTime;
  }

  function toggleWeekday(weekday: number) {
    if (pattern.weekdays.includes(weekday)) {
      pattern.weekdays = pattern.weekdays.filter(day => day != weekday);
    } else {
      pattern.weekdays = [...pattern.weekdays, weekday];
    }
  }

  function onWeekModeChanged(changeEvent: globalThis.Event) {
    pattern.monthlyMode = (changeEvent.target as HTMLSelectElement).value as MonthlyMode;
  }

  function onOK() {
    if (pattern.monthlyMode != "day") {
      pattern.monthlyMode = weekMode;
    }
    if (!allDay) {
      let start = new Date(rangeStart);
      start.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
      timeEditor.setStart(start);
      timeEditor.setEnd(new Date(start.getTime() + durationMinutes * 60000));
    } else {
      timeEditor.setStartDate(rangeStart);
      event.durationDays = Math.max(1, Math.round(durationMinutes / 1440));
    }
    flow.applyPattern(pattern);
  }

  function onRemove() {
    flow.removeRecurrence();
    onClose();
  }
</script>

<style>
  fieldset {
    margin: 0 0 12px 0;
    padding: 8px 12px 12px 12px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
  }
  legend {
    padding: 0 4px;
    font-weight: 600;
  }
  .label {
    color: var(--lo-fg-secondary);
  }
  .appointment-time {
    grid-template-columns: max-content max-content;
    align-items: center;
    column-gap: 12px;
    row-gap: 6px;
  }
  select {
    height: 32px;
    padding: 0 6px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
  }
  .appointment-time select {
    width: 132px;
  }
  .pattern {
    gap: 16px;
    min-height: 120px;
  }
  .frequencies {
    gap: 8px;
    padding-inline-end: 16px;
    border-inline-end: 1px solid var(--lo-divider);
  }
  .options {
    flex: 1 1 0;
    gap: 10px;
  }
  .radio, .check, .line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    min-height: 32px;
  }
  .radio > input[type=radio], .check > input[type=checkbox] {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--lo-accent);
  }
  .number {
    width: 56px;
    height: 30px;
    padding: 0 6px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
    text-align: end;
  }
  .weekdays {
    grid-template-columns: repeat(4, max-content);
    column-gap: 16px;
    row-gap: 2px;
  }
  .range {
    gap: 24px;
    align-items: start;
  }
  .range-start {
    align-items: center;
    gap: 8px;
  }
  .range-end {
    gap: 4px;
  }
  .end-label {
    min-width: 72px;
  }
</style>
