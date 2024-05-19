{#if $openFolderProperties}
 <FolderProperties bind:folder={$selectedFolder} {accounts} bind:selectedAccount={$selectedAccount} />
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
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "./Selected";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { showError } from "../Util/error";
  import ThreePane from "./3pane/3Pane.svelte";
  import VerticalLayout from "./Vertical/VerticalLayout.svelte";
  import MailChat from "./MailChat/MailChat.svelte";
  import FolderProperties, { openFolderProperties } from "./FolderProperties.svelte";
  import { ArrayColl, Collection } from "svelte-collections";

  $: accounts = showAccounts;
  $: folders = $selectedAccount?.rootFolders ?? new ArrayColl<Folder>();
  $: messages = searchMessages ?? $selectedFolder?.messages ?? new ArrayColl<EMail>();

  let searchMessages: ArrayColl<EMail> | null;

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

  let viewSetting = getLocalStorage("mail.view", "chat");
  $: view = $viewSetting.value;
</script>
