<OptionsPage icon={GeneralIcon} description={$t`General options for working with ${appName}.`}>
  <OptionsSection title={$t`Personalize your copy of ${appName}`}>
    <OptionsRow icon={ThemeIcon}>
      <hbox class="field-row">
        <label for="options-theme" class="field-label">{$t`Theme:`}</label>
        <select id="options-theme" class="lo-text-field" bind:value={options.theme.value}>
          <option value="system">{$t`Use system setting`}</option>
          <option value="light">{$t`Light`}</option>
          <option value="dark">{$t`Dark`}</option>
        </select>
      </hbox>
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Start up options`}>
    <OptionsRow icon={DefaultAppIcon}>
      <label>
        <input type="checkbox" bind:checked={options.makeDefaultMailApp} disabled={options.isDefaultMailApp} />
        {$t`Make ${appName} the default program for email`}
      </label>
      {#if options.isDefaultMailApp}
        <hbox class="hint indented">{$t`${appName} is the default program for email links on this computer.`}</hbox>
      {/if}
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

<script lang="ts">
  import type { OptionsModel } from "./OptionsModel";
  import OptionsPage from "./OptionsPage.svelte";
  import OptionsSection from "./OptionsSection.svelte";
  import OptionsRow from "./OptionsRow.svelte";
  import { appName } from "../../../logic/build";
  import GeneralIcon from "lucide-svelte/icons/settings";
  import ThemeIcon from "lucide-svelte/icons/sun-moon";
  import DefaultAppIcon from "lucide-svelte/icons/mail-check";
  import { t } from "../../../l10n/l10n";

  export let options: OptionsModel;
</script>

