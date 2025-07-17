<vbox class="demo">
  <AppButton on:click={() => catchErrors(onToggle)} selected={$isDemo}>
    <hbox slot="label">{$t`Soon`}</hbox>
    <DemoIcon slot="icon" />
  </AppButton>
</vbox>

<script lang="ts">
  import { isDemo, realAddressbooks, realCalendars, realEmailAccounts } from "./demo";
  import { loadDemoMustangApps, loadMustangApps } from "./loadMustangApps";
  import { FakeAddressbook, FakeCalendar, FakeChatAccount, FakeFileSharingAccount, FakeMailAccount, fakePersons } from "../../logic/testData";
  import { FakeMeetAccount } from "../../logic/Meet/FakeMeeting";
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { selectedCalendar, selectedEvent } from "../Calendar/selected";
  import { selectedAccount as selectedChatAccount } from "../Chat/selected";
  import { selectedAccount as selectedMailAccount, selectedFolder as selectedMailFolder, selectedMessage as selectedEMail } from "../Mail/Selected";
  import { selectedAccount as selectedFilesAccount, selectedFolder as selectedFileFolder, selectedFile, selectedFiles } from "../Files/selected";
  import { appGlobal } from "../../logic/app";
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
    }
    $isDemo = startDemo;
  }

  function alphaAppsOn() {
    loadDemoMustangApps();
  }

  function alphaAppsOff() {
    loadMustangApps();
  }

  async function testDataOn() {
    realEmailAccounts.replaceAll(appGlobal.emailAccounts);
    realAddressbooks.replaceAll(appGlobal.addressbooks);
    realCalendars.replaceAll(appGlobal.calendars);

    let addressbook = new FakeAddressbook();
    let persons = fakePersons(10, addressbook);
    appGlobal.addressbooks.replaceAll([ addressbook ]);
    appGlobal.emailAccounts.replaceAll([ new FakeMailAccount(persons, appGlobal.me) ]);
    appGlobal.chatAccounts.replaceAll([ new FakeChatAccount(persons, appGlobal.me) ]);
    appGlobal.calendars.replaceAll([ new FakeCalendar(persons) ]);
    appGlobal.meetAccounts.replaceAll([ new FakeMeetAccount() ]);
    appGlobal.fileSharingAccounts.replaceAll([ new FakeFileSharingAccount() ]);
    await appGlobal.emailAccounts.first.login(false);
    await appGlobal.chatAccounts.first.login(false);
  }

  async function testDataOff() {
    appGlobal.emailAccounts.replaceAll(realEmailAccounts);
    appGlobal.addressbooks.replaceAll(realAddressbooks);
    appGlobal.calendars.replaceAll(realCalendars);

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
