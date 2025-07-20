{#if $openFolderProperties}
 <FolderPropertiesPage bind:folder={$selectedFolder} {accounts} bind:selectedAccount={$selectedAccount} />
{:else if view == "chat"}
  <MailChat {accounts} />
{:else if view == "vertical"}
 <VerticalLayout {accounts} {folders} {messages} bind:searchMessages bind:selectedAccount={$selectedAccount} bind:selectedFolder={$selectedFolder} bind:selectedMessage={$selectedMessage} bind:selectedMessages={$selectedMessages} />
{:else}
  <ThreePane {accounts} {folders} {messages} bind:searchMessages bind:selectedAccount={$selectedAccount} bind:selectedFolder={$selectedFolder} bind:selectedMessage={$selectedMessage} bind:selectedMessages={$selectedMessages} horizontal={view != "widetable"} />
{/if}

<script lang="ts">
  import { showAccounts } from "../../logic/Mail/AccountsList/ShowAccounts";
  import { Folder } from "../../logic/Mail/Folder";
  import type { EMail } from "../../logic/Mail/EMail";
  import { DownloadObserver } from "../../logic/Mail/DownloadObserver";
  import { Person } from "../../logic/Abstract/Person";
  import { PersonUID } from "../../logic/Abstract/PersonUID";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "./Selected";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { showError } from "../Util/error";
  import ThreePane from "./3pane/3Pane.svelte";
  import VerticalLayout from "./Vertical/VerticalLayout.svelte";
  import MailChat from "./MailChat/MailChat.svelte";
  import FolderPropertiesPage, { openFolderProperties } from "./FolderPropertiesPage.svelte";
  import { ArrayColl } from "svelte-collections";

  $: accounts = showAccounts.filterObservable(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace); // || acc == allAccountsAccount
  $: folders = $selectedAccount?.rootFolders ?? new ArrayColl<Folder>();
  $: messages = searchMessages ?? $selectedFolder?.messages ?? new ArrayColl<EMail>();

  let searchMessages: ArrayColl<EMail> | null;

  $: loadFolder($selectedFolder).catch(showError);
  async function loadFolder(folder: Folder) {
    try {
      if (!folder) {
        return;
      }
      if ($selectedMessage?.folder != folder) {
        $selectedMessage = null;
      }
      await folder.listMessages();
      downloadRecentMessages(folder);
    } catch (ex) {
      if (ex.authFail) {
        // await folder.account.login(true);
        // await folder.listMessages();
      } else {
        showError(ex);
      }
    }
  }

  let downloadObservers = new Map<Folder, DownloadObserver>();
  function downloadRecentMessages(folder: Folder) {
    if (downloadObservers.get(folder)) {
      return;
    }
    let lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    let observer = new DownloadObserver(msg => msg.received > lastMonth);
    folder.messages.registerObserver(observer);
    downloadObservers.set(folder, observer);
  }

  $: $selectedMessage && selectPerson($selectedMessage)
  function selectPerson(message: EMail) {
    if (view == "chat") {
      return;
    }
    if (message.contact instanceof Person) {
      $selectedPerson = message.contact;
      return;
    }
    if (!(message.contact instanceof PersonUID)) {
      return;
    }
    let person = message.contact?.findPerson();
    if (!person) {
      return;
    }
    $selectedPerson = person;
  }

  let viewSetting = getLocalStorage("mail.view", "vertical");
  $: view = $viewSetting.value;
</script>
