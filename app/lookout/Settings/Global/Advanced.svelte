<OptionsPage icon={AdvancedIcon} description={$t`Options for working with ${appName}.`}>
  <OptionsSection title={$t`${appName} panes`}>
    <OptionsRow icon={PanesIcon}>
      <hbox>{$t`Customize ${appName} panes.`}</hbox>
      <DialogButton slot="button" label={$t`Reading Pane…`} onClick={() => { isReadingPaneOpen = true; }} />
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Reminders`}>
    <OptionsRow icon={RemindersIcon}>
      <CheckBox label={$t`Show reminders`} bind:checked={options.showReminders.value} />
      <CheckBox label={$t`Play reminder sound`} bind:checked={options.reminderSound.value} />
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Export`}>
    <OptionsRow icon={ExportIcon}>
      <hbox>{$t`Export ${appName} information to a file for use in other programs.`}</hbox>
      <DialogButton slot="button" label={$t`Export`} onClick={() => { isExportOpen = true; }} />
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

{#if isReadingPaneOpen}
  <ReadingPaneOptionsDialog on:close={() => isReadingPaneOpen = false} />
{/if}
{#if isExportOpen}
  <ImportExportWizard on:close={() => isExportOpen = false} />
{/if}

<script lang="ts">
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import type { OptionsModel } from "../Window/OptionsModel";
  import OptionsPage from "../Shared/OptionsPage.svelte";
  import OptionsSection from "../Shared/OptionsSection.svelte";
  import OptionsRow from "../Shared/OptionsRow.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import ReadingPaneOptionsDialog from "../../Mail/Dialogs/ReadingPaneOptionsDialog.svelte";
  import ImportExportWizard from "../ImportExport/ImportExportWizard.svelte";
  import { appName } from "../../../logic/build";
  import AdvancedIcon from "lucide-svelte/icons/sliders-horizontal";
  import PanesIcon from "lucide-svelte/icons/panels-top-left";
  import RemindersIcon from "lucide-svelte/icons/bell-ring";
  import ExportIcon from "lucide-svelte/icons/file-output";
  import { t } from "../../../l10n/l10n";

  export let options: OptionsModel;

  let isReadingPaneOpen = false;
  let isExportOpen = false;
</script>
