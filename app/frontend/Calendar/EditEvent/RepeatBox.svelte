<SectionTitle label={$t`Repeat`}>
  <hbox>
    <select bind:value={frequency} class="selector" on:change={onFrequencyChanged}>
      <option value="{Frequency.None}">{$t`none`}</option>
      <option value="{Frequency.Daily}">{$t`daily`}</option>
      <option value="{Frequency.Weekly}">{$t`weekly`}</option>
      <option value="{Frequency.Monthly}">{$t`monthly`}</option>
      <option value="{Frequency.Yearly}">{$t`yearly`}</option>
    </select>
  </hbox>
</SectionTitle>

{#if frequency != Frequency.None }
  <vbox class="frequency">
    {#if frequency == Frequency.Daily }
      <RadioGroup bind:group={daily} items={dailyOptions} vertical={true}
        on:change={onDailyOptionChanged}
        disabled={$event.startTime.getDay() == 0 || $event.startTime.getDay() == 6}
        />
    {:else if frequency == Frequency.Weekly }
      <hbox class="weekdays">
        <hbox class="label">{$t`On days`}</hbox>
        {#each weekdayOptions as weekday}
          <RoundButton
            label={weekday.label}
            selected={weekdays.includes(weekday.value)}
            onClick={() => onWeekdayChanged(weekday.value)}
            disabled={weekday.disabled}
            border={false}
            classes="plain weekday"
            >
            <hbox class="weekday-content" slot="icon">{weekday.label}</hbox>
          </RoundButton>
        {/each}
      </hbox>
    {:else if frequency == Frequency.Monthly }
      <RadioGroup bind:group={week} items={monthWeekOptions} vertical={true} />
    {:else if frequency == Frequency.Yearly }
      <RadioGroup bind:group={week} items={yearWeekOptions} vertical={true} />
    {/if}
  </vbox>

  <hbox class="every">
    <label for="every">{$t`Every`}</label>
    <input class="auto" type="number" min={1} max={99} bind:value={interval} id="every" />
    <select bind:value={frequency} class="selector">
      <option value="{Frequency.Daily}">{$plural(interval, { one: 'day', other: 'days' })}</option>
      <option value="{Frequency.Weekly}">{$plural(interval, { one: 'week', other: 'weeks' })}</option>
      <option value="{Frequency.Monthly}">{$plural(interval, { one: 'month', other: 'months' })}</option>
      <option value="{Frequency.Yearly}">{$plural(interval, { one: 'year', other: 'years' })}</option>
    </select>
  </hbox>
{/if}

<!-- end
<hbox>
  <Radio label="{$t`Forever`}" bind:group={end} value="none" />
</hbox>
<hbox>
  <Radio class="inline" label="{$t`For `}" bind:group={end} value="count" />
  <input class="auto" type="number" min={1} max={99} bind:value={count} on:input={() => end = "count"}>
  {$plural(count, { one: 'time', other: 'times' })}
</hbox>
<hbox>
  <Radio class="inline" label="{$t`Until`}" bind:group={end} value="date" />
  <DateInput date={endDate} min={minDate} on:change={() => end = "date"} />
</hbox>
  // import DateInput from "./DateInput.svelte";
  // import { Radio } from "@svelteuidev/core";
-->

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { Frequency, RecurrenceRule, type RecurrenceInit } from "../../../logic/Calendar/RecurrenceRule";
  import SectionTitle from './SectionTitle.svelte';
  import RadioGroup, { type RadioOption } from "./RadioGroup.svelte";
  import { getUILocale, t, plural } from "../../../l10n/l10n";
  import RoundButton from '../../Shared/RoundButton.svelte';
  import { arrayRemove } from '../../../logic/util/util';

  export let event: Event;

  let frequency = event.recurrenceRule?.frequency || Frequency.Daily;
  let interval = event.recurrenceRule?.interval || 1;
  let count = Number.isFinite(event.recurrenceRule?.count) ? event.recurrenceRule.count : 1;
  let weekdays = event.recurrenceRule?.weekdays || [event.startTime.getDay()];
  let week = event.recurrenceRule?.week || 0;
  let end = event.recurrenceRule?.endDate ? "date" : Number.isFinite(event.recurrenceRule?.count) ? "count" : "none";
  let endDate = event.recurrenceRule?.endDate || event.startTime;
  let minDate = event.startTime;
  let daily = "everyday";
  let dailyOptions: RadioOption[] = [
    { label: $t`Every day`, value: "everyday" },
    { label: $t`Monday to Friday`, value: "weekday" },
  ];
  let weekdayOptions: RadioOption[];
  let monthWeekOptions: RadioOption[];
  let yearWeekOptions: RadioOption[];

  $: $event.startTime, updateDateUI();
  function updateDateUI() {
    yearWeekOptions = [{ label: $t`On ${event.startTime.toLocaleDateString(getUILocale(), { day: "numeric", month: "long" })}`, value: 0 }];
    monthWeekOptions = [{ label: $t`On ${event.startTime.toLocaleDateString(getUILocale(), { day: "numeric" })}. of every month`, value: 0 }];

    let weekday = event.startTime.toLocaleDateString(getUILocale(), { weekday: "long" });
    let weekno = Math.ceil(event.startTime.getDate() / 7);
    if (weekno < 5) {
      let weekname = [$t`first`, $t`second`, $t`third`, $t`fourth`][weekno - 1];
      yearWeekOptions.push({ label: $t`On the ${weekname} ${weekday} in ${event.startTime.toLocaleDateString(getUILocale(), { month: "long" })}`, value: weekno });
      monthWeekOptions.push({ label: $t`On the ${weekname} ${weekday}`, value: weekno });
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
      disabled: date.getDay() == event.startTime.getDay(),
      label: date.toLocaleDateString(getUILocale(), { weekday: "narrow" }),
    }));

    if (endDate <= event.startTime) {
      endDate = new Date(event.startTime);
      endDate.setHours(23, 59, 59, 0);
    }
    minDate = event.startTime;
    event.endTime.setFullYear(event.startTime.getFullYear(), event.startTime.getMonth(), event.startTime.getDate());
    event.notifyObservers();
  }

  function isLastWeekOfMonth(date: Date) {
    date = new Date(date);
    date.setDate(date.getDate() + 7);
    return date.getDate() < 8;
  }

  function onDailyOptionChanged() {
    if (daily == "everyday") {
      return;
    }
    weekdays = [1, 2, 3, 4, 5];
    interval = 1;
    frequency = Frequency.Weekly;
    daily = "everyday";
  }

  function onWeekdayChanged(weekday: number) {
    console.log("weekdays changed", weekday, weekdays);
    if (weekdays.includes(weekday)) {
      arrayRemove(weekdays, weekday);
    } else {
      weekdays.push(weekday);
    }
    weekdayOptions = weekdayOptions; // force UI update
  }

  function onFrequencyChanged() {
    if (frequency == Frequency.None) {
      event.repeat = false;
      event.recurrenceRule = null;
    }
  }

  function newRecurrenceRule(): RecurrenceRule {
    let init: RecurrenceInit = { startDate: event.startTime, frequency, interval };
    if (end == "count") {
      init.count = count;
    } else if (end == "date") {
      init.endDate = endDate;
    }
    if (frequency == Frequency.Weekly) {
      if (weekdays.length > 1) {
        init.weekdays = weekdays;
      }
    } else if (frequency == Frequency.Monthly || frequency == Frequency.Yearly) {
      init.week = week;
      if (week) {
        init.weekdays = [event.startTime.getDay()];
      }
    }
    return new RecurrenceRule(init);
  }

  // TODO Call from save()
  export function confirmAndChangeRule(): boolean {
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
</script>

<style>
  .frequency {
    margin-block-start: 14px;
    margin-block-end: 14px;
  }
  label {
    margin-inline-end: 8px;
  }
  input {
    width: 100%;
    margin-inline-end: 8px;
  }
  input[type=number] {
    text-align: right;
  }
  input.auto {
    width: auto;
  }
  .weekdays .label {
    margin-inline-end: 12px;
  }
  .weekdays :global(.weekday) {
    width: 24px;
    height: 24px;
    background-color: var(--headerbar-bg);
    color: var(--headerbar-fg);
    margin-inline-end: 4px;
  }
  .weekdays :global(.weekday.selected:not(:hover)) {
    background-color: var(--selected-bg);
    color: var(--selected-fg);
  }
  .weekdays :global(.weekday.disabled) {
    opacity: inherit;
  }
  :global(.inline) {
    display: inline-flex !important;
  }
</style>
