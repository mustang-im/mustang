<vbox class="work-hours">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Work hours`}</hbox>
    <vbox class="content">
      {#if workHours}
        <grid class="days">
          {#each kWeekdays as weekday}
            {@const day = workHours.days[weekday]}
            <Checkbox
              checked={day.isWorkDay}
              label={weekdayName(weekday)}
              disabled={readOnly}
              on:change={event => onWorkDayChanged(weekday, event.detail)}
              />
            <input type="time"
              value={timeOfDay(day.startMinutes)}
              disabled={readOnly || !day.isWorkDay}
              aria-label={$t`Start`}
              on:change={event => onStartChanged(weekday, event.currentTarget.value)}
              />
            <hbox class="until">–</hbox>
            <input type="time"
              value={timeOfDay(day.endMinutes)}
              disabled={readOnly || !day.isWorkDay}
              aria-label={$t`End`}
              on:change={event => onEndChanged(weekday, event.currentTarget.value)}
              />
          {/each}
        </grid>
        <hbox class="timezone">
          <label for="work-hours-timezone">{$t`Time zone`}</label>
          <select id="work-hours-timezone"
            value={workHours.timezone ?? ""}
            disabled={readOnly}
            on:change={event => onTimezoneChanged(event.currentTarget.value)}
            >
            <option value="">{$t`Time zone of this computer (${myTimezone()})`}</option>
            {#each timezones as timezone}
              <option value={timezone}>{timezone}</option>
            {/each}
          </select>
        </hbox>
      {/if}
      <hbox class="note">
        {#if readOnly && workHours}
          {$t`These are the work hours of ${$account.username}, as the server tells them.`}
        {:else if readOnly}
          {$t`The server does not tell the work hours of ${$account.username}.`}
        {:else if $account.canSaveWorkHoursPerDayOnServer}
          {$t`Saved on the server`}
        {:else if $account.canSaveWorkHoursOnServer}
          {$t`Saved on the server, as one time range for all work days. The times of each day are saved on this computer.`}
        {:else}
          {$t`Saved only on this computer, because the server cannot store them`}
        {/if}
      </hbox>
    </vbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import { kMinutesPerDay } from "../../../logic/Calendar/WorkHours";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import Checkbox from "../../Shared/Checkbox.svelte";
  import { myTimezone } from "../../../logic/util/date";
  import { catchErrors } from "../../Util/error";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";
  import debounce from "lodash/debounce";

  export let account: Calendar;

  const kWeekdays = [1, 2, 3, 4, 5, 6, 0];

  $: workHours = $account.workHours;
  $: readOnly = $account.isOtherPersonsCalendar;
  $: timezones = timezoneList(workHours?.timezone);

  function timezoneList(current: string | null): string[] {
    let timezones = Intl.supportedValuesOf("timeZone");
    return current && !timezones.includes(current) ? [current, ...timezones] : timezones;
  }

  function weekdayName(weekday: number): string {
    // 2024-01-07 is a Sunday
    return new Date(Date.UTC(2024, 0, 7 + weekday))
      .toLocaleDateString(getDateTimeLocale(), { weekday: "long", timeZone: "UTC" });
  }

  /** As `<input type="time">` wants it, e.g. "08:30" */
  function timeOfDay(minutes: number): string {
    minutes %= kMinutesPerDay;
    return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
  }

  function minutesOf(timeOfDay: string): number | null {
    let match = /^(\d{1,2}):(\d{2})/.exec(timeOfDay);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  }

  function onWorkDayChanged(weekday: number, isWorkDay: boolean) {
    workHours.days[weekday].isWorkDay = isWorkDay;
    save();
  }

  function onStartChanged(weekday: number, value: string) {
    let minutes = minutesOf(value);
    if (minutes == null) {
      return;
    }
    workHours.days[weekday].startMinutes = minutes;
    save();
  }

  function onEndChanged(weekday: number, value: string) {
    let minutes = minutesOf(value);
    if (minutes == null) {
      return;
    }
    // 00:00 = until midnight
    workHours.days[weekday].endMinutes = minutes || kMinutesPerDay;
    save();
  }

  function onTimezoneChanged(timezone: string) {
    workHours.timezone = timezone || null;
    save();
  }

  const save = debounce(() => catchErrors(() => account.saveWorkHours()), 1000);
</script>

<style>
  .content {
    gap: 16px;
  }
  .days {
    grid-template-columns: max-content max-content max-content max-content;
    gap: 8px 12px;
    align-items: center;
  }
  .days :global(.checkbox) {
    margin-inline-end: 24px;
  }
  .until {
    justify-content: center;
  }
  input:disabled {
    opacity: 50%;
  }
  .timezone {
    align-items: center;
    gap: 12px;
  }
  .note {
    opacity: 70%;
  }
</style>
