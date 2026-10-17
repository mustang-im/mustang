<OptionsPage icon={CalendarIcon} description={$t`Change the settings for calendars, meetings, and time zones.`}>
  <WorkTime drafts={options.workHours} />

  <OptionsSection title={$t`Calendar options`}>
    <OptionsRow icon={DurationIcon}>
      <hbox class="field-row">
        <label for="options-event-duration">{$t`Default duration for new appointments and meetings:`}</label>
        <ComboBox options={durations.map(minutes => ({ value: minutes, label: durationLabel(minutes) }))}
          bind:value={options.defaultEventDuration.value} label={$t`Default duration for new appointments and meetings`} width="160px" />
      </hbox>
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Display options`}>
    <OptionsRow icon={DisplayIcon}>
      <CheckBox label={$t`Show week numbers in the Month View and in the Date Navigator`} bind:checked={options.weekNumbers.value} />
      <CheckBox label={$t`Show declined meetings`} bind:checked={options.showDeclined.value} />
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Time zones`}>
    <OptionsRow icon={TimeZoneIcon}>
      <grid class="time-zone">
        <span>{$t`Label:`}</span>
        <TextField bind:value={options.timeZoneLabel.value} label={$t`Label`} width="200px" />
        <span>{$t`Time zone:`}</span>
        <ComboBox options={zoneChoices} value={systemZone} label={$t`Time zone`} width={kZoneWidth}
          disabled={$t`The calendar shows the time zone of the operating system`} />
      </grid>
      <CheckBox label={$t`Show a second time zone`} bind:checked={options.secondTimeZoneShown.value} />
      <grid class="time-zone indented">
        <span class:disabled={!options.secondTimeZoneShown.value}>{$t`Label:`}</span>
        <TextField bind:value={options.secondTimeZoneLabel.value} label={$t`Label of the second time zone`} width="200px"
          disabled={!options.secondTimeZoneShown.value} />
        <span class:disabled={!options.secondTimeZoneShown.value}>{$t`Time zone:`}</span>
        <ComboBox options={zoneChoices} bind:value={options.secondTimeZone.value} label={$t`Second time zone`} width={kZoneWidth}
          disabled={!options.secondTimeZoneShown.value} />
      </grid>
      <CheckBox label={$t`Show a third time zone`} bind:checked={options.thirdTimeZoneShown.value} />
      <grid class="time-zone indented">
        <span class:disabled={!options.thirdTimeZoneShown.value}>{$t`Label:`}</span>
        <TextField bind:value={options.thirdTimeZoneLabel.value} label={$t`Label of the third time zone`} width="200px"
          disabled={!options.thirdTimeZoneShown.value} />
        <span class:disabled={!options.thirdTimeZoneShown.value}>{$t`Time zone:`}</span>
        <ComboBox options={zoneChoices} bind:value={options.thirdTimeZone.value} label={$t`Third time zone`} width={kZoneWidth}
          disabled={!options.thirdTimeZoneShown.value} />
      </grid>
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

<script lang="ts">
  import { TimeZoneChoice, ZoneClock } from "../../Calendar/View/TimeZones";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import TextField from "../../Shared/Form/TextField.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import type { OptionsModel } from "./OptionsModel";
  import OptionsPage from "./OptionsPage.svelte";
  import OptionsSection from "./OptionsSection.svelte";
  import OptionsRow from "./OptionsRow.svelte";
  import WorkTime from "./WorkTime.svelte";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import DurationIcon from "lucide-svelte/icons/calendar-clock";
  import DisplayIcon from "lucide-svelte/icons/calendar-days";
  import TimeZoneIcon from "lucide-svelte/icons/globe";
  import { gt, t } from "../../../l10n/l10n";

  export let options: OptionsModel;

  const kZoneWidth = "420px";
  const systemZone = ZoneClock.systemZone;
  const zoneChoices = TimeZoneChoice.all(undefined, [ systemZone, options.secondTimeZone.value, options.thirdTimeZone.value ])
    .map(choice => ({ value: choice.zone, label: choice.label }));

  const kStandardDurations = [ 15, 30, 45, 60, 90, 120 ];
  $: durations = kStandardDurations.includes(options.defaultEventDuration.value)
    ? kStandardDurations
    : [ ...kStandardDurations, options.defaultEventDuration.value ].sort((a, b) => a - b);

  function durationLabel(minutes: number): string {
    if (minutes < 60 || minutes % 30) {
      return gt`${minutes} minutes`;
    }
    return minutes == 60 ? gt`1 hour` : gt`${minutes / 60} hours`;
  }
</script>

<style>
  .time-zone {
    grid-template-columns: max-content max-content;
    align-items: center;
    gap: 6px 12px;
  }
  .disabled {
    color: var(--lo-fg-disabled);
  }
</style>
