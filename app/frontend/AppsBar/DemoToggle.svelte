<vbox class="demo">
  <AppButton on:click={() => catchErrors(onToggle)} selected={$isDemo}>
    <hbox slot="label">{$t`Soon`}</hbox>
    <DemoIcon slot="icon" />
  </AppButton>
</vbox>

<script lang="ts">
  import { isDemo } from "./demo";
  import { testDataOff, testDataOn } from "../../logic/testData";
  import { loadDemoMustangApps, loadMustangApps } from "./loadMustangApps";
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { selectedCalendar, selectedEvent } from "../Calendar/selected";
  import { selectedAccount as selectedChatAccount } from "../Chat/selected";
  import { selectedAccount as selectedMailAccount, selectedFolder as selectedMailFolder, selectedMessage as selectedEMail } from "../Mail/Selected";
  import { selectedAccount as selectedFilesAccount, selectedFolder as selectedFileFolder, selectedFile, selectedFiles } from "../Files/selected";
  import AppButton from "./AppButton.svelte";
  import DemoIcon from "lucide-svelte/icons/sparkles";
  import { catchErrors } from "../Util/error";
  import { t } from "../../l10n/l10n";

  async function onToggle() {
    let startDemo = !$isDemo;
    if (startDemo) {
      await testDataOn();
      alphaAppsOn();
    } else {
      alphaAppsOff();
      await testDataOff();
      resetSelections();
    }
    $isDemo = startDemo;
  }

  function alphaAppsOn() {
    loadDemoMustangApps();
  }

  function alphaAppsOff() {
    loadMustangApps();
  }

  function resetSelections() {
    $selectedPerson = null;
    $selectedEvent = null;
    $selectedMailAccount = null;
    $selectedChatAccount = null;
    $selectedFilesAccount = null;
    $selectedCalendar = null;
    $selectedEMail = null;
    $selectedMailFolder = null
    $selectedFileFolder = null
    $selectedFile = null;
    $selectedFiles = null;
  }
</script>

<style>
  .demo :global(.icon svg) {
    color: var(--icon-primary);
  }
</style>
