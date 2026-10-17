<OptionsPage icon={GeneralIcon} description={$t`General options for working with ${appName}.`}>
  <OptionsSection title={$t`Personalize your copy of ${appName}`}>
    <OptionsRow icon={UserInterfaceIcon}>
      <hbox class="field-row">
        <label for="options-frontend" class="field-label">{$t`User interface:`}</label>
        <ComboBox options={[ { value: "classic", label: appName }, { value: "lookout", label: $t`Lookout` } ]}
          bind:value={options.frontend.value} label={$t`User interface`} width="200px" />
      </hbox>
    </OptionsRow>
    <OptionsRow icon={ThemeIcon}>
      <hbox class="field-row">
        <label for="options-theme" class="field-label">{$t`Theme:`}</label>
        <ComboBox options={[ { value: "system", label: $t`Use system setting` }, { value: "light", label: $t`Light` }, { value: "dark", label: $t`Dark` } ]}
          bind:value={options.theme.value} label={$t`Theme`} width="200px" />
      </hbox>
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Start up options`}>
    <OptionsRow icon={DefaultAppIcon}>
      <CheckBox label={$t`Make ${appName} the default program for email`} bind:checked={options.makeDefaultMailApp} disabled={options.isDefaultMailApp} />
      {#if options.isDefaultMailApp}
        <hbox class="hint indented">{$t`${appName} is the default program for email links on this computer.`}</hbox>
      {/if}
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

<script lang="ts">
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import type { OptionsModel } from "../Window/OptionsModel";
  import OptionsPage from "../Shared/OptionsPage.svelte";
  import OptionsSection from "../Shared/OptionsSection.svelte";
  import OptionsRow from "../Shared/OptionsRow.svelte";
  import { appName } from "../../../logic/build";
  import GeneralIcon from "lucide-svelte/icons/settings";
  import ThemeIcon from "lucide-svelte/icons/sun-moon";
  import UserInterfaceIcon from "lucide-svelte/icons/panels-top-left";
  import DefaultAppIcon from "lucide-svelte/icons/mail-check";
  import { t } from "../../../l10n/l10n";

  export let options: OptionsModel;
</script>

