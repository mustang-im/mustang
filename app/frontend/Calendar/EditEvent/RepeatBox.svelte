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
        <hbox class="options">
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
  <DateInput date={seriesEndTime} min={minDate} on:change={() => end = "date"} />
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
  export let showRepeat: boolean;

  $: master = $event.parentEvent || event;
  $: frequency = $master.recurrenceRule?.frequency || Frequency.Weekly;
  $: interval = $master.recurrenceRule?.interval || 1;
  // end // let count = Number.isFinite(event.recurrenceRule?.count) ? event.recurrenceRule.count : 1;
  $: weekdays = $master.recurrenceRule?.weekdays?.slice() || [$event.startTime.getDay()];
  $: week = $master.recurrenceRule?.week || 0;
  // end // let end = event.recurrenceRule?.seriesEndTime ? "date" : Number.isFinite(event.recurrenceRule?.count) ? "count" : "none";
  // end // let seriesEndTime = master.recurrenceRule?.seriesEndTime || event.startTime;
  $: minDate = $event.startTime;
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

    if (!weekdays.includes(event.startTime.getDay())) {
      if (weekdays.length == 1) {
        weekdays[0] = event.startTime.getDay();
      } else {
        weekdays.push(event.startTime.getDay());
      }
    }
    weekdayOptions = [1, 2, 3, 4, 5, 6, 7].map(day => new Date(2010, 2, day)).map(date => ({
      value: date.getDay(),
      disabled: date.getDay() == event.startTime.getDay(),
      label: date.toLocaleDateString(getUILocale(), { weekday: "narrow" }),
    }));

    /* end
    if (seriesEndTime <= event.startTime) {
      seriesEndTime = new Date(event.startTime);
      seriesEndTime.setHours(23, 59, 59, 0);
    }
    */
    minDate = event.startTime;
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
      showRepeat = false;
    }
  }

  export function newRecurrenceRule(): RecurrenceRule {
    let init: RecurrenceInit = { masterDuration: event.duration, seriesStartTime: event.startTime, frequency, interval };
    /* end
    if (end == "count") {
      init.count = count;
    } else if (end == "date") {
      init.seriesEndTime = seriesEndTime;
    }
    */
    if (frequency == Frequency.Weekly) {
      init.weekdays = weekdays;
    } else if (frequency == Frequency.Monthly || frequency == Frequency.Yearly) {
      init.week = week;
      if (week) {
        init.weekdays = [event.startTime.getDay()];
      }
    }
    return new RecurrenceRule(init);
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
  .weekdays {
    flex-wrap: wrap;
  }
  .weekdays .options {
    flex-wrap: wrap;
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
  .every {
    flex-wrap: wrap;
  }
  :global(.inline) {
    display: inline-flex !important;
  }
</style>
