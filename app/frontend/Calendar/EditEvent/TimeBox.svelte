<vbox class="time-box">
  <grid class="time">
    <!--{$t`When`} {$t`Start`} import ClockMainIcon from "lucide-svelte/icons/clock-8"; -->
    <hbox class="date-input start" title={$t`Start date`}>
      <DateInput bind:date={event.startTime} />
    </hbox>
    <hbox class="time-input start" title={$t`Start time`}>
      {#if !$event.allDay}
        <TimeInput bind:time={event.startTime} />
      {/if}
    </hbox>

    <hbox class="date-input end" title={$t`End date`}>
      {#if isMultipleDays}
        <DateInput bind:date={event.endTime} />
      {:else}
        <hbox class="buttons">
          <RoundButton
            label={$t`Multiple days`}
            icon={MultipleDaysIcon}
            onClick={onMultipleDays}
            classes="plain smallest"
            border={false}
            iconSize="16px"
            />
        </hbox>
      {/if}
    </hbox>
    <hbox class="time-input end" title={$t`End time`}>
      {#if !$event.allDay}
        <TimeInput bind:time={event.endTime} />
      {/if}
      <hbox class="buttons">
        <RoundButton
          label={$event.allDay ? $t`Specify time` : $t`All day`}
          icon={$event.allDay ? ClockIcon : AllDayIcon}
          onClick={onAllDayToggle}
          classes="plain smallest"
          border={false}
          iconSize="16px"
          />
      </hbox>
    </hbox>

    {#if showTimezone}
      <hbox class="timezone">
        <TimezonePicker bind:timezone={event.timezone} />
        <hbox class="buttons">
          <RoundButton
            label={$t`Back to local timezone`}
            icon={XIcon}
            onClick={onResetTimezone}
            classes="plain smallest"
            border={false}
            iconSize="16px"
            padding="2px"
            />
        </hbox>
      </hbox>
    {:else}
      <hbox class="buttons">
        <RoundButton
          label={$t`Timezone`}
          icon={GlobeIcon}
          onClick={onTimezoneToggle}
          classes="plain smallest"
          border={false}
          iconSize="16px"
          />
      </hbox>
    {/if}
    <hbox title={$t`Duration`}>
      <input class="duration" type="number" bind:value={durationInUnit} on:input={durationUnit.onDurationInUnitChanged} min={1} max={2000} />
      <DurationUnit bind:durationInSeconds={event.duration} bind:durationInUnit bind:this={durationUnit} onlyDays={$event.allDay} />
    </hbox>
  </grid>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import DateInput from "./DateInput.svelte";
  import TimeInput from "./TimeInput.svelte";
  import DurationUnit from "./DurationUnit.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import AllDayIcon from '../../asset/icon/calendar/24h.svg?raw';
  import ClockIcon from "lucide-svelte/icons/clock";
  import GlobeIcon from "lucide-svelte/icons/globe";
  import MultipleDaysIcon from "lucide-svelte/icons/circle-plus";
  import XIcon from "lucide-svelte/icons/x";
  import TimezonePicker from "timezone-picker-svelte";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  $: showTimezone = $event.timezone != myTimezone();
  $: $event.endTime, checkEndTime();
  $: isMultipleDays = $event.startTime && $event.endTime && $event.endTime.toLocaleDateString() != $event.startTime.toLocaleDateString();
  let durationUnit: DurationUnit;
  let durationInUnit: number;
  let previousTimezone: string = null;
  let previousStartTime: Date = null;
  let previousEndTime: Date = null;

  function onMultipleDays() {
    if (!event.allDay) {
      event.allDay = true;
      setAllDay();
    }
    event.durationDays += 1;
  }

  function onAllDayToggle() {
    event.allDay = !event.allDay;
    setAllDay();
  }

  // Move into `Event.allDay` setter?
  function setAllDay() {
    if (event.allDay) {
      previousTimezone = event.timezone;
      event.timezone = null;
      previousStartTime = new Date(event.startTime);
      previousEndTime = new Date(event.endTime);
      clearTime(event.startTime);
      clearTime(event.endTime);
      event.endTime.setHours(23)
      event.endTime.setMinutes(59);
      event.endTime.setSeconds(59);
      event.endTime.setMilliseconds(0);
    } else {
      if (previousStartTime && previousEndTime) {
        copyTimeOnly(event.startTime, previousStartTime);
        copyTimeOnly(event.endTime, previousEndTime);
      }
      if (previousTimezone && !event.timezone) {
        event.timezone = previousTimezone;
      }
    }
    event.notifyObservers();
  }

  function checkEndTime() {
    if (event.endTime.getTime() <= event.startTime.getTime()) {
      event.endTime.setTime(event.startTime.getTime() + 1);
      if (event.allDay) {
        event.durationDays += 1;
      } else {
        event.durationHours += 1;
      }
    }
  }

  function onTimezoneToggle() {
    showTimezone = true;
  }
  function onResetTimezone() {
    event.timezone = myTimezone();
    showTimezone = false;
  }
  function myTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // Generic Date util

  function copyTimeOnly(target: Date, source: Date) {
    target.setHours(source.getHours());
    target.setMinutes(source.getMinutes());
    target.setSeconds(source.getSeconds());
    target.setMilliseconds(source.getMilliseconds());
  }

  function clearTime(target: Date) {
    target.setHours(0);
    target.setMinutes(0);
    target.setSeconds(0);
    target.setMilliseconds(0);
  }
</script>

<style>
  .time-box {
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 12px 16px;
  }
  .date-input {
    margin-inline-end: 8px;
  }
  input {
    width: 100%;
  }
  grid.time {
    grid-template-columns: max-content max-content;
    justify-items: start;
    align-items: center;
    margin-block-end: 12px;
  }
  .buttons {
    align-items: center;
  }
  .date-input .buttons {
    align-items: center;
    justify-content: flex-end;
  }
  .time :global(input) {
    padding: 4px 8px;
    margin-block-start: 2px;
  }
  .time-box :global(input:not([type="date"])) {
    max-width: 5em;
    text-align: right;
  }
  .date-input,
  .time-input {
    min-height: 34px;
  }
  .start :global(input) {
    font-weight: bold;
  }
  .date-input :global(input),
  .time-input :global(input) {
    font-size: 16px;
  }
  .duration {
    margin-inline-end: 6px;
  }
  .timezone {
    align-items: center;
    margin-inline-start: 6px;
    margin-block-start: 6px;
  }
  :global(.inline) {
    display: inline-flex !important;
  }
</style>
