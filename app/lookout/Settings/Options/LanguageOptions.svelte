<OptionsPage icon={LanguageIcon} description={$t`Set the language preferences for ${appName}.`}>
  <OptionsSection title={$t`Display language`}>
    <OptionsRow icon={DisplayLanguageIcon}>
      <hbox class="field-row">
        <label for="options-display-language" class="field-label">{$t`Display language:`}</label>
        <select id="options-display-language" class="lo-text-field" bind:value={options.displayLanguage.value}>
          <option value="">{$t`Use system setting`}</option>
          {#each languages as code}
            <option value={code}>{localeNames[code]}</option>
          {/each}
        </select>
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
        <select id="options-date-format" class="lo-text-field" bind:value={options.dateTimeFormat.value}>
          <option value="">{$t`Same as the display language`}</option>
          {#each languages as code}
            <option value={code}>{localeNames[code]}</option>
          {/each}
        </select>
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
  import type { OptionsModel } from "./OptionsModel";
  import OptionsPage from "./OptionsPage.svelte";
  import OptionsSection from "./OptionsSection.svelte";
  import OptionsRow from "./OptionsRow.svelte";
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
