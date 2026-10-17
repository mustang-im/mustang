<OptionsSection title={$t`Work hours`}>
  <OptionsRow icon={WorkHoursIcon}>
    <grid class="days">
      <slot name="calendar" />
      {#if workHours}
        {#each kWeekdays as weekday}
          {@const day = $workHours.days[weekday]}
          <Checkbox label={weekdayName(weekday)} checked={day.isWorkDay} disabled={readOnly}
            onChange={checked => onWorkDayChanged(weekday, checked)} />
          <TimeInput time={timeOf(day.startMinutes)} options={startTimes}
            label={$t`Start time on ${weekdayName(weekday)}`} disabled={readOnly || !day.isWorkDay}
            onChange={time => onStartChanged(weekday, time)} />
          <span class="until" class:disabled={readOnly || !day.isWorkDay}>{$t`to`}</span>
          <TimeInput time={timeOf(day.endMinutes)} options={endTimes}
            label={$t`End time on ${weekdayName(weekday)}`} disabled={readOnly || !day.isWorkDay}
            onChange={time => onEndChanged(weekday, time)} />
        {/each}
        <span class="first" class:disabled={readOnly}>{$t`Time zone:`}</span>
        <hbox class="wide">
          <ComboBox options={timezones} value={$workHours.timezone ?? ""} label={$t`Time zone of the work hours`}
            width="100%" disabled={readOnly}
            onChange={onTimezoneChanged} />
        </hbox>
      {/if}
    </grid>
    <span class="note">
      {#if readOnly && workHours}
        {$t`These are the work hours of ${$account.name}, as the server tells them.`}
      {:else if !workHours}
        {$t`The server does not tell the work hours of ${$account.name}.`}
      {:else if $account.canSaveWorkHoursPerDayOnServer}
        {$t`The work hours are saved on the server.`}
      {:else if $account.canSaveWorkHoursOnServer}
        {$t`The server saves one time range for all work days. The times of each day are saved on this computer.`}
      {:else}
        {$t`The work hours are saved only on this computer, because the server cannot store them.`}
      {/if}
    </span>
  </OptionsRow>
</OptionsSection>

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import { kMinutesPerDay } from "../../../logic/Calendar/WorkHours";
  import { TimeOptions } from "../../Calendar/EditEvent/TimeOptions";
  import { TimeZoneChoice, ZoneClock } from "../../Calendar/TimeZones";
  import OptionsSection from "../Shared/OptionsSection.svelte";
  import OptionsRow from "../Shared/OptionsRow.svelte";
  import Checkbox from "../../Shared/Form/Checkbox.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import TimeInput from "../../Calendar/EditEvent/TimeInput.svelte";
  import WorkHoursIcon from "lucide-svelte/icons/briefcase-business";
  import { catchErrors } from "../../../frontend/Util/error";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";
  import debounce from "lodash/debounce";

  export let account: Calendar;

  const kWeekdays = [1, 2, 3, 4, 5, 6, 0];
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const startTimes = TimeOptions.startTimes(today);
  const endTimes = [ ...startTimes.slice(1), { time: timeOf(kMinutesPerDay), label: TimeOptions.timeLabel(timeOf(kMinutesPerDay)) } ];

  $: workHours = $account.workHours;
  $: readOnly = $account.isOtherPersonsCalendar;
  $: timezones = [
    { value: "", label: $t`Time zone of this computer (${ZoneClock.systemZone})` },
    ...TimeZoneChoice.all(undefined, [ workHours?.timezone ]).map(choice => ({ value: choice.zone, label: choice.label })),
  ];

  function weekdayName(weekday: number): string {
    // 2024-01-07 is a Sunday
    return new Date(Date.UTC(2024, 0, 7 + weekday))
      .toLocaleDateString(getDateTimeLocale(), { weekday: "long", timeZone: "UTC" });
  }

  function timeOf(minutes: number): Date {
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, minutes);
  }

  function minutesOf(time: Date): number {
    return time.toDateString() == today.toDateString()
      ? time.getHours() * 60 + time.getMinutes()
      : kMinutesPerDay;
  }

  function onWorkDayChanged(weekday: number, isWorkDay: boolean) {
    workHours.days[weekday].isWorkDay = isWorkDay;
    save();
  }

  function onStartChanged(weekday: number, time: Date) {
    workHours.days[weekday].startMinutes = minutesOf(time);
    save();
  }

  function onEndChanged(weekday: number, time: Date) {
    workHours.days[weekday].endMinutes = minutesOf(time) || kMinutesPerDay;
    save();
  }

  function onTimezoneChanged(timezone: string) {
    workHours.timezone = timezone || null;
    save();
  }

  const save = debounce(() => catchErrors(() => account.saveWorkHours()), 1000);
</script>

<style>
  .days {
    grid-template-columns: 184px max-content max-content max-content minmax(0, 1fr);
    align-items: center;
    gap: 6px 10px;
  }
  .days > :global(.lo-checkbox) {
    grid-column: 1;
  }
  .first {
    grid-column: 1;
  }
  .wide {
    grid-column: 2 / -1;
    max-width: 420px;
  }
  .until {
    color: var(--lo-fg-secondary);
  }
  .note {
    color: var(--lo-fg-secondary);
  }
  .disabled {
    color: var(--lo-fg-disabled);
  }
</style>
