<OptionsPage icon={LanguageIcon} description={$t`Set the language preferences for ${appName}.`}>
  <OptionsSection title={$t`Display language`}>
    <OptionsRow icon={DisplayLanguageIcon}>
      <hbox class="field-row">
        <label for="options-display-language" class="field-label">{$t`Display language:`}</label>
        <ComboBox options={[ { value: "", label: $t`Use system setting` }, ...languages.map(code => ({ value: code, label: localeNames[code] })) ]}
          bind:value={options.displayLanguage.value} label={$t`Display language`} width="240px" />
      </hbox>
      {#if options.displayLanguage.isChanged}
        <hbox class="hint restart">{$t`${appName} restarts when you click OK, so that the new display language can take effect.`}</hbox>
      {/if}
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Date and time format`}>
    <OptionsRow icon={DateFormatIcon}>
      <hbox class="field-row">
        <label for="options-date-format" class="field-label">{$t`Format:`}</label>
        <ComboBox options={[ { value: "", label: $t`Same as the display language` }, ...languages.map(code => ({ value: code, label: localeNames[code] })) ]}
          bind:value={options.dateTimeFormat.value} label={$t`Format`} width="240px" />
      </hbox>
      <grid class="samples">
        <span class="lo-secondary">{$t`Short date:`}</span>
        <span>{sampleDate.toLocaleDateString(sampleLocale, { year: "numeric", month: "2-digit", day: "2-digit" })}</span>
        <span class="lo-secondary">{$t`Long date:`}</span>
        <span>{sampleDate.toLocaleDateString(sampleLocale, { dateStyle: "long" })}</span>
        <span class="lo-secondary">{$t`Time:`}</span>
        <span>{sampleDate.toLocaleTimeString(sampleLocale, { hour: "numeric", minute: "numeric" })}</span>
      </grid>
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

<script lang="ts">
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import type { OptionsModel } from "../Window/OptionsModel";
  import OptionsPage from "../Shared/OptionsPage.svelte";
  import OptionsSection from "../Shared/OptionsSection.svelte";
  import OptionsRow from "../Shared/OptionsRow.svelte";
  import { appName } from "../../../logic/build";
  import { localeNames } from "../../../l10n/list";
  import LanguageIcon from "lucide-svelte/icons/languages";
  import DisplayLanguageIcon from "lucide-svelte/icons/monitor";
  import DateFormatIcon from "lucide-svelte/icons/calendar-clock";
  import { t } from "../../../l10n/l10n";

  export let options: OptionsModel;

  const languages = Object.keys(localeNames);
  const sampleDate = new Date(new Date().getFullYear() + 1, 0, 20, 13, 0, 0);
  $: sampleLocale = options.dateTimeFormat.value || options.displayLanguage.value || navigator.language;
</script>

<style>
  .restart {
    color: var(--lo-warning);
  }
  grid.samples {
    display: grid;
    grid-template-columns: 136px auto;
    gap: 2px 8px;
    margin-block-start: 4px;
  }
</style>
