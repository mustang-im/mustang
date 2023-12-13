<hbox flex class="mail-app">
  <vbox flex class="folder-pane">
    <AccountList accounts={$accounts} bind:selectedAccount />
    <FolderList folders={selectedAccount ? selectedAccount.rootFolders : new ArrayColl()} bind:selectedFolder />
    <ViewSwitcher />
  </vbox>
  <vbox flex class="message-list-pane">
    <VerticalMessageList messages={selectedFolder ? selectedFolder.messages : new ArrayColl()} bind:selectedMessage />
  </vbox>
  <vbox flex class="message-display-pane">
    {#if selectedMessage}
      <MessageDisplay message={selectedMessage} account={selectedAccount} />
    {:else}
      <StartPage />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  //import type { Account, MsgFolder, Email } from "mustang-lib";
  import type { MailAccount } from "../../../logic/Mail/Account";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/Message";

  import AccountList from "../LeftPane/AccountList.svelte";
  import FolderList from "../LeftPane/FolderList.svelte";
  import VerticalMessageList from "./VerticalMessageList.svelte";
  import MessageDisplay from "../Message/MessageDisplay.svelte";
  import StartPage from "../StartPage.svelte";
  import ViewSwitcher from "../LeftPane/ViewSwitcher.svelte";
  import { ArrayColl, Collection } from 'svelte-collections';

  export let accounts: Collection<MailAccount>; /** in */
  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */
  export let selectedMessage: EMail; /** in/out */
</script>

<style>
  .folder-pane {
    flex: 1 0 0;
    max-width: 15em;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    background-color: #F9F9FD;
  }
  .message-list-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    z-index: 2;
  }
  .message-display-pane {
    flex: 2 0 0;
  }
  .mail-app :global(.fast-list) {
    background-color: transparent;
    border: none;
  }
  .mail-app :global(.fast-list thead tr > hbox) {
    vertical-align: middle;
    border: none;
    color: grey;
    font-size: 12px;
  }
  .mail-app :global(.fast-list thead) {
    height: 32px;
  }
  .mail-app :global(.fast-list tbody hbox) {
    font-size: 13px;
  }
  .mail-app :global(.fast-list tbody tr.selected) {
    background-color: #20AE9E;
    color: white;
  }
  .mail-app :global(.fast-list tbody tr:not(.selected):hover) {
    background-color: #A9DAD4;
  }
</style>
