<SectionTitle label={$t`Repeat`}>
  <hbox>
    <select bind:value={frequency} class="selector">
      <option value="{Frequency.Daily}">{$t`daily`}</option>
      <option value="{Frequency.Weekly}">{$t`weekly`}</option>
      <option value="{Frequency.Monthly}">{$t`monthly`}</option>
      <option value="{Frequency.Yearly}">{$t`yearly`}</option>
    </select>
  </hbox>
</SectionTitle>
<hbox class="every">
  <label for="every">{$t`Every`}</label>
  <input class="auto" type="number" min={1} max={99} bind:value={interval} name="every" />
  <select bind:value={frequency} class="selector">
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
  import { plural } from 'svelte-i18n-lingui';
  import type { Event } from "../../../logic/Calendar/Event";
  import { Frequency, RecurrenceRule, type RecurrenceInit } from "../../../logic/Calendar/RecurrenceRule";
  import SectionTitle from './SectionTitle.svelte';
  import RadioGroup from "./RadioGroup.svelte";
  import CheckboxGroup from "./CheckboxGroup.svelte";
  import { getUILocale, t } from "../../../l10n/l10n";

  export let event: Event;

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
  .every {
    margin-block-start: 8px;
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
  :global(.inline) {
    display: inline-flex !important;
  }
</style>
