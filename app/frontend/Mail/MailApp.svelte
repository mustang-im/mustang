{#if $openFolderProperties}
 <FolderPropertiesPage bind:folder={$selectedFolder} {accounts} bind:selectedAccount={$selectedAccount} />
{:else if view == "chat"}
  <MailChat {accounts} />
{:else if view == "vertical"}
 <VerticalLayout {accounts} {folders} {messages} bind:searchMessages bind:selectedAccount={$selectedAccount} bind:selectedFolder={$selectedFolder} bind:selectedMessage={$selectedMessage} bind:selectedMessages={$selectedMessages} />
{:else}
  <ThreePane {accounts} {folders} {messages} bind:searchMessages bind:selectedAccount={$selectedAccount} bind:selectedFolder={$selectedFolder} bind:selectedMessage={$selectedMessage} bind:selectedMessages={$selectedMessages} />
{/if}

<script lang="ts">
  import { showAccounts } from "../../logic/Mail/AccountsList/ShowAccounts";
  import type { Folder } from "../../logic/Mail/Folder";
  import type { EMail } from "../../logic/Mail/EMail";
  import { Person } from "../../logic/Abstract/Person";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "./Selected";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import { selectedPerson } from "../Shared/Person/Selected";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { showError } from "../Util/error";
  import ThreePane from "./3pane/3Pane.svelte";
  import VerticalLayout from "./Vertical/VerticalLayout.svelte";
  import MailChat from "./MailChat/MailChat.svelte";
  import FolderPropertiesPage, { openFolderProperties } from "./FolderPropertiesPage.svelte";
  import { ArrayColl } from "svelte-collections";

  $: accounts = showAccounts.filter(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace); // || acc == allAccountsAccount
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
    } catch (ex) {
      if (ex.authFail) {
        // await folder.account.login(true);
        // await folder.listMessages();
      } else {
        showError(ex);
      }
    }
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
    let personUID = message.outgoing ? message.to.first : message.from;
    let person = personUID?.findPerson();
    if (!person) {
      return;
    }
    $selectedPerson = person;
  }

  let viewSetting = getLocalStorage("mail.view", "vertical");
  $: view = $viewSetting.value;
</script>
