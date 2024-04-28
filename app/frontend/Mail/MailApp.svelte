{#if $openFolderProperties}
 <FolderProperties bind:folder={$selectedFolder} {accounts} bind:selectedAccount={$selectedAccount} />
{:else if view == "chat"}
  <MailChat {accounts} />
{:else if view == "vertical"}
 <VerticalLayout {accounts} {folders} {messages} bind:selectedAccount={$selectedAccount} bind:selectedFolder={$selectedFolder} bind:selectedMessage={$selectedMessage} bind:selectedMessages={$selectedMessages} />
{:else}
  <ThreePane {accounts} {folders} {messages} bind:selectedAccount={$selectedAccount} bind:selectedFolder={$selectedFolder} bind:selectedMessage={$selectedMessage} bind:selectedMessages={$selectedMessages} />
{/if}

<script lang="ts">
  import { showAccounts } from "../../logic/Mail/AccountsList/ShowAccounts";
  import type { Folder } from "../../logic/Mail/Folder";
  import type { EMail } from "../../logic/Mail/EMail";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "./Selected";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { showError } from "../Util/error";
  import ThreePane from "./3pane/3Pane.svelte";
  import VerticalLayout from "./Vertical/VerticalLayout.svelte";
  import MailChat from "./MailChat/MailChat.svelte";
  import FolderProperties, { openFolderProperties } from "./FolderProperties.svelte";
  import { SQLSearchEMail } from "../../logic/Mail/SQL/SQLSearchEMail";
  import { ArrayColl } from "svelte-collections";
  import { useDebounce } from '@svelteuidev/composables';

  $: accounts = showAccounts;
  $: folders = $selectedAccount?.rootFolders ?? new ArrayColl<Folder>();
  $: messages = $selectedFolder?.messages ?? new ArrayColl<EMail>();

  $: loadFolder($selectedFolder);
  async function loadFolder(folder: Folder) {
    try {
      $selectedMessage = null;
      if (!folder) {
        return;
      }
      await folder.listMessages();
    } catch (ex) {
      showError(ex);
    }
  }

  let isSearching = false;
  let beforeSearchFolder: Folder;
  $: $globalSearchTerm, startSearchDebounced();
  const startSearchDebounced = useDebounce(() => startSearch($globalSearchTerm), 300);
  async function startSearch(searchTerm: string) {
    try {
      if (!(view == "vertical" || view == "3pane")) {
        return;
      }
      if (!searchTerm && isSearching) {
        isSearching = false;
        $selectedFolder = $selectedMessage?.folder ?? beforeSearchFolder;
        $selectedAccount = $selectedFolder?.account ?? appGlobal.emailAccounts.first;
        return;
      }
      isSearching = true;
      beforeSearchFolder = $selectedFolder;
      $selectedAccount = null;
      $selectedFolder = null;
      $selectedMessages = new ArrayColl<EMail>();
      $selectedMessage = null;
      folders = new ArrayColl<Folder>();
      messages = new ArrayColl<EMail>();
      /*await tick();
      let msg = new EMail(new Folder(new MailAccount()));
      msg.subject = "Searching...";
      messages.add(msg);*/

      let search = new SQLSearchEMail();
      search.bodyText = searchTerm;
      messages = await search.startSearch();
      $selectedMessage = messages.first;
    } catch (ex) {
      showError(ex);
    }
  }

  let viewSetting = getLocalStorage("mail.view", "chat");
  $: view = $viewSetting.value;
</script>
