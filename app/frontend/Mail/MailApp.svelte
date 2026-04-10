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
  import type { Folder } from "../../logic/Mail/Folder";
  import type { EMail } from "../../logic/Mail/EMail";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "./Selected";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import { getLocalStorage } from "../Util/LocalStorage";
  import ThreePane from "./3pane/3Pane.svelte";
  import VerticalLayout from "./Vertical/VerticalLayout.svelte";
  import MailChat from "./MailChat/MailChat.svelte";
  import FolderPropertiesPage, { openFolderProperties } from "./FolderPropertiesPage.svelte";
  import { ArrayColl } from "svelte-collections";

  $: accounts = showAccounts.filterObservable(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace); // || acc == allAccountsAccount
  $: folders = $selectedAccount?.rootFolders ?? new ArrayColl<Folder>();
  $: messages = searchMessages ?? $selectedFolder?.messages ?? new ArrayColl<EMail>();

  let searchMessages: ArrayColl<EMail> | null;

  let viewSetting = getLocalStorage("mail.view", "vertical");
  $: view = $viewSetting.value;
</script>
